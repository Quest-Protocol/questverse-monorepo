use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::AccountId;

use crate::keypom_models::JsonDrop;
use crate::types::{QuestRewardConfig, RewardType};

#[allow(non_camel_case_types)]
#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Quest {
    pub quest_id: u64,
    pub drop_id: U128,
    pub start_time: u64,
    pub end_time: u64,
    pub reward_config: Option<QuestRewardConfig>,
    pub reward_amount: U128,
    pub total_participants_allowed: u64,
    pub indexer_name: String,
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
                                quest_id: 0,
                                drop_id: keypom_drop_info.drop_id,
                                start_time,
                                end_time,
                                reward_config: None,
                                reward_amount: keypom_drop_info.deposit_per_use,
                                total_participants_allowed: uses_per_key,
                                indexer_name: String::new(),
                            });
                        }
                    }
                }
            }
        }

        Err("Conversion from JsonDrop to Quest failed.")
    }
}
