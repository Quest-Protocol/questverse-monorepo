use constants::CLAIM_REWARD_GAS;
// Find all our documentation at https://docs.near.org
use keypom_models::*;

use ed25519_dalek::{Signature, Verifier};
use near_sdk::base64;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, require, AccountId, Gas, PanicOnDefault, Promise, PublicKey};
use quest::Quest;

use storage::StorageKeys;
use types::{Claim, QuestId};
pub mod external;
mod storage;
pub use crate::external::*;
use crate::utils::pubkey_from_b64;
mod constants;
mod keypom_models;
mod quest;
mod types;
mod utils;
mod view;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct QuestProtocol {
    /// Admin
    admin: AccountId,
    /// map quest_owner -> quest_id
    quest_owner_quest: LookupMap<AccountId, Vec<QuestId>>,
    /// Quests by a quest_id
    quest_by_id: UnorderedMap<QuestId, Quest>,
    /// claim signer public key. This key will be used to authenticate claims.
    claim_signer_public_key: [u8; 32], // Vec<u8>,
    /// pause contract activity
    global_freeze: bool,
    /// users -> claimed quests
    claimed_quests: UnorderedSet<(AccountId, QuestId)>,
    /// quest fee percentage
    quest_fee: u64,
    /// IAH registry
    sbt_registry: AccountId,
}

#[near_bindgen]
impl QuestProtocol {
    #[init]
    pub fn new(
        admin: AccountId,
        sbt_registry: AccountId,
        claim_signer_pk: String,
        quest_fee: u64,
    ) -> Self {
        require!(quest_fee < 100);
        let claim_signer_public_key = pubkey_from_b64(claim_signer_pk);
        Self {
            admin,
            sbt_registry,
            quest_by_id: UnorderedMap::new(StorageKeys::QuestById),
            quest_owner_quest: LookupMap::new(StorageKeys::QuestOwnerQuest),
            claim_signer_public_key,
            global_freeze: false,
            claimed_quests: UnorderedSet::new(StorageKeys::ClaimedQuests),
            quest_fee,
        }
    }

    /*
     * Queries are in view.rs
     */

    /**********
     * TRANSACTIONS
     **********/

    #[payable]
    #[allow(unused_variables)]
    pub fn create_quest(
        &mut self,
        quest_id: u64,
        starts_at: u64,
        expires_at: u64,
        total_participants_allowed: u64,
        indexer_name: String,
        title: String,
        description: String,
        img_url: String,
        tags: Vec<String>,
        humans_only: bool,
    ) -> QuestId {
        self.assert_not_frozen();
        let current_timestamp = env::block_timestamp_ms();
        require!(
            starts_at > current_timestamp,
            "start time must be in the future"
        );
        require!(starts_at < expires_at, "start time must be before end time");
        require!(
            total_participants_allowed > 0,
            "total participants allowed must be greater than 0"
        );

        let attached_deposit = env::attached_deposit();

        //TODO: calcualte the storage deposit requred based on the total participants allowed
        // and substract it from the total_reward_amount
        let total_reward_amount =
            attached_deposit - attached_deposit * self.quest_fee as u128 / 100;
        let creator = env::predecessor_account_id();

        let quest = Quest {
            quest_id,
            creator: creator.clone(),
            created_at: current_timestamp,
            starts_at,
            expires_at,
            closed_at: None,
            total_reward_amount,
            total_participants_allowed,
            num_claimed_rewards: 0,
            participants: Vec::new(),
            indexer_name,
            humans_only,
        };

        self.quest_by_id.insert(&quest_id, &quest);
        let quests = self.quest_owner_quest.get(&creator);
        if let Some(mut old_quests) = quests {
            old_quests.push(quest_id);
            self.quest_owner_quest.insert(&creator, &old_quests);
        } else {
            self.quest_owner_quest.insert(&creator, &vec![quest_id]);
        };

        quest_id
    }

