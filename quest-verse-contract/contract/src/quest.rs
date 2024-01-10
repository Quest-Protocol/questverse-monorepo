use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::AccountId;

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Quest {
    pub quest_id: u64,
    pub creator: AccountId,
    pub created_at: u64,
    pub starts_at: u64,
    pub expires_at: u64,
    pub closed_at: Option<u64>,
    pub total_reward_amount: u128,
    pub total_participants_allowed: u64,
    pub num_claimed_rewards: u64,
    pub participants: Vec<AccountId>,
    pub indexer_name: String,
    pub humans_only: bool,
    pub title: String,
    pub description: String,
    pub img_url: String,
    pub tags: Vec<String>,
}
