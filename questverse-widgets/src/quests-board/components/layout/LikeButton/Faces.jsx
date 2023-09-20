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

  return `/#/${nearQuestVerseWidgetsAccountId}/widget/quests-board.pages.${widgetName}${
    linkPropsQuery ? "?" : ""
  }${linkPropsQuery}`;
}
/* END_INCLUDE: "common.jsx" */

const accountId = context.accountId;

const likesByUsers = props.likesByUsers || {};
const limit = props.limit ?? 3;

let likes = Object.keys(likesByUsers).reverse();

const graphLikes = [];
const nonGraph = [];

const graph =
  (accountId &&
    Social.keys(`${accountId}/graph/follow/*`, "final")[accountId].graph
      .follow) ||
  {};

likes.forEach((accountId) => {
  if (accountId in graph) {
    graphLikes.push(accountId);
  } else {
    nonGraph.push(accountId);
  }
});

let faces = [...graphLikes, ...nonGraph];

if (faces.length < limit + 3) {
  limit = faces.length;
}

const renderFaces = faces.splice(0, limit);

const Faces = styled.span`
  .face {
    display: inline-block;
    position: relative;
    margin: -0.1em;
    height: 1.5em;
    width: 1.5em;
    min-width: 1.5em;
    vertical-align: top;
    img {
      object-fit: cover;
      border-radius: 50%;
      width: 100%;
      height: 100%;
    }
  }
`;

const Others = styled.span`
  &:hover {
    color: white !important;
  }
`;

const numLikes = likes.length - limit;

return (
  <>
    <Faces className="ms-1">
      {renderFaces.map((accountId, i) => (
        <a
          key={i}
          href={`#/mob.near/widget/ProfilePage?accountId=${accountId}`}
          className="text-decoration-none d-inline-block"
        >
          <Widget
            src="mob.near/widget/Profile.OverlayTrigger"
            props={{
              accountId,
              children: (
                <Widget
                  src="mob.near/widget/ProfileImage"
                  props={{
                    metadata,
                    accountId,
                    widgetName,
                    style: { zIndex: 10 - i },
                    className: "face",
                    tooltip: false,
                    imageStyle: {},
                    imageClassName: "",
                  }}
                />
              ),
            }}
          />
        </a>
      ))}
    </Faces>
  </>
);
