function fetch_indexers_config({ }) {
  return {
    all: {
      "any-interaction": {
        code: '  const h = block.header().height;\n  // await context.set("height", h);\n  const daoTxs = block\n    .actions()\n    .filter((action) => action.receiverId.includes({{accountId}}))\n    .flatMap((action) =>\n      action.operations\n        .map((operation) => operation["FunctionCall"])\n        .map((functionCallOperation) => ({\n          ...functionCallOperation,\n          args: base64decode(functionCallOperation.args),\n          receiptId: action.receiptId, // providing receiptId as we need it\n        }))\n    );\n\n  if (daoTxs.length > 0) {\n    console.log("Found DAO Txs in Block...");\n    console.log(daoTxs);\n  }\n',
        filter_json:
          '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"social.near","status":"SUCCESS"}}',
        config: "\n",
        schema:
          "CREATE TABLE quest_tracker (\n  id SERIAL PRIMARY KEY,\n  account_id TEXT NOT NULL,\n  is_completed BOOLEAN NOT NULL DEFAULT FALSE,\n  block_height DECIMAL(58, 0) NOT NULL\n);\n\nCREATE TABLE details (\n  account_id TEXT NOT NULL,\n  num_of_interactions DECIMAL(58, 0) NOT NULL\n);\n\n-- Indexes\nCREATE INDEX idx_account_id ON quest_tracker(account_id);\n",
      },
    },
    "astrodao.near": {
      config: '{\n"type": "multi",\n"contract_id": "*.sputnik-dao.near"\n}\n',
      filter_json:
        '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"*.sputnik-dao.near","status":"SUCCESS"}}',
      join_dao: {
        code: ' const DAO_ACCOUNT_ID = "{{dao_account_id}}";\n  const GROUP = "{{role}}";\n\n  function base64decode(encodedValue) {\n    let buff = Buffer.from(encodedValue, "base64");\n    return JSON.parse(buff.toString("utf-8"));\n  }\n  const h = block.header().height;\n  const txs = block\n    .actions()\n    .filter((action) => action.receiverId.includes(DAO_ACCOUNT_ID))\n    .flatMap((action) =>\n      action.operations\n        .map((operation) => operation["FunctionCall"])\n        .filter((operation) => operation?.methodName === "add_proposal")\n        .map((functionCallOperation) => ({\n          ...functionCallOperation,\n          args: base64decode(functionCallOperation.args),\n          receiptId: action.receiptId, // providing receiptId as we need it\n        }))\n    );\n\n  if (txs.length > 0) {\n    console.log("Found DAO Txs in Block...");\n    const blockHeight = block.blockHeight;\n    const blockTimestamp = block.header().timestampNanosec;\n    await Promise.all(\n      txs.map(async (action) => {\n        console.log(action);\n        const addMemberArgs = action?.proposal?.kind?.AddMemberToRole;\n\n        // if creates a post\n        if (addMemberArgs.role == GROUP) {\n          context.db.QuestTracker.insert({\n            account_id: addMemberArgs.member_id,\n            block_height: blockHeight,\n            is_completed: true,\n          });\n          context.db.Details.insert({\n            account_id: addMemberArgs.member_id,\n            proposal_id: 0,\n            receipt: action.receipt,\n          });\n        }\n      })\n    );\n  }\n',
        filter_json:
          '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"social.near","status":"SUCCESS"}}',
        schema:
          'CREATE TABLE\n  quest_tracker (\n    id SERIAL PRIMARY KEY,\n    account_id VARCHAR NOT NULL,\n    is_completed BOOLEAN NOT NULL DEFAULT FALSE,\n    block_height DECIMAL(58, 0) NOT NULL\n  );\n\nCREATE TABLE\n  details (\n    "account_id" VARCHAR NOT NULL,\n    "proposal_id" DECIMAL(58, 0) NOT NULL,\n    "receipt" VARCHAR NOT NULL\n  );\n\nCREATE INDEX\n  idx_account_id ON quest_tracker (account_id);\n',
        start_from_blockheight: 0,
      },
      vote_proposal: {},
    },
    "devgogs.near": {
      attest_post: {},
      config: '{\n"contract_id": "devgogs.near"\n}\n',
      filter_json:
        '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"social.near","status":"SUCCESS"}}',
      fund_project: {},
      interact_with_community: {},
      reply_to_post: {},
    },
    mintbase: {
      buy_nft: {},
      config: '{\n  "type": "multi",\n  "contract_id": "*.mintbase1.near"\n}\n',
      filter_json:
        '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"social.near","status":"SUCCESS"}}',
      list_nft: {},
    },
    "near-horizon": {
      config: '{\n"contract_id": "nearhorizon.near"\n}\n',
      filter_json:
        '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"social.near","status":"SUCCESS"}}',
    },
    "nft.genadrop.near": {
      config: '{\n"contract_id": "nft.genadrop.near"\n}\n',
      filter_json:
        '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"social.near","status":"SUCCESS"}}',
    },
    paras: {},
    "potluck.near": {
      donate: {},
    },
    "social.near": {
      complete_widget_metadata_infoany_widget_data: {},
      config: '{\n"contract_id": "social.near"\n}\n',
      filter_json:
        '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"social.near","status":"SUCCESS"}}',
      create_componnet_with_x_widgets: {},
      follow_user: {
        indexerFunction: "",
        filter_json:
          '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"social.near","status":"SUCCESS"}}',
        schema: "",
      },
      "like-post": {
        indexerFunction: "",
        filter_json:
          '{"indexer_rule_kind":"Action","matching_rule":{"rule":"ACTION_ANY","affected_account_id":"social.near","status":"SUCCESS"}}',
        schema: "",
      },
    },
  };
}

return { fetch_indexers_config };
