use crate::*;
use near_sdk::ext_contract;

pub const TGAS: u64 = 1_000_000_000_000;
pub const NO_DEPOSIT: u128 = 0;
pub const XCC_SUCCESS: u64 = 1;

// Validator interface, for cross-contract calls
#[ext_contract(keypom_near)]
trait Keypom {
    fn create_drop(
        &mut self,
        // Public keys to add when creating the drop (can be empty)
        public_keys: Option<Vec<PublicKey>>,
        // How much $NEAR should be transferred everytime a key is used? Can be 0.
        deposit_per_use: U128,
        // Overload the specific drop ID
        drop_id: Option<DropIdJson>,
        // Configure behaviors for the drop
        config: Option<JsonDropConfig>,
        // Give the drop some metadata (simple string)
        metadata: Option<DropMetadata>,
        // Specify how much Gas should be attached to `claim` or `create_account_and_claim` calls
        required_gas: Option<Gas>,

        // Mutually Exclusive. Use-case specific configurations
        simple: Option<SimpleData>,
        ft: Option<JsonFTData>,
        nft: Option<JsonNFTData>,
        fc: Option<FCData>,

        // Passwords for the keys
        passwords_per_use: Option<Vec<Option<Vec<JsonPasswordForUse>>>>,
        passwords_per_key: Option<Vec<Option<String>>>,
    ) -> Option<DropIdJson>;
    fn claim(
        &mut self,
        account_id: String,
        password: Option<String>,
        fc_args: Option<Vec<Option<String>>>,
    );
    fn get_drop_information(drop_id: Option<DropIdJson>, key: Option<PublicKey>) -> JsonDrop;
}
