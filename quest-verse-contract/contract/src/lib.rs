// Find all our documentation at https://docs.near.org
use keypom_models::*;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, LookupSet, UnorderedMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, ext_contract, log, near_bindgen, promise_result_as_success, require, AccountId, Balance,
    BorshStorageKey, CryptoHash, Gas, PanicOnDefault, Promise, PromiseError, PromiseOrValue,
    PromiseResult, PublicKey,
};
use quest::Quest;
use std::convert::TryFrom;
use storage::StorageKeys;
use types::{ClaimStatus, FunctionName, QuestId, QuestRewardConfig, RewardType};
pub mod external;
mod storage;
use crate::constants::{KEYPOM_CONTRACT, QUESTS_PROTOCOL_PUBLIC_KEY_STR};
pub use crate::external::*;
mod constants;
mod keypom_models;
mod quest;
mod types;
mod utils;
mod view;

// args for create_new_quest
// start_time,
//       end_time,
//       title,
//       description,
//       img_url,
//       tags,
//       total_participants_allowed,
//       reward_amount,
//       reward_type,
//       indexer_config_id,
//       quest_validator_public_key,

// pub type IndexerConfigById = ;
// pub type QuestIdsByDeployer = UnorderedMap<AccountId, Vec<QuestById>>;
// Define the contract structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct QuestProtocol {
    /// Admin
    admin: AccountId,
    /// map quest_owner -> quest_id
    quest_owner_quest: LookupMap<AccountId, QuestId>,
    /// Quests by a quest_id
    quest_by_id: UnorderedMap<QuestId, Quest>,
    /// claim signer public key. This key will be used to authenticate claims.
    claim_signer_public_key: PublicKey,
    /// pause contract activity
    global_freeze: bool,
    /// identifier for quest assigned by the contract.
    next_quest_id: u64,
}

// Implement the contract structure
#[near_bindgen]
impl QuestProtocol {
    #[init]
    pub fn new(owner_id: AccountId, claim_signer_pk: Option<String>) -> Self {
        let claim_signer_public_key: PublicKey;
        if claim_signer_pk.is_some() {
            claim_signer_public_key = claim_signer_pk.unwrap().parse().unwrap();
        } else {
            claim_signer_public_key = QUESTS_PROTOCOL_PUBLIC_KEY_STR.parse().unwrap();
        }
        Self {
            admin: owner_id,
            quest_by_id: UnorderedMap::new(StorageKeys::QuestById),
            quest_owner_quest: LookupMap::new(StorageKeys::QuestOwnerQuest),
            claim_signer_public_key,
            global_freeze: false,
            next_quest_id: 1,
        }
    }

    #[payable]
    pub fn create_quest(
        &mut self,
        start_time: u64,
        end_time: u64,
        total_participants_allowed: u64,
        indexer_name: String,
    ) -> Promise {

        //
        //TODO check for drop ID being above the minimum
        let contract_drop_public_key: PublicKey = QUESTS_PROTOCOL_PUBLIC_KEY_STR.parse().unwrap();

        require!(start_time < end_time, "start time must be before end time");
        require!(
            total_participants_allowed > 0,
            "total participants allowed must be greater than 0"
        );

        let keypom_time_config = TimeConfig {
            start: Some(start_time),
            end: Some(end_time),
            throttle: None,
            interval: None,
        };

        let usage_config = UsageConfig {
            permissions: Some(ClaimPermissions::claim),
            refund_deposit: None,
            auto_delete_drop: None,
            auto_withdraw: Some(true),
            account_creation_fields: None,
        };

        let drop_config = JsonDropConfig {
            uses_per_key: Some(total_participants_allowed),
            time: Some(keypom_time_config),
            usage: Some(usage_config),
            sale: None,
            root_account_id: None,
        };

        let attached_deposit = env::attached_deposit();

        let quest = Quest {
                    quest_id: self.next_quest_id,
                    drop_id: 0,
                    start_time,
                    end_time, 
                    reward_config: None,
                    reward_amount: attached_deposit,
                    total_participants_allowed,
                    indexer_name
                };

        self.quest_by_id.insert(quest_id, &quest);
        self.quest_owner_quest

        let deposit_per_use: U128 =
            near_sdk::json_types::U128(attached_deposit / total_participants_allowed as u128);

        let promise = keypom_near::ext(KEYPOM_CONTRACT.parse().unwrap())
            .with_attached_deposit(attached_deposit)
            .with_static_gas(Gas(5 * TGAS))
            .create_drop(
                Some(vec![contract_drop_public_key]),
                deposit_per_use,
                None,
                Some(drop_config),
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            );

        promise.then(
            Self::ext(env::current_account_id())
                .with_attached_deposit(near_attached)
                .with_static_gas(Gas(5 * TGAS))
                .create_drop_callback(quest_id),
        )
    }

