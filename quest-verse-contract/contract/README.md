# Quest-verse Protocol 

The Quest protocol handles important components of the questverse ecosystem 

1. Quest Creation
Anyone can create an incentivised Quest by calling calling create_quest on `quests.near` withthe correct details. 
2. Quest Indexer Configurations
Quest indexers are the heart of the quest protocol. These are hosted on `queryapi.dataplatform.near` and the indexer functions + their schemas can be accessed on-chain. 
3. Quest Reward Redemption
Quests can be redeemed by calling the `claim(receipt: String)`. These receipts are signed txs attesting to the fact that the account_id in the receipt has successfully finished the quest. The `claim` method will check that this receipt is valid and distribute the rewards. 
