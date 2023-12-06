## What is this service for?

Users need to be able to claim their rewards and to do so, they go to a trusted third party or the quest deployer themselves to validate their quest and generate a signed message that attests that the user indeed completed their quest.

This service exposes two endpoints.

#### `/v1/validate/{account_id}{quest_id}{indexer_function}`
> Returns a Boolean + some stats on a user's progress for a given quest.

#### `/v1/generate-claim-receipt/{account_id}{quest_id}/{indexer_function}`
> Generates a signedTx for the `account_id` which is intended to be submitted to `quests.near` to claim their reward.
