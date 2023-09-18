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
use std::convert::TryFrom;
pub mod external;
pub use crate::external::*;
mod keypom_models;
mod utils;

#[allow(non_camel_case_types)]
#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Quest {
    quest_id: U128,
    quest_type: RewardType,
    start_time: u64,
    end_time: u64,
    reward_config: Option<QuestRewardConfig>,
    reward_amount: U128,
    total_participants_allowed: u64,
    indexer_config_id: String,
}

impl TryFrom<JsonDrop> for Quest {
    type Error = &'static str;

    fn try_from(keypom_drop_info: JsonDrop) -> Result<Self, Self::Error> {
        if let Some(config) = keypom_drop_info.config {
            if let Some(time) = config.time {
                if let Some(start_time) = time.start {
                    if let Some(end_time) = time.end {
                        if let Some(uses_per_key) = config.uses_per_key {
                            return Ok(Quest {
                                quest_id: keypom_drop_info.drop_id,
                                start_time,
                                end_time,
                                reward_config: None,
                                reward_amount: keypom_drop_info.deposit_per_use,
                                total_participants_allowed: uses_per_key,
                                indexer_config_id: String::new(),
                                quest_type: RewardType::Native,
                            });
                        }
                    }
                }
            }
        }

        Err("Conversion from JsonDrop to Quest failed.")
    }
}

#[allow(non_camel_case_types)]
#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct QueryApiIndexerConfig {
    indexer_id: String,
    function_name: String,
    account_id: AccountId,
    version: BlockHeight,
}

#[allow(non_camel_case_types)]
#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct QuestRewardConfig {
    reward_token_address: String,
    reward_amount: U128,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct QuestUsage {
    total_redemptions: U128,
    redemptions_account_list: UnorderedSet<AccountId>,
}

const KEYPOM_CONTRACT: &str = "v2.keypom.testnet";
const QUESTS_PROTOCOL_PUBLIC_KEY_STR: &str = "ed25519:Dru47TDn3vaN2PMXwoq8cY6o2ERzqcidxFj6NTdxUgHh";
pub const MIN_DROP_ID_PASSED_IN: u128 = 1_000_000_000;

#[allow(non_camel_case_types)]
#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub enum RewardType {
    // In $NEAR
    Native,
    // Any Fungible Token NEP-141
    FT,
    // NEP-177 tokens
    NFT,
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub enum ClaimStatus {
    Claimed,
    NotClaimed,
}

pub type BlockHeight = u64;

pub struct QuestData {
    quest_details: Quest,
    usage: QuestUsage,
}

pub type QuestId = U128;

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
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct QuestProtocol {
    contract_owner_id: AccountId,
    // indexer configurations. At this moment only editable by the owner
    indexer_configs_by_id: LookupMap<FunctionName, QueryApiIndexerConfig>,
    // quests by a quest_id
    quest_by_id: LookupMap<QuestId, Quest>,
    // ids of quests created by deployer account
    quest_ids_by_deployer: LookupMap<AccountId, UnorderedSet<QuestId>>,
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
    pub fn new(owner_id: AccountId, claim_signer_public_key: String) -> Self {
        Self {
            contract_owner_id: owner_id,
            quest_by_id: LookupMap::new(StorageKeys::QuestById),
            quest_ids_by_deployer: LookupMap::new(StorageKeys::QuestIdsByDeployer),
            indexer_configs_by_id: LookupMap::new(StorageKeys::IndexerConfigsById),
            whitelisted_tokens: UnorderedSet::new(StorageKeys::Whitelist),
            claim_signer_public_key: claim_signer_public_key.parse().unwrap(),
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
    ) -> Promise {
        //
        //TODO check for drop ID being above the minimum
        let contract_drop_public_key: PublicKey = QUESTS_PROTOCOL_PUBLIC_KEY_STR.parse().unwrap(); // Ensuring start_time is before end_time
        require!(start_time < end_time, "Start time must be before end time.");

        // Checking if the quest with given quest_id already exists
        require!(
            !self.quest_by_id.contains_key(&quest_id),
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
        let promise = keypom_near::ext(KEYPOM_CONTRACT.parse().unwrap())
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

        // Deserialize the returned object.
        let drop_id: Result<U128, _> = serde_json::from_str(&call_result.unwrap());

        let promise = keypom_near::ext(KEYPOM_CONTRACT.parse().unwrap())
            .with_attached_deposit(near_attached)
            .with_static_gas(Gas(5 * TGAS))
            .get_drop_information(Some(drop_id.clone().unwrap()), None);

        promise.then(
            Self::ext(env::current_account_id())
                .with_attached_deposit(near_attached)
                .with_static_gas(Gas(5 * TGAS))
                .internal_create_quest(drop_id.clone().unwrap()),
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
        drop_id: U128,
        #[callback_result] call_result: Result<String, PromiseError>,
    ) -> bool {
        log!("dropId, {}", u128::from(drop_id));
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

    #[payable]
    pub fn claim_reward(&mut self, quest_id: String, signed_claim_receipt: String) {
        // Check if receipt was signed by claim_signer_public_key
        // Call Keypom.claim()
        unimplemented!()
    }

    #[private]
    fn handle_reward(&mut self, quest: &Quest, receiver_id: AccountId) {
        match quest.quest_type {
            RewardType::Native => {}
            // Handle NEAR reward
            // let payout = quest.reward_config.reward_amount.0;
            // let promise = env::promise_create(receiver_id, payout);
            // Check promise return (left as an exercise)
            //             pub fn create_drop(
            // &mut self,
            // drop_id: DropId,
            // key_data: Vec<ExtKeyData>,
            // asset_data: Vec<ExtAssetDataForUses>,
            //
            // drop_config: Option<DropConfig>,
            // // Should any excess attached deposit be deposited to the user's balance?
            // keep_excess_deposit: Option<bool>
            //
            //         let key_data =                    ExtKeyData {
            // public_key: QUESTS_PROTOCOL_PUBLIC_KEY.parse().unwrap(),
            //     key_owner: self.contract_owner_id.parse().unwrap()
            //         } ;

            // let keypom_drop_details = {
            //     drop_id: quest_id,
            //
            //
            // }
            //     Promise::new(KEYPOM_CONTRACT.parse().unwrap())
            //         .function_call("create_drop".to_string(), args, NO_DEPOSIT, CALL_GAS)
            //         .then(Promise::new(env::current_account_id()).function_call(
            //             "callback".to_string(),
            //             Vec::new(),
            //             NO_DEPOSIT,
            //             CALL_GAS,
            //         ));
            // }
            RewardType::FT => {
                // Handle NEP-141 (FT) reward
                // You'd make a cross-contract call here (left as an exercise)
            }
            RewardType::NFT => {
                // Handle NEP-177 (NFT) reward
                // You'd make a cross-contract call here (left as an exercise)
            }
        }
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

    // VIEW METHODS
    //
    pub fn get_quest(&self, quest_id: String) -> Option<Quest> {
        unimplemented!()
    }

    pub fn get_quests_by_account(&self, account_id: AccountId) -> Vec<QuestId> {
        unimplemented!()
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
