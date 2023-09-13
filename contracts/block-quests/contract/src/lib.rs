// Find all our documentation at https://docs.near.org
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::serde::Serialize;
use near_sdk::{
    env, log, near_bindgen, require, AccountId, BorshStorageKey, PanicOnDefault, PublicKey,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Quest {
    quest_id: String,
    quest_type: RewardType,
    start_time: u64,
    end_time: u64,
    reward_config: QuestRewardConfig,
    total_participants_allowed: u64,
    indexer_config_id: String,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct QueryApiIndexerConfig {
    function_name: String,
    account_id: AccountId,
    version: BlockHeight,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct QuestRewardConfig {
    reward_token_address: String,
    reward_amount: U128,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct QuestUsage {
    total_redemptions: U128,
    redemptions_account_list: UnorderedSet<AccountId>,
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
enum RewardType {
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

pub type QuestId = String;

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
    pub fn create_quest(
        &mut self,
        quest_id: String,
        reward_token_address: AccountId,
        end_time: u64,
        start_time: u64,
        total_participants_allowed: u64,
        reward_amount: U128,
        reward_type: RewardType,
        indexer_config_id: String,
    ) {
        // Ensuring start_time is before end_time
        require!(start_time < end_time, "Start time must be before end time.");

        // Ensuring reward_token_address is whitelisted
        require!(
            self.whitelisted_tokens.contains(&reward_token_address),
            "Provided reward_token_address is not whitelisted."
        );

        // Checking if the quest with given quest_id already exists
        require!(
            !self.quest_by_id.contains_key(&quest_id),
            "Quest with this ID already exists."
        );

        let account_id = env::signer_account_id();

        let quest = Quest {
            quest_id: quest_id.clone(),
            quest_type: reward_type,
            start_time,
            end_time,
            reward_config: QuestRewardConfig {
                reward_token_address: reward_token_address.to_string(),
                reward_amount,
            },
            total_participants_allowed,
            indexer_config_id,
        };

        // Fetching or initializing the quest_ids set for the deployer.
        let mut quest_ids_set = self
            .quest_ids_by_deployer
            .get(&account_id)
            .unwrap_or_else(|| UnorderedSet::new(StorageKeys::QuestSet));
        quest_ids_set.insert(&quest_id);

        self.quest_ids_by_deployer
            .insert(&account_id, &quest_ids_set);
        self.quest_by_id.insert(&quest_id, &quest);
    }

    pub fn update_quest(
        &mut self,
        quest_id: String,
        new_reward_token_address: Option<String>,
        new_end_time: Option<u64>,
        new_start_time: Option<u64>,
        new_total_participants_allowed: Option<u64>,
        new_reward_amount: Option<U128>,
        new_reward_type: Option<RewardType>,
        new_indexer_config_id: Option<String>,
    ) -> bool {
        let mut quest = self.quest_by_id.get(&quest_id).expect("Quest not found");
        if let Some(addr) = new_reward_token_address {
            quest.reward_config.reward_token_address = addr;
        }
        if let Some(end) = new_end_time {
            quest.end_time = end;
        }
        if let Some(start) = new_start_time {
            quest.start_time = start;
        }
        if let Some(limit) = new_total_participants_allowed {
            quest.total_participants_allowed = limit;
        }
        if let Some(amount) = new_reward_amount {
            quest.reward_config.reward_amount = amount;
        }
        if let Some(reward_type) = new_reward_type {
            quest.quest_type = reward_type;
        }
        if let Some(indexer_id) = new_indexer_config_id {
            quest.indexer_config_id = indexer_id;
        }
        self.quest_by_id.insert(&quest_id, &quest);
        true
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
            RewardType::Native => {
                // Handle NEAR reward
                // let payout = quest.reward_config.reward_amount.0;
                // let promise = env::promise_create(receiver_id, payout);
                // Check promise return (left as an exercise)
            }
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
}
