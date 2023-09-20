console.log("loading for each quest");
/* INCLUDE: "common.jsx" */
const creatorQuest = {
  id: 823740323,
  title: "Creator Quest",
  description: "Publish at least 3 widgets",
  imageUrl: "Publish at least 3 widgets",
  questType: "Native",
  startTime: 1695018482000,
  endTime: 1695630800000,
  rewardAmount: 1,
  totalParticipantsAllowed: 50,
  indexerConfigId: "creator_quest",
  deployerAccountId: "roshaan.near",
};

const composerQuest = {
  id: 873740323,
  quest_order: 1,
  title: "Composer Quest",
  description: "Compose Two or more components together into one",
  questType: "Native",
  startTime: 1695018482000,
  endTime: 1695018482000,
  rewardAmount: 0.005,
  totalParticipantsAllowed: 50,
  indexerConfigId: "composer_quest",
  deployerAccountId: "near",
};

const contractorQuest = {
  id: 893740323,
  quest_order: 1,
  title: "Contractor Quest",
  description: "Deploy a smart contract and be a BOS developer",
  questType: "Native",
  startTime: 1695018482000,
  endTime: 1699018482000,
  rewardAmount: 10,
  totalParticipantsAllowed: 30,
  indexerConfigId: "contractor_quest",
  deployerAccountId: "devgovgigs.near",
};

const governanceQuest = {
  id: 813740323,
  quest_order: 1,
  title: "Near NDC",
  description: "Join a Dao & Vote on a proposal.",
  questType: "NFT",
  startTime: 1694700077000,
  endTime: 1695018482000,
  rewardAmount: 1,
  totalParticipantsAllowed: 15,
  indexerConfigId: "governance_quest",
  deployerAccountId: "election.ndctools.near",
};

const mockedQuests = {
  873740323: composerQuest,
  823740323: creatorQuest,
  893740323: contractorQuest,
  813740323: governanceQuest,
};
const nearQuestVerseContractAccountId =
  props.nearQuestVerseContractAccountId ||
  (context.widgetSrc ?? "quests.near").split("/", 1)[0];

const nearQuestVerseWidgetsAccountId =
  props.nearQuestVerseWidgetsAccountId ||
  (context.widgetSrc ?? "quests.near").split("/", 1)[0];

function widget(widgetName, widgetProps, key) {
  widgetProps = {
    ...widgetProps,
    nearQuestVerseContractAccountId: props.nearQuestVerseContractAccountId,
    nearQuestVerseWidgetsAccountId: props.nearQuestVerseWidgetsAccountId,
    referral: props.referral,
  };

  return (
    <Widget
      src={`${nearQuestVerseWidgetsAccountId}/widget/quests-board.${widgetName}`}
      props={widgetProps}
      key={key}
    />
  );
}

