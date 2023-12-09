use crate::*;

#[allow(non_camel_case_types)]
#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Quest {
    pub quest_id: U128,
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

pub struct RewardReceiptDetails {
    pub quest_id: String,
    pub account_id: AccountId,
    pub completed: Bool,
}
