## A general microindexing framework for JS 

Indexer Examples
### ** BOS_QUESTS **
This indexer keeps track can be seen here on [QueryAPI](https://near.org/dev-queryapi.dataplatform.near/widget/QueryApi.App?selectedIndexerPath=morgs.near/bos_quests&view=editor-window)
- Keeps track of rewarding users with three quests
-  creator quest 
       - given to users who have created at least 3 widgets
-  composer quest 
       - given to users who have created at least 3 widgets
-  contractor quest 
       - A Near Protocol Full Stack Engineer 

This was a POC built to validate the idea. In the actual quest protocol world. Each of these would be a quest deployed under morgs.quests.near

morgs.quests.near would have 3 quests registered on there. 
creator_quest

details:
{
    indexerConfig: {
        function_account_id: "morgs.near"
        function_name: "morgs.near/creator_quest"
        function_version: "93949400"
    }
}

#### Acknowledgements 

Code was forked from Near/QueryApi

Thank you to the Data Platform team and Morgan and Gabe for their contributions. 

You can check out the project here: https://github.com/near/queryapi
