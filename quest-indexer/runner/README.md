## A general micro-indexing framework for JS 

This indexing framework allows users to write and deploy indexing functions on-chain. This not only creates an opportunity for a more transparent data ecosystem but also makes it possible to make a protocol like the Quest Protocol a reality. 

Every Quest needs an indexer to track the user's actions on-chain. Many Quests can be pointed to the same indexer and for every new type of quest that needs to be designed, a new indexer supporting the tracking of the behavior will need to be created. 

The schema for the indexer functions will also need to be standardized. It should contain a field for `is_completed: Boolean` as well as `account_id: String`. This will allow our tx-signing service to validate the quest and generate a receipt that the `account_id` can claim only. 

the schema for the `Creator Quest` Indexer is as follows: 

```SQL
CREATE TABLE
  creator_quest (
    account_id VARCHAR PRIMARY KEY,
    num_components_created INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE
  );
```

### Indexer Examples

#### **BOS_QUESTS Indexer to track BOS developer's component creation activity**
This indexer keeps can be seen live here on [QueryAPI](https://near.org/dev-queryapi.dataplatform.near/widget/QueryApi.App?selectedIndexerPath=morgs.near/bos_quests&view=editor-window)
- Rewards users with 3 types of NFTs
    -  `creator quest NFT`
       - given to users who have created at least 3 widgets
    -  `composer quest NFT`
       - given to users who have created at least 3 widgets
    -  `contractor quest NFT`
       - A Near Protocol Full Stack Engineer. Have deployed a smart contract as well as a BOS component. 

This indexer was a POC built to validate the idea. In the actual quest protocol, each of these quests would be deployed as a new quest. 

The indexer configuration for the `creator quest` on quests.near would be something like the following: 

```
{
    indexerConfig: {
        function_account_id: "morgs.near"
        function_name: "creator_quest"
        function_version: "93949400"
    }
}
```

#### Acknowledgements 

The `runner` codebase was forked from `Near/QueryApi`

Thank you to the Data Platform team and [Morgan](https://github.com/morgsmccauley) and Gabe for their contributions to this codebase. 

You can follow and support the project [here](https://github.com/near/queryapi)
