// Storage errors.

pub const ACCOUNT_ALREADY_CLAIMED: &str = "AccountId has already claimed the reward";
pub const INVALID_CLAIM_SIGNATURE: &str = "The claim has an invalid claim signature";
pub const FT_TOKEN_NOT_VALID: &str = "The FT Token address provided was not valid";
pub const NOT_SUFFICIENT_NFT_MINT_FEE: &str = "The correct NFT Mint fee was not provided";
pub const MAX_QUEST_REDEMPTIONS_REACHED: &str =
    "Quest has reached the maximum number of redemptions";
pub const QUEST_ID_ALREADY_USED: &str = "Quest ID has already been used";
pub const QUEST_NOT_STARTED: &str = "Quest has not started yet";
pub const QUEST_ENDED: &str = "Quest has already ended";
pub const QUEST_TYPE_NOT_SUPPORTED: &str = "This type of quest is not supported";
