enum RewardType {
    FT,
    NFT,
}

struct Quest {
    quest_id: uint32,
    reward_type: RewardType,
    start_time: unit256,
    end_time: uint256,
    total_participants_allowed: uint32,
    reward_amount: uint64,
    reward_token_address: string,
}
