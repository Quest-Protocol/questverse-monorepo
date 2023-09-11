
import { Block } from "@near-lake/primitives";
/**
 * Note: We only support javascript at the moment. We will support Rust, Typescript in a further release.
 */

/**
 * getBlock(block, context) applies your custom logic to a Block on Near and commits the data to a database.
 *
 * Learn more about indexers here:  https://docs.near.org/concepts/advanced/indexers
 *
 * @param {block} Block - A Near Protocol Block
 * @param {context} - A set of helper methods to retrieve and commit state
 */
async function getBlock(block: Block, context) {
  const SOCIAL_DB = "social.near";

  const nearSocialWidgetTxs = block
    .actions()
    .filter((action) => action.receiverId === SOCIAL_DB)
    .flatMap((action) =>
      action.operations
        .map((operation) => operation["FunctionCall"])
        .filter((operation) => operation?.methodName === "set")
        .map((functionCallOperation) => ({
          ...functionCallOperation,
          args: base64decode(functionCallOperation.args),
          receiptId: action.receiptId, // providing receiptId as we need it
        }))
        .filter((functionCall) => {
          const accountId = Object.keys(functionCall.args.data)[0];
          return Object.keys(functionCall.args.data[accountId]).includes(
            "widget"
          );
        })
    );

  if (nearSocialWidgetTxs.length === 0) {
    return;
  }

  const handleQuestPromises = nearSocialWidgetTxs.map(async (widgetEditTx) => {
    const accountId = Object.keys(widgetEditTx.args.data)[0];

    const hasCreatedComponent = !!Object.keys(
      widgetEditTx.args.data[accountId]["widget"]
    )[0];
    if (hasCreatedComponent) {
      const accountCreatorQuest = await queryCreatorQuest(accountId);
      console.log(
        `${accountCreatorQuest.accountId} creator quest completed: ${accountCreatorQuest.completed}`
      );
      const numComponentsCreated = accountCreatorQuest.numComponentsCreated + 1;

      const creatorQuestCompleted =
        numComponentsCreated >= 3 && accountCreatorQuest.completed === false;
      if (creatorQuestCompleted) {
        console.log("Creator quest completed");
        const tokenId = await getSequentialId();
        await context.mint("Creator", tokenId.toString(), accountId);
      }

      await insertCreatorQuest(
        accountId,
        numComponentsCreated,
        creatorQuestCompleted
      );
    }

    const hasComposedWidget = JSON.stringify(
      Object.values(widgetEditTx.args.data[accountId]["widget"])[0]
    ).includes("<Widget");
    if (hasComposedWidget) {
      const accountComposerQuest = await queryComposerQuest(accountId);
      console.log(
        `${accountComposerQuest.accountId} composer quest completed: ${accountComposerQuest.completed}`
      );
      const numComponentsComposed =
        accountComposerQuest.numComponentsComposed + 1;

      const composerQuestCompleted =
        numComponentsComposed >= 3 && accountComposerQuest.completed === false;
      if (composerQuestCompleted) {
        console.log("Composer quest completed");
        const tokenId = await getSequentialId();
        await context.mint("Compose", tokenId.toString(), accountId);
      }

      await insertComposerQuest(
        accountId,
        numComponentsComposed,
        composerQuestCompleted
      );
    }

    const hasDeployedContract = false;
    if (hasDeployedContract) {
      console.log("Deployed contract");
    }
  });

  await Promise.all(handleQuestPromises);

  // --- Methods ---

  async function getSequentialId() {
    const { insert_morgs_near_bos_quests_token_id_one } =
      await context.graphql(`
      mutation {
        insert_morgs_near_bos_quests_token_id_one(object:{}) {
          id
        }
      }
    `);

    return insert_morgs_near_bos_quests_token_id_one.id;
  }

  async function queryCreatorQuest(accountId) {
    const { morgs_near_bos_quests_creator_quest } = await context.graphql(
      `
      query ($account_id:String){
        morgs_near_bos_quests_creator_quest(where:{account_id:{_eq:$account_id}}) {
          account_id
          completed
          num_components_created
        }
      }
    `,
      {
        account_id: accountId,
      }
    );

    const creatorQuest = morgs_near_bos_quests_creator_quest[0] || {};

    return {
      accountId: creatorQuest.account_id || accountId,
      numComponentsCreated: creatorQuest.num_components_created || 0,
      completed: creatorQuest.completed,
    };
  }

  async function queryComposerQuest(accountId) {
    const { morgs_near_bos_quests_composer_quest } = await context.graphql(
      `
      query ($account_id:String){
        morgs_near_bos_quests_composer_quest(where:{account_id:{_eq:$account_id}}) {
          account_id
          completed
          num_widgets_composed
        }
      }
    `,
      {
        account_id: accountId,
      }
    );

    const composerQuest = morgs_near_bos_quests_composer_quest[0] || {};

    return {
      accountId: composerQuest.account_id || accountId,
      numComponentsComposed: composerQuest.num_widgets_composed || 0,
      completed: composerQuest.completed,
    };
  }

  function insertCreatorQuest(accountId, numComponentsCreated, completed) {
    return context.graphql(
      `
      mutation ($obj:morgs_near_bos_quests_creator_quest_insert_input!) {
        insert_morgs_near_bos_quests_creator_quest_one(object: $obj, on_conflict:{update_columns:[completed, num_components_created], constraint:creator_quest_pkey}) {
          account_id
          completed
          num_components_created
        }
      }    
    `,
      {
        obj: {
          account_id: accountId,
          num_components_created: numComponentsCreated,
          completed: completed,
        },
      }
    );
  }

  function insertComposerQuest(accountId, numComponentsComposed, completed) {
    return context.graphql(
      `
      mutation ($obj:morgs_near_bos_quests_composer_quest_insert_input!) {
        insert_morgs_near_bos_quests_composer_quest_one(object: $obj, on_conflict:{update_columns:[completed, num_widgets_composed], constraint:composer_quest_pkey}) {
          account_id
          completed
          num_widgets_composed
        }
      }
    `,
      {
        obj: {
          account_id: accountId,
          num_widgets_composed: numComponentsComposed,
          completed: completed,
        },
      }
    );
  }

  function base64decode(encodedValue) {
    // @ts-ignore
    let buff = Buffer.from(encodedValue, "base64");
    return JSON.parse(buff.toString("utf-8"));
  }
}
