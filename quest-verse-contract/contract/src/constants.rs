use near_sdk::Gas;

pub const CLAIM_REWARD_GAS: Gas = Gas(10 * Gas::ONE_TERA.0);

pub const SIGNATURE_LEN: usize = 64;
