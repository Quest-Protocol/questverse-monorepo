// Find all our documentation at https://docs.near.org
use keypom_models::*;
use types::*;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, LookupSet, UnorderedMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, ext_contract, log, near_bindgen, promise_result_as_success, require, AccountId, Balance,
    BorshStorageKey, CryptoHash, Gas, PanicOnDefault, Promise, PromiseError, PromiseOrValue,
    PromiseResult, PublicKey,
};
use std::convert::TryFrom;

pub mod keypom_ext;
pub use crate::keypom_ext::*;

mod keypom_models;
mod types;
mod utils;

const KEYPOM_CONTRACT: &str = "v2.keypom.testnet";
const QUESTS_PROTOCOL_DEFAULT_PUBLIC_KEY_STR: &str =
    "ed25519:Dru47TDn3vaN2PMXwoq8cY6o2ERzqcidxFj6NTdxUgHh";

#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKeys {
    Whitelist,
    IndexerConfigsById,
    QuestIdsByDeployer,
    QuestById,
    QuestSet,
}

pub type FunctionName = String;
// pub type IndexerConfigById = ;
// pub type QuestIdsByDeployer = UnorderedMap<AccountId, Vec<QuestById>>;
// Define the contract structure

#[derive(BorshSerialize, BorshDeserialize)]
pub struct QuestUsage {
    total_redemptions: U128,
    redemptions_account_list: UnorderedSet<AccountId>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct QuestProtocol {
    contract_owner_id: AccountId,
    keypom_account_id: AccountId,
    // indexer configurations. At this moment only editable by the owner
    indexer_configs_by_id: LookupMap<FunctionName, QueryApiIndexerConfig>,
    // quests by a quest_id
    quest_by_id: UnorderedMap<QuestId, Quest>,
    // ids of quests created by deployer account
    quest_ids_by_deployer: UnorderedMap<AccountId, UnorderedSet<QuestId>>,
    // Set of whitelisted tokens by contract owner
    whitelisted_tokens: UnorderedSet<AccountId>,
    // claim signer public key. This key will be used to authenticate claims.
    claim_signer_public_key: PublicKey,
    /// pause contract activity
    global_freeze: bool,
}

// Implement the contract structure
#[near_bindgen]
impl QuestProtocol {
    #[init]
    pub fn new(
        owner_id: AccountId,
        keypom_account_id: AccountId,
        default_claim_signer_public_key: String,
    ) -> Self {
        Self {
            contract_owner_id: owner_id,
            keypom_account_id: keypom_account_id
                .unwrap_or_else(|| KEYPOM_CONTRACT.parse().unwrap()),
            quest_by_id: UnorderedMap::new(StorageKeys::QuestById),
            quest_ids_by_deployer: UnorderedMap::new(StorageKeys::QuestIdsByDeployer),
            indexer_configs_by_id: LookupMap::new(StorageKeys::IndexerConfigsById),
            whitelisted_tokens: UnorderedSet::new(StorageKeys::Whitelist),
            claim_signer_public_key: default_claim_signer_public_key
                .unwrap_or_else(|| QUESTS_PROTOCOL_DEFAULT_PUBLIC_KEY_STR.parse().unwrap()),
            global_freeze: false,
        }
    }

