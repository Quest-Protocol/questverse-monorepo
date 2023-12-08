use near_sdk::Gas;

pub const KEYPOM_CONTRACT: &str = "v2.keypom.testnet";
pub const QUESTS_PROTOCOL_PUBLIC_KEY_STR: &str =
    "ed25519:FMy47jsCvi5G8KyiijH1w9qnr4GA1FGSaB8S2fK5eAfr";
pub const MIN_DROP_ID_PASSED_IN: u128 = 1_000_000_000;

pub const CLAIM_REWARD_GAS: Gas = Gas(10 * Gas::ONE_TERA.0);
