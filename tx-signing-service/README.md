## What is this service for? 

Users need to be able to claim their rewards and to do so, they go to a trusted third party or the quest deployer themselves to validate their quest and generate a signed message that attests that the user indeed completed their quest. 

This service exposes two endpoints.

#### `/v1/validate/{quest_id}`
> Returns a Boolean + some stats on a user's progress for a given quest. 

#### `/v1/generate-claim-receipt/{quest_id}/{account_id}`
> Generates a signedTx for the `account_id` which is intended to be submitted to `quests.near` to claim their reward.