    #[payable]
    pub fn create_near_quest(
        &mut self,
        quest_id: U128,
        end_time: u64,
        start_time: u64,
        total_participants_allowed: u64,
        reward_amount: U128,
        reward_type: RewardType,
        indexer_config_id: String,
        quest_validator_public_key: Option<String>,
    ) -> Promise {
        //TODO check for drop ID being above the minimum
        let contract_drop_public_key: PublicKey = QUESTS_PROTOCOL_PUBLIC_KEY_STR.parse().unwrap(); // Ensuring start_time is before end_time
        require!(start_time < end_time, "Start time must be before end time.");

        let result = self.quest_by_id.get(&quest_id).is_some();

        log!("{}", result);
        // Checking if the quest with given quest_id already exists
        require!(
            self.quest_by_id.get(&quest_id).is_some(),
            "Quest with this ID already exists."
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

        let near_attached = env::attached_deposit();
        let promise = v2_keypom_near::ext(KEYPOM_CONTRACT.parse().unwrap())
            .with_attached_deposit(near_attached)
            .with_static_gas(Gas(5 * TGAS))
            .create_drop(
                Some(vec![contract_drop_public_key]),
                reward_amount,
                Some(quest_id),
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
                .create_drop_callback(),
        )
    }

    #[private]
    pub fn create_drop_callback(
        &self,
        #[callback_result] call_result: Result<String, PromiseError>,
    ) {
        if call_result.is_err() {
            log!("There was an error creating your quest");
        }

        log!("Quest created successfully");
        let near_attached = env::attached_deposit();
        log!("attached_deposit: {}", near_attached.clone());

        // Deserialize the returned object.
        let drop_id: U128 = serde_json::from_str(&call_result.unwrap()).unwrap();

        let promise = v2_keypom_near::ext(KEYPOM_CONTRACT.parse().unwrap())
            .with_attached_deposit(near_attached)
            .with_static_gas(Gas(5 * TGAS))
            .get_drop_information(Some(drop_id), None);

        promise.then(
            Self::ext(env::current_account_id())
                .with_attached_deposit(near_attached)
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
                let mut quest_ids_set = self
                    .quest_ids_by_deployer
                    .get(&account_id)
                    .unwrap_or_else(|| UnorderedSet::new(StorageKeys::QuestSet));
                quest_ids_set.insert(&quest.quest_id);

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

    #[private]
    fn verify_hash(&self, hash: String) -> bool {
        unimplemented!()
    }

    #[private]
    fn is_receipt_valid(message: RewardReceiptDetails, receipt: String) -> bool {
        true
        // unimplemented!()
        //     recreated_receipt = hash(message)
        // assert!(receipt, recreated_receipt)
    }

    #[payable]
    pub fn claim_reward(&mut self, quest_id: String, receipt: String) {
        let account_id = env::current_account_id();
        // check if user already claimed their reward or not.
        self.quest_by_id.get(&quest_id);

        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Claim only can come by the user who completed the quest"
        );
        assert!(
            env::is_valid_account_id(account_id.as_bytes()),
            "Invalid AccountId passed in"
        );
        let reward_receipt_details = RewardReceiptDetails {
            quest_id,
            account_id,
            completed: true,
        };
        //
        //
        // TODO: Check if enough gas is attached
        // Check if enough gas is attached. For callback + this function to go through
        //
        let is_valid = self.is_receipt_valid(reward_receipt_details, receipt);
        assert_eq!(is_valid, true, "Receipt was not valid");

        // Check if receipt was signed by claim_signer_public_key
        // Call Keypom.claim()
        let near_attached = env::attached_deposit();
        let promise = v2_keypom_near::ext(self.keypom_account_id.parse().unwrap())
            .with_attached_deposit(near_attached)
            .with_static_gas(Gas(5 * TGAS))
            .claim(quest_id);

        promise.then(
            Self::ext(env::current_account_id())
                .with_attached_deposit(near_attached)
                .with_static_gas(Gas(5 * TGAS))
                .claim_successful_callback(),
        )
    }

    #[private]
    pub fn claim_successful_callback(
        &mut self,
        quest_id: U128,
        #[callback_result] call_result: Result<String, PromiseError>,
    ) -> bool {
        // Add information about the drop being succesfful
        log!("quest_id, {}", u128::from(quest_id));
        let account_id = env::signer_account_id();

        if call_result.is_err() {
            log!("There was an error redeeming your rewards");
            return false;
        }

        // let drop_info: JsonDrop = serde_json::from_str(&call_result.unwrap()).unwrap();
        // let quest: Result<Quest, _> = drop_info.try_into();
        //
        // match quest {
        //     Ok(quest) => {
        //         let mut quest_ids_set = self
        //             .quest_ids_by_deployer
        //             .get(&account_id)
        //             .unwrap_or_else(|| UnorderedSet::new(StorageKeys::QuestSet));
        //         quest_ids_set.insert(&quest.quest_id);
        //
        //         self.quest_ids_by_deployer
        //             .insert(&account_id, &quest_ids_set);
        //         self.quest_by_id.insert(&quest.quest_id, &quest);
        //         true
        //     }
        //     Err(e) => {
        //         log!("There was an error creating your quest. {}", e);
        //         false
        //     }
        // }
    }
    pub fn set_global_freeze(&mut self, freeze: bool) {
        self.assert_owner_calling();
        self.global_freeze = freeze;
        log!(format!("Global freeze set to: {}", freeze).as_str());
    }

    fn assert_owner_calling(&self) {
        require!(
            env::predecessor_account_id() == self.contract_owner_id,
            "Only the contract owner can call this function"
        );
    }

    pub fn is_global_freeze(&self) -> bool {
        self.global_freeze
    }

    pub fn add_to_whitelist(&mut self, token_id: AccountId) {
        self.assert_owner_calling();
        self.whitelisted_tokens.insert(&token_id);
    }

    pub fn update_claim_signer(&mut self, new_signer: PublicKey) {
        self.assert_owner_calling();
        self.claim_signer_public_key = new_signer;
    }

    /// View Functions
    pub fn get_all_deployers(&self) -> Vec<AccountId> {
        let deployers: Vec<_> = self.quest_ids_by_deployer.keys().collect();
        deployers
    }

    pub fn get_all_quests(&self) -> Vec<Quest> {
        let quests: Vec<_> = self.quest_by_id.values().collect();
        quests
    }

    pub fn quests_by_deployer(&self, deployer: AccountId) -> Vec<QuestId> {
        if let Some(quest_id_set) = self.quest_ids_by_deployer.get(&deployer) {
            if !quest_id_set.is_empty() {
                return quest_id_set.to_vec();
            }
        }
        vec![U128(0)]
    }

    pub fn quest_by_id(&self, quest_id: QuestId) -> Option<Quest> {
        self.quest_by_id.get(&quest_id)
    }

    pub fn indexer_configs_by_id(&self, config_id: String) -> Option<QueryApiIndexerConfig> {
        self.indexer_configs_by_id.get(&config_id)
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

    // #[test]
    // fn list_account_roles() {
    //     let admins = vec![
    //         AccountRole {
    //             account_id: AccountId::new_unchecked("bob.near".to_string()),
    //             role: Role::Owner,
    //         },
    //         AccountRole {
    //             account_id: AccountId::new_unchecked("flatirons.near".to_string()),
    //             role: Role::User,
    //         },
    //     ];
    //     let contract = Contract {
    //         registry: IndexersByAccount::new(StorageKeys::Registry),
    //         account_roles: admins.clone(),
    //     };
    //     assert_eq!(contract.list_account_roles(), admins);
    // }
    #[test]
    fn quest_creation_works() {
        let contract = QuestProtocol::new(
            "roshaan.near".to_string(),
            "v2.keypom.near".to_string(),
            QUESTS_PROTOCOL_PUBLIC_KEY_STR.to_string(),
        );

        let quest = Quest {
            quest_id: U128(23902390239),
            quest_type: RewardType::Native,
            start_time: 5858585583,
            end_time: 384484848484,
            reward_config: None,
            reward_amount: U128::from("239293092").unwrap(),
            total_participants_allowed: 50,
            indexer_config_id: "creator_quest".to_string(),
        };

        // contract.create_near_quest(quest.quest_id, quest.end_time, quest.start_time, total_participants_allowed, reward_amount, reward_type, indexer_config_id, quest_validator_public_key)
        // }
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
