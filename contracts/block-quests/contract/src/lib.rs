// Find all our documentation at https://docs.near.org
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::serde::Serialize;
use near_sdk::store::UnorderedMap;
use near_sdk::{near_bindgen, AccountId, BorshStorageKey, PanicOnDefault, PublicKey};

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

pub type BlockHeight = u64;

pub struct QuestData {
    quest_details: Quest,
    usage: QuestUsage,
}

pub type QuestId = String;
pub type QuestById = UnorderedSet<QuestId>;

#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKeys {
    Whitelist,
    QuestRegistry,
    IndexerConfigsById,
    QuestIdsByDeployer,
    QuestById,
}

pub type FunctionName = String;
// pub type IndexerConfigById = ;
// pub type QuestIdsByDeployer = UnorderedMap<AccountId, Vec<QuestById>>;
// Define the contract structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct QuestProtocol {
    // indexer configurations. At this moment only editable by the owner
    indexer_configs_by_id: LookupMap<FunctionName, QueryApiIndexerConfig>,
    quest_by_id: LookupMap<QuestId, Quest>,
    quest_ids_by_deployer: LookupMap<AccountId, UnorderedSet<QuestId>>,
    quest_deployer_registry: UnorderedMap<AccountId, Vec<QuestById>>,
    // Set of whitelisted tokens by "owner".
    whitelisted_tokens: UnorderedSet<AccountId>,
    // Claim Signer Public Key
    claim_signer_public_key: PublicKey,
    /// Whether or not the contract is frozen and no new drops can be created / keys added.
    global_freeze: bool,
}

// Implement the contract structure
#[near_bindgen]
impl QuestProtocol {
    #[init]
    pub fn new(owner_id: AccountId, quest_fee: u32, claim_signer_public_key: String) -> Self {
        Self {
            quest_by_id: LookupMap::new(StorageKeys::QuestById),
            quest_ids_by_deployer: LookupMap::new(StorageKeys::QuestIdsByDeployer),
            indexer_configs_by_id: LookupMap::new(StorageKeys::IndexerConfigsById),
            quest_deployer_registry: UnorderedMap::new(StorageKeys::QuestRegistry),
            whitelisted_tokens: UnorderedSet::new(StorageKeys::Whitelist),
            claim_signer_public_key: claim_signer_public_key.parse().unwrap(),
            global_freeze: false,
        }
    }

    #[payable]
    pub fn create_quest(
        &mut self,
        quest_id: String,
        reward_token_address: String,
        end_time: u64,
        start_time: u64,
        total_participants_allowed: u64,
        reward_amount: U128,
        reward_type: RewardType,
        indexer_config_id: String,
    ) {
        self.quest_deployer_registry.insert(Quest {
            quest_id,
            quest_type: RewardType::Native,
            start_time: 9494949484,
            end_time: 959585595595,
            reward_config: QuestRewardConfig {
                reward_token_address,
                reward_amount,
            },
            total_participants_allowed,
            indexer_config_id: "bos-components",
        });
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

    /// Helper function to make sure there isn't a global freeze on the contract
    pub(crate) fn assert_no_global_freeze(&self) {
        if env::predecessor_account_id() != self.contract_owner_id {
            require!(
                self.global_freeze == false,
                "Contract is frozen and no new drops or keys can be created"
            );
        }
    }
    // Getter and setter methods for claim signer
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 */
#[cfg(test)]
mod tests {
    use super::*;
}