    pub fn close_quest(&mut self, quest_id: QuestId) -> Promise {
        self.assert_not_frozen();
        let caller = env::predecessor_account_id();
        self.assert_quest_creator(quest_id);

        let mut quest = self.quest_by_id.get(&quest_id).expect("quest not found");
        assert!(
            quest.closed_at.is_none(),
            "Quest has been already closed and refudned"
        );
        let refund = quest.total_reward_amount
            - quest.total_reward_amount / quest.total_participants_allowed as u128
                * quest.num_claimed_rewards as u128;

        quest.closed_at = Some(env::block_timestamp_ms());
        self.quest_by_id.insert(&quest_id, &quest);

        Promise::new(caller).transfer(refund)
    }

    pub fn claim_reward(&mut self, claim_b64: String, sig_b64: String) -> Promise {
        self.assert_not_frozen();
        let caller = env::predecessor_account_id();
        let claim_bytes = base64::decode(claim_b64).unwrap();
        let sig_bytes = base64::decode(sig_b64).unwrap();
        let claim = Claim::try_from_slice(&claim_bytes).unwrap();
        self.assert_not_claimed(claim.quest_id);
        self.assert_quest_in_progress(claim.quest_id);

        self.verify_claim(&claim_bytes, &sig_bytes, &self.claim_signer_public_key);

        let mut quest = self.quest_by_id.get(&claim.quest_id).unwrap();
        if quest.humans_only {
            // Call SBT registry to verify IAH and cast the upvote in callback
            ext_sbtreg::ext(self.sbt_registry.clone())
                .is_human(caller.clone())
                .then(
                    Self::ext(env::current_account_id())
                        .with_static_gas(CLAIM_REWARD_GAS)
                        .on_claim_reward_verified(claim.quest_id, caller),
                )
        } else {
            // Update the state
            self.claimed_quests
                .insert(&(caller.clone(), claim.quest_id));
            quest.num_claimed_rewards += 1;
            quest.participants.push(caller.clone());
            self.quest_by_id.insert(&claim.quest_id, &quest);

            let reward_per_user =
                quest.total_reward_amount / quest.total_participants_allowed as u128;

            // Send the reward to the user
            Promise::new(caller).transfer(reward_per_user)
        }
    }

    // pub fn claim_reward_unverified(&mut self, claim: Claim, signature: String) -> Promise {
    //     self.assert_not_frozen();
    //     let caller = env::predecessor_account_id();
    //     let quest_id = claim
    //         .quest_id
    //         .parse::<u64>()
    //         .expect("error parsing quest_id");
    //     self.assert_not_claimed(quest_id);
    //     self.assert_quest_in_progress(quest_id);

    //     let mut quest = self.quest_by_id.get(&quest_id).unwrap();
    //     if quest.humans_only {
    //         // Call SBT registry to verify IAH and cast the upvote in callback
    //         ext_sbtreg::ext(self.sbt_registry.clone())
    //             .is_human(caller.clone())
    //             .then(
    //                 Self::ext(env::current_account_id())
    //                     .with_static_gas(CLAIM_REWARD_GAS)
    //                     .on_claim_reward_verified(quest_id, caller),
    //             )
    //     } else {
    //         // Update the state
    //         self.claimed_quests.insert(&(caller.clone(), quest_id));
    //         quest.num_claimed_rewards += 1;
    //         quest.participants.push(caller.clone());
    //         self.quest_by_id.insert(&quest_id, &quest);

    //         let reward_per_user =
    //             quest.total_reward_amount / quest.total_participants_allowed as u128;

    //         // Send the reward to the user
    //         Promise::new(caller).transfer(reward_per_user)
    //     }
    // }

    pub fn admin_freeze(&mut self) {
        self.assert_admin();
        self.global_freeze = true;
    }

    pub fn admin_unfreeze(&mut self) {
        self.assert_admin();
        self.global_freeze = true;
    }

