use crate::AccountId;
use near_sdk::ext_contract;

#[ext_contract(ext_sbtreg)]
pub trait ExtSbtRegistry {
    fn is_human(&self, account: AccountId) -> Vec<(AccountId, Vec<u64>)>;
}