function href(widgetName, linkProps) {
  linkProps = { ...linkProps };

  if (props.nearQuestVerseContractAccountId) {
    linkProps.nearQuestVerseContractAccountId =
      props.nearQuestVerseContractAccountId;
  }

  if (props.nearQuestVerseWidgetsAccountId) {
    linkProps.nearQuestVerseWidgetsAccountId =
      props.nearQuestVerseWidgetsAccountId;
  }

  const linkPropsQuery = Object.entries(linkProps)
    .filter(([_key, nullable]) => (nullable ?? null) !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `/#/${nearQuestVerseWidgetsAccountId}/widget/quests-board.entity.quest.${widgetName}${linkPropsQuery ? "?" : ""
    }${linkPropsQuery}`;
}
/* END_INCLUDE: "common.jsx" */
/* INCLUDE: "core/lib/gui/attractable" */
const AttractableDiv = styled.div`
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  transition: box-shadow 0.6s;

  &:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  }
`;

const AttractableLink = styled.a`
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  transition: box-shadow 0.6s;

  &:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  }
`;

const AttractableImage = styled.img`
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  transition: box-shadow 0.6s;

  &:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  }
`;
/* END_INCLUDE: "core/lib/gui/attractable" */

const ButtonWithHover = styled.button`
  background-color: #fff;
  &:hover {
    background-color: #e9ecef;
    color: #000;
  }
`;

const questId = props.quest.id ?? (props.id ? parseInt(props.id) : 0);
console.log(JSON.stringify(props), "printing all props");
const quest =
  props.quest ??
  mockedQuests[questId] ??
  Near.view(nearQuestVerseContractAccountId, "get_quest_by_id", {
    quest_id: questId,
  });
if (!quest) {
  return <div>Loading ...</div>;
}
console.log("quest", quest);
const currentTimestamp = props.timestamp;
const compareTimestamp = props.compareTimestamp ?? "";
const swapTimestamps = currentTimestamp < compareTimestamp;

function readableDate(timestamp) {
  var a = new Date(timestamp);
  console.log(a, "a");
  return a.toDateString() + " " + a.toLocaleTimeString();
}

const startTimestamp = readableDate(quest.startTime);
const endTimestamp = readableDate(quest.endTime);

const is_quest_expired = quest.endTime < Date.now() * 1000000;
const is_quest_active = quest.startTime < Date.now() * 1000000;
const is_quest_upcoming = quest.startTime > Date.now() * 1000000;

const quest_status = () => {
  if (is_quest_expired) {
    return "Expired";
  } else if (is_quest_active) {
    return "Active";
  } else if (is_quest_upcoming) {
    return "Upcoming";
  }
};

const shareButton = (
  <a
    class="card-link text-dark"
    href={href("Quest", { id: questId })}
    role="button"
    target="_blank"
    title="Open in new tab"
  >
    <div class="bi bi-share"></div>
  </a>
);

// card-header
const header = (
  <div className="p-3 pt-4" key="header">
    <small class="text-muted">
      <div class="row justify-content-between">
        <div class="col-4">
          {widget("components.molecule.profile-card", {
            accountId: quest.deployerAccountId,
          })}
        </div>
        <div class="col-5">
          <div class="d-flex justify-content-end">
            Quest Status: {quest_status()}
  </div>
          <div class="d-flex justify-content-end">
            {shareButton}
          </div>
        </div>
      </div>
    </small>
  </div>
);

const editUrl = `https://near.org/#/dev-queryapi.dataplatform.near/widget/QueryApi.App?selectedIndexerPath=morgs.near/bos_quests/view=editor-window`;
const tokenMapping = {
  NEAR: "NEAR",
  Native: "NEAR",
  NFT: "Digital Collectible",
};

// const reverseTokenMapping = Object.keys(tokenMapping).reduce(
//   (reverseMap, key) => {
//     const value = tokenMapping[key];
//     if (typeof value === "object") {
//       reverseMap[JSON.stringify(value)] = key;
//     }
//     return reverseMap;
//   },
//   {}
// );
function tokenResolver(reward_type) {
    const tokenString = tokenMapping[reward_type];
    return tokenString || null;
}
const questExtra = (
  <div key="quest-extra">
    <h6>
      <a class="text-muted" href={editUrl}>
        Live Indexer: Dataplatform.near/{quest.indexerConfigId}
      </a>
    </h6>
    <h6 class="card-subtitle mb-2 text-muted">
      Reward amount: {quest.rewardAmount} {tokenResolver(quest.questType)}
    </h6>
    <h6 class="card-subtitle mb-2 text-muted">
      Total Participants Allowed: {quest.totalParticipantsAllowed}
    </h6>
    <h6 class="card-subtitle mb-2 text-muted">
      Quest Starts {startTimestamp}
    </h6>
    <h6 class="card-subtitle mb-2 text-muted">Quest Ends {endTimestamp}</h6>
  </div>
);

// TODO Replace likes on Quests with Quest Signups.
//
//
// const containsLike = quest.likes.find((l) => l.author_id == context.accountId);
const likeBtnClass = containsLike ? fillIcons.Like : emptyIcons.Like;
// This must be outside onLike, because Near.view returns null at first, and when the view call finished, it returns true/false.
// If checking this inside onLike, it will give `null` and we cannot tell the result is true or false.
// let grantNotify = Near.view("social.near", "is_write_permission_granted", {
//   predecessor_id: nearQuestVerseContractAccountId,
//   key: context.accountId + "/index/notify",
// });
// if (grantNotify === null) {
//   return;
// }
// const onLike = () => {
//   if (!context.accountId) {
//     return;
//   }
//   let likeTxn = [
//     {
//       contractName: nearQuestVerseContractAccountId,
//       methodName: "add_like",
//       args: {
//         post_id: postId,
//       },
//       deposit: Big(10).pow(21).mul(2),
//       gas: Big(10).pow(12).mul(100),
//     },
//   ];
//
//   if (grantNotify === false) {
//     likeTxn.unshift({
//       contractName: "social.near",
//       methodName: "grant_write_permission",
//       args: {
//         predecessor_id: nearQuestVerseContractAccountId,
//         keys: [context.accountId + "/index/notify"],
//       },
//       deposit: Big(10).pow(23),
//       gas: Big(10).pow(12).mul(30),
//     });
//   }
//   Near.call(likeTxn);
// };
//
  const Button = styled.button`
  height: 40px;
  font-size: 14px;
  background-color: #1778F2;
`;

const buttonsFooter =
  <div class="d-flex justify-content-end" key="buttons-footer">
    <div class="col-8">
      <div class="d-flex justify-content-end" aria-label="Basic outlined example">
        <Button
          type="button"
          style={{"color":"white"}}
          onClick={onParticipate}
        >
        Sign Up for Quest!
        </Button>
      </div>
    </div>
  </div>;

//

const timestampElement = (quest) => {
  return (
    <a
      class="text-muted"
      href={href("Quest", {
        id: quest.questId,
        timestamp: quest.startTime,
      })}
    >
      Starts: {readableDate(quest.startTime).substring(4)}
      Ends: {readableDate(quest.endTime).substring(4)}
      <Widget
        src="mob.near/widget/ProfileImage"
        props={{
          accountId: quest.deployer_id,
          style: {
            width: "1.25em",
            height: "1.25em",
          },
          imageStyle: {
            transform: "translateY(-12.5%)",
          },
        }}
      />
    </a>
  );
};

const renderQuest = (quest) => {
  const Card = styled.div`
    position: relative;
    width: 100%;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #eceef0;
    box-shadow: 0px 1px 3px rgba(16, 24, 40, 0.1),
      0px 1px 2px rgba(16, 24, 40, 0.06);
    overflow: hidden;
    margin-bottom: 24px;
  `;

  const CardBody = styled.div`
    padding: 16px;
    display: flex;
    gap: 16px;
    align-items: center;

    > * {
      min-width: 0;
    }
  `;

  const CardContent = styled.div`
    width: 100%;
  `;

  const CardFooter = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px;
    border-top: 1px solid #eceef0;
  `;

  const CardTag = styled.p`
    margin: 0;
    font-size: 9px;
    line-height: 14px;
    background: #eceef0;
    color: #687076;
    font-weight: 400;
    white-space: nowrap;
    position: absolute;
    top: 0;
    right: 0;
    border-bottom-left-radius: 3px;
    padding: 0 4px;

    i {
      margin-right: 3px;
    }
  `;

  const TextLink = styled.a`
    display: block;
    margin: 0;
    font-size: 14px;
    line-height: 18px;
    color: ${(p) => (p.bold ? "#11181C !important" : "#687076 !important")};
    font-weight: ${(p) => (p.bold ? "600" : "400")};
    font-size: ${(p) => (p.small ? "12px" : "14px")};
    overflow: ${(p) => (p.ellipsis ? "hidden" : "visible")};
    text-overflow: ${(p) => (p.ellipsis ? "ellipsis" : "unset")};
    white-space: nowrap;
    outline: none;

    &:focus,
    &:hover {
      text-decoration: underline;
    }
  `;

  const Text = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    color: ${(p) => (p.bold ? "#11181C" : "#687076")};
    font-weight: ${(p) => (p.bold ? "600" : "400")};
    font-size: ${(p) => (p.small ? "12px" : "14px")};
    overflow: ${(p) => (p.ellipsis ? "hidden" : "")};
    text-overflow: ${(p) => (p.ellipsis ? "ellipsis" : "")};
    white-space: nowrap;

    i {
      margin-right: 3px;
    }
  `;

  const Thumbnail = styled.a`
    display: block;
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    border: 1px solid #eceef0;
    border-radius: 8px;
    overflow: hidden;
    outline: none;
    transition: border-color 200ms;

    &:focus,
    &:hover {
      border-color: #d0d5dd;
    }

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  `;

  const Row = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  `;
  const TagsWrapper = styled.div`
    position: relative;
    margin-top: 4px;
  `;

  const ButtonLink = styled.a`
    padding: 8px;
    height: 32px;
    border: 1px solid #d7dbdf;
    border-radius: 100px;
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;
    text-align: center;
    cursor: pointer;
    color: ${(p) => (p.primary ? "#006ADC" : "#11181C")} !important;
    background: #fbfcfd;
    white-space: nowrap;

    &:hover,
    &:focus {
      background: #ecedee;
      text-decoration: none;
      outline: none;
    }
  `;

  return (
    <Card>
      <CardBody>
        <Thumbnail>
          <Widget
            src="mob.near/widget/Image"
            props={{
              image: metadata.image,
              fallbackUrl: quest.imageUrl,
              alt: "Near QueryApi indexer",
            }}
          />
        </Thumbnail>
        <Row>
          <div className={{ display: "flex", "flex-direction": "row" }}>
            <TextLink as="a" bold ellipsis>
              {quest.title}
            </TextLink>
          </div>
    Description: <div>{quest.description}</div>
        </Row>
      </CardBody>
    </Card>
  );
};

const emptyIcons = {
  Native: "bi-currency-bitcoin",
  Nft: "bi-palette-fill",
  Like: "bi-heart",
  Reply: "bi-reply",
};

// <i class={`bi ${emptyIcons[quest.questType]}`}> </i>
const questTitle =
  quest.quest_order != 1 ? (
    <div key="post-title"></div>
  ) : (
    <h5 class="card-title mb-2" key="post-title">
      <div className="row justify-content-between">
        <div class="col-9">
          {quest.title}
        </div>
      </div>
    </h5>
  );

const contentArray = quest.description.split("\n");
const needClamp = contentArray.length > 5;

initState({
  quest: undefined,
  clamp: needClamp,
});

console.log("load props here Quest 2, ", props);
const clampedContent = needClamp
  ? contentArray.slice(0, 3).join("\n")
  : quest.description;

// Should make sure the posts under the currently top viewed post are limited in size.
const descriptionArea = (
  <div class="pt-2">
    <div class={state.clamp ? "clamp" : ""}>
      {widget("components.molecule.markdown-viewer", {
        text: `Description: ${state.clamp ? clampedContent : quest.description}`,
      })}
    </div>
    {state.clamp ? (
      <div class="d-flex justify-content-start">
        <a
          class="btn-link text-dark fw-bold text-decoration-none"
          onClick={() => State.update({ clamp: false })}
        >
          See more
        </a>
      </div>
    ) : (
      <></>
    )}
  </div>
);
// isSecondaryQuest ? (
// <LimitedMarkdown className="overflow-auto" key="description-area">
//   {widget("components.molecule.markdown-viewer", {
//     text: quest.description,
//   })}
// </LimitedMarkdown>
// ) :

const renderedQuest = () => {
  <div class="row" key="quests-list">
    <div>renderQuest(quest)</div>
  </div>;
};

console.log("load props here Quest 1, ", props);
return (
  <AttractableDiv className={`card`}>
    {header}
    <div className="card-body">
      <>
        {questTitle}
        {questExtra}
        {descriptionArea}
      </>
      {buttonsFooter}
    </div>
  </AttractableDiv>
);