    pub fn admin_set_quest_fee(&mut self, quest_fee: u64) {
        self.assert_admin();
        self.quest_fee = quest_fee;
    }

    pub fn admin_set_admin(&mut self, new_admin: AccountId) {
        self.assert_admin();
        self.admin = new_admin;
    }

    pub fn admin_set_claim_signer(&mut self, new_signer: String) {
        self.assert_admin();
        self.claim_signer_public_key = pubkey_from_b64(new_signer);
    }

    pub fn admin_update_indexer_name(&mut self, quest_id: QuestId, indexer_name: String) {
        self.assert_admin();
        let mut quest = self.quest_by_id.get(&quest_id).expect("quest not found");
        quest.indexer_name = indexer_name;
        self.quest_by_id.insert(&quest_id, &quest);
    }

    /*****************
     * INTERNAL
     ****************/

    #[inline]
    fn assert_admin(&self) {
        require!(env::predecessor_account_id() == self.admin, "not an admin");
    }

    #[inline]
    fn assert_not_claimed(&self, quest_id: QuestId) {
        require!(!self
            .claimed_quests
            .contains(&(env::predecessor_account_id(), quest_id)))
    }

    fn assert_quest_in_progress(&self, quest_id: QuestId) {
        let quest = self
            .quest_by_id
            .get(&quest_id)
            .expect("quest doest not exist");
        let current_timestamp = env::block_timestamp_ms();
        require!(quest.closed_at.is_none(), "quest has been closed");
        require!(quest.starts_at < current_timestamp, "quest not started");
        require!(quest.expires_at > current_timestamp, "quest finished");
        require!(
            quest.total_participants_allowed > quest.num_claimed_rewards,
            "all rewards have been claimed"
        );
    }

    #[inline]
    fn assert_quest_creator(&self, quest_id: QuestId) {
        let quests = self
            .quest_owner_quest
            .get(&env::predecessor_account_id())
            .expect("not a quest creator");
        require!(quests.contains(&quest_id), "not a quest creator");
    }

    #[inline]
    fn assert_not_frozen(&self) {
        require!(self.global_freeze == false, "the contract is frozen");
    }

    pub fn verify_claim(&self, claim_sig: &Vec<u8>, claim: &Vec<u8>, public_key: &[u8]) -> bool {
        let public_key = ed25519_dalek::PublicKey::from_bytes(public_key).unwrap();
        match Signature::from_bytes(&claim_sig) {
            Ok(sig) => public_key.verify(&claim, &sig).is_ok(),
            Err(_) => false,
        }
    }

    /*****************
     * PRIVATE
     ****************/

