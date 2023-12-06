use near_sdk::borsh::{self, BorshSerialize};
use near_sdk::BorshStorageKey;

#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKeys {
    IndexerConfigsById,
    QuestIdsByDeployer,
    QuestById,
    QuestSet,
    QuestOwnerQuest,
}
