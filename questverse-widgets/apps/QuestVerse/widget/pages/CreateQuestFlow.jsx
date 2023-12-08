const QUESTVERSE_CONTRACT = "/*__@replace:QUESTVERSE_CONTRACT__*/";
const QUERYAPI_CONTRACT = "/*__@replace:QUERYAPI_CONTRACT__*/";
const API_SIGNER_SERVICE = "/*__@replace:API_SIGNER_SERVICE__*/";

const type = props.type ?? "quest";

function generateId() {
  return (
    Math.random().toString(16).slice(2, 10) +
    Date.now().toString(36).slice(-2) +
    Math.random().toString(16).slice(2, 10)
  );
}

const questId = props.questId ?? generateId();

const composeData = () => {
  // generate a random id
  const thingId = questId;
  const data = {
    // this can be moved to "create" module, passed type, data, and metadata
    [type]: {
      [thingId]: {
        "": JSON.stringify({
          thing,
        }),
        metadata: {
          type,
        },
      },
    },
    post: {
      // move to "post" module, passed the path and type
      main: JSON.stringify({
        content: `[+EMBED](https://near.social/${context.accountId}/${type}/${thingId})`,
      }),
    },
    index: {
      post: JSON.stringify({ key: "main", value: { type: "md" } }),
    },
    // index: {
    //   every: JSON.stringify({
    //     key: type,
    //     value: {
    //       path: `${context.accountId}/${type}/${thingId}`,
    //       type,
    //     },
    //   }),
    // },
  };

  // const notifications = extractTagNotifications(state.thing.text, {
  //   type: "social",
  //   path: `${context.accountId}/thing/${thingId}`,
  // });

  // if (notifications.length) { // notifications module
  //   data.index.notify = JSON.stringify(
  //     notifications.length > 1 ? notifications : notifications[0]
  //   );
  // }

  return data;
};

return (
  <>
    <CommitButton force data={composeData()}>
      create
    </CommitButton>
  </>
);

return (
  <>
    <h1>Hello BOS</h1>
    <p>Deploying to /*__@appAccount__*/</p>
    <p>QUESTVERSE_CONTRACT: {QUESTVERSE_CONTRACT}</p>
    <p>QUERYAPI_CONTRACT: {QUERYAPI_CONTRACT}</p>
    <p>API_SIGNER_SERVICE: {API_SIGNER_SERVICE}</p>
    <Widget src="/*__@appAccount__*//widget/components.createQuestSteps.Steps" />
  </>
);