    #[private]
    pub fn on_claim_reward_verified(
        &mut self,
        #[callback_unwrap] tokens: Vec<(AccountId, Vec<u64>)>,
        quest_id: QuestId,
        caller: AccountId,
    ) -> Promise {
        require!(
            !tokens.is_empty(),
            "not a verified human, or the tokens are expired"
        );
        self.claimed_quests.insert(&(caller.clone(), quest_id));
        let mut quest = self.quest_by_id.get(&quest_id).unwrap();
        quest.num_claimed_rewards += 1;
        quest.participants.push(caller.clone());
        self.quest_by_id.insert(&quest_id, &quest);

        let reward_per_user = quest.total_reward_amount / quest.total_participants_allowed as u128;

        // Send the reward to the user
        Promise::new(caller).transfer(reward_per_user)
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 */
#[cfg(all(test, not(target_arch = "wasm32")))]
mod unit_tests {
    use near_sdk::{test_utils::VMContextBuilder, testing_env, VMContext, ONE_NEAR};

    extern crate ed25519_dalek;
    extern crate rand;
    use ed25519_dalek::{Keypair, Signer};

    use super::*;

    /// 1ms in nano seconds
    const MSECOND: u64 = 1_000_000;
    const START: u64 = 10;

    fn alice() -> AccountId {
        AccountId::new_unchecked("alice.near".to_string())
    }

    fn bob() -> AccountId {
        AccountId::new_unchecked("bob.near".to_string())
    }

    fn charlie() -> AccountId {
        AccountId::new_unchecked("elon.near".to_string())
    }

    fn admin() -> AccountId {
        AccountId::new_unchecked("admin.near".to_string())
    }

    fn registry() -> AccountId {
        AccountId::new_unchecked("registry.near".to_string())
    }

    fn generate_keypair() -> Keypair {
        Keypair::generate(&mut rand::thread_rng())
    }

    fn setup(predecessor: &AccountId, signer_pk: Option<String>) -> (VMContext, QuestProtocol) {
        let mut ctx = VMContextBuilder::new()
            .predecessor_account_id(admin())
            .block_timestamp(START * MSECOND)
            .is_view(false)
            .build();
        testing_env!(ctx.clone());
        let signer;
        if signer_pk.is_none() {
            signer = base64::encode(generate_keypair().public.to_bytes().to_vec());
        } else {
            signer = signer_pk.unwrap();
        }
        let ctr = QuestProtocol::new(admin(), registry(), signer, 10);
        ctx.predecessor_account_id = predecessor.clone();
        testing_env!(ctx.clone());
        (ctx, ctr)
    }

    fn sign_claim(c: &Claim, k: &Keypair) -> (String, String) {
        let claim_bytes = c.try_to_vec().unwrap();
        let sig = k.sign(&claim_bytes);
        let sig_bytes = sig.to_bytes();
        (
            near_sdk::base64::encode(claim_bytes),
            near_sdk::base64::encode(sig_bytes.to_vec()),
        )
    }

    #[test]
    fn assert_admin() {
        let (_, ctr) = setup(&admin(), None);
        ctr.assert_admin();
    }

    #[test]
    #[should_panic(expected = "not an admin")]
    fn assert_admin_not_admin() {
        let (_, ctr) = setup(&alice(), None);
        ctr.assert_admin();
    }

    #[test]
    fn flow1() {
        let (mut ctx, mut ctr) = setup(&alice(), None);
        ctx.attached_deposit = 10 * ONE_NEAR;
        testing_env!(ctx.clone());
        let quest_id = ctr.create_quest(
            1,
            (START + 1) * MSECOND,
            (START + 10) * MSECOND,
            3,
            "indexer.near".to_string(),
            "Test quest".to_string(),
            "testing".to_string(),
            "image.url".to_string(),
            vec!["test1".to_string(), "test2".to_string()],
            false,
        );
        let quest = ctr.quest_by_id(quest_id);
        assert!(quest.is_some());
        assert_eq!(quest.unwrap().total_reward_amount, 9 * ONE_NEAR);
    }

    #[test]
    fn verify_claim() {
        let keypair = generate_keypair();
        let public_key = keypair.public.to_bytes();
        let (_, ctr) = setup(&alice(), Some(base64::encode(public_key.to_vec())));
        let claim = Claim {
            account_id: alice(),
            quest_id: 1,
        };
        let (claim_base64, sig_base64) = sign_claim(&claim, &keypair);
        let decoded_claim = base64::decode(claim_base64).unwrap();
        let decoded_sig = base64::decode(sig_base64).unwrap();
        ctr.verify_claim(&decoded_claim, &decoded_sig, &public_key);
    }

    // Only the owner of the quest can delete the quest
    //
    // Unable to interact with contract when global freeze is on
    //
    // Can add new token to whitelist
    //
    // Can not create quest with invalid whitelist token
    //
    // Get Request retrives a Quest with the quest_id
    //
    // Can not create a quest in the past.
    //
    // Can not create a quest with 0 partipants
    //
    // Can not create a quest with 0 reward_amount
    //
    // Callback adds quest to data structures
    //
    // Quest Creation fails if enough gas is not attached to create it.
}
