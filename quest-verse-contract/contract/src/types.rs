use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::AccountId;

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

#[allow(non_camel_case_types)]
#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub enum RewardType {
    // In $NEAR
    NATIVE,
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

pub type QuestId = u64;