    #[private]
    pub fn create_drop_callback(
        &self,
        quest_id: u64,
        #[callback_result] call_result: Result<String, PromiseError>,
    ) {
        if call_result.is_err() {
            log!("There was an error creating your quest");
        }

        log!("Quest created successfully");
        let attached_deposit = env::attached_deposit();
        log!("Attached_deposit: {}", attached_deposit.clone());

        // Deserialize the returned object.
        let drop_id: U128 = serde_json::from_str(&call_result.unwrap()).unwrap();

        let promise = keypom_near::ext(KEYPOM_CONTRACT.parse().unwrap())
            .with_static_gas(Gas(5 * TGAS))
            .get_drop_information(Some(drop_id), None);

        promise.then(
            Self::ext(env::current_account_id())
                .with_static_gas(Gas(5 * TGAS))
                .internal_create_quest(drop_id),
        );
        //
        //
        //
        // let account_id = env::signer_account_id();
        //
        // let quest = Quest {
        //     quest_id: quest_id.clone(),
        //     quest_type: reward_type,
        //     start_time,
        //     end_time,
        //     reward_config: None,
        //     reward_amount,
        //     total_participants_allowed,
        //     indexer_config_id,
        // };
        // Fetching or initializing the quest_ids set for the deployer.
        //
    }
    #[private]
    pub fn internal_create_quest(
        &mut self,
        quest_id: U128,
        #[callback_result] call_result: Result<String, PromiseError>,
    ) -> bool {
        log!("quest_id, {}", u128::from(quest_id));
        let account_id = env::signer_account_id();

        if call_result.is_err() {
            log!("There was an error creating your quest");
            return false;
        }

        let drop_info: JsonDrop = serde_json::from_str(&call_result.unwrap()).unwrap();
        let quest: Result<Quest, _> = drop_info.try_into();

        match quest {
            Ok(quest) => {
                self.quest_by_id.insert(&quest_id, &quest);
                self.quest_owner_quest

                self.quest_ids_by_deployer
                    .insert(&account_id, &quest_ids_set);
                self.quest_by_id.insert(&quest.quest_id, &quest);
                true
            }
            Err(e) => {
                log!("There was an error creating your quest. {}", e);
                false
            }
        }
    }
    pub fn delete_quest(&mut self, quest_id: String) -> bool {
        unimplemented!()
    }

    /// Method that takes the quest_id and signed_claim_receipt and verifies it against the public key of the signing_serice
    /// Returns `true` if correct else `false`.
    #[private]
    fn verify_claim(&self, hash: String) -> bool {
        unimplemented!()
    }

    #[payable]
    pub fn claim_reward(&mut self, quest_id: String, signed_claim_receipt: String) {
        // Check if receipt was signed by claim_signer_public_key
        // Call Keypom.claim()
        unimplemented!()
    }

    pub fn set_global_freeze(&mut self, freeze: bool) {
        self.assert_admin();
        self.global_freeze = freeze;
        log!(format!("Global freeze set to: {}", freeze).as_str());
    }

    fn assert_admin(&self) {
        require!(
            env::predecessor_account_id() == self.admin,
            "only the admin can call this function"
        );
    }

    pub fn is_global_freeze(&self) -> bool {
        self.global_freeze
    }

    pub fn update_claim_signer(&mut self, new_signer: PublicKey) {
        self.assert_admin();
        self.claim_signer_public_key = new_signer;
    }

    //TODO: move to view.rs
    /// View Functions
    //TODO: this will eventually run out of gas we need to implement pagination
    pub fn quests(&self) -> Vec<Quest> {
        let quests: Vec<_> = self.quest_by_id.values().collect();
        quests
    }

    pub fn quest_by_id(&self, quest_id: QuestId) -> Option<Quest> {
        self.quest_by_id.get(&quest_id)
    }

    pub fn check_claim_status(&self, quest_id: String, account_id: AccountId) -> ClaimStatus {
        unimplemented!()
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 */
#[cfg(test)]
mod tests {
    use super::*;

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
