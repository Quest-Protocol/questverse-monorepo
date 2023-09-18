/* INCLUDE: "common.jsx" */
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

  if (props.referral) {
    linkProps.referral = props.referral;
  }

  const linkPropsQuery = Object.entries(linkProps)
    .filter(([_key, nullable]) => (nullable ?? null) !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `/#/${nearQuestVerseWidgetsAccountId}/widget/quests-board.pages.${widgetName}${linkPropsQuery ? "?" : ""
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
const quest =
  props.quest ??
  Near.view(nearQuestVerseContractAccountId, "get_quest_by_id", {
    quest_id: questId,
  });
if (!quest) {
  return <div>Loading ...</div>;
}

const currentTimestamp = props.timestamp;
const compareTimestamp = props.compareTimestamp ?? "";
const swapTimestamps = currentTimestamp < compareTimestamp;

function readableDate(timestamp) {
  var a = new Date(timestamp);
  return a.toDateString() + " " + a.toLocaleTimeString();
}

const timestamp = readableDate(
  snapshot.timestamp ? snapshot.timestamp / 1000000 : Date.now()
);

const shareButton = (
  <a
    class="card-link text-dark"
    href={href("Post", { id: questId })}
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
            accountId: post.deployer_id,
          })}
        </div>
        <div class="col-5">
          <div class="d-flex justify-content-end">
            {timestamp}
            {shareButton}
          </div>
        </div>
      </div>
    </small>
  </div>
);

// TODO Replace likes on Quests with Quest Signups.
//
//
// const containsLike = quest.likes.find((l) => l.author_id == context.accountId);
// const likeBtnClass = containsLike ? fillIcons.Like : emptyIcons.Like;
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
// const buttonsFooter =
//   <div class="row" key="buttons-footer">
//     <div class="col-8">
//       <div class="btn-group" role="group" aria-label="Basic outlined example">
//         <ButtonWithHover
//           type="button"
//           class="btn"
//           style={{ border: "0px" }}
//           onClick={onLike}
//         >
//           <i class={`bi ${likeBtnClass}`}> </i>
//           {post.likes.length == 0
//             ? "Like"
//             : widget("components.layout.LikeButton.Faces", {
//                 likesByUsers: Object.fromEntries(
//                   post.likes.map(({ author_id }) => [author_id, ""])
//                 ),
//               })}
//         </ButtonWithHover>
//       </div>
//     </div>
//   </div>;

// const tokenMapping = {
//   NEAR: "NEAR",
//   USDT: {
//     NEP141: {
//       address: "usdt.tether-token.near",
//     },
//   },
//   // Add more tokens here as needed
// };

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
//
// function tokenResolver(token) {
//   if (typeof token === "string") {
//     return token;
//   } else if (typeof token === "object") {
//     const tokenString = reverseTokenMapping[JSON.stringify(token)];
//     return tokenString || null;
//   } else {
//     return null; // Invalid input
//   }
// }
//
initState({
  quest: undefined,
});

const timestampElement = (_snapshot) => {
  return (
    <a
      class="text-muted"
      href={href("Post", {
        id: postId,
        timestamp: _snapshot.timestamp,
        compareTimestamp: null,
        referral,
      })}
    >
      {readableDate(_snapshot.timestamp / 1000000).substring(4)}
      <Widget
        src="mob.near/widget/ProfileImage"
        props={{
          accountId: _snapshot.editor_id,
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
  const {title, description, imageUrl} = quest
  console.log("rendereding quest", quest);
  const accountId = props.accountId;

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
              fallbackUrl: imageUrl,
              alt: "Near QueryApi indexer",
            }}
          />
        </Thumbnail>
        <Row>
          <div className={{ display: "flex", "flex-direction": "row" }}>
            <TextLink as="a" bold ellipsis>
              {title}
            </TextLink>
          </div>
          <div>{description}</div>
        </Row>
      </CardBody>
    </Card>
  );
};

const renderedQuest = () => {
  <div class="row" key="quests-list">
    <div>
      renderQuest(quest)
    </div>
  </div>
}
return (
  <AttractableDiv className={`card`}>
    {header}
    <div className="card-body">{quest}</div>
  </AttractableDiv>
);
