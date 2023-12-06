const nearQuestVerseContractAccountId =
  props.nearQuestVerseContractAccountId ||
  (context.widgetSrc ?? "quests.near").split("/", 1)[0];

const nearQuestVerseWidgetsAccountId =
  props.nearQuestVerseWidgetsAccountId ||
  (context.widgetSrc ?? "quests.near").split("/", 1)[0];

console.log(`${REPL_QUESTVERSE_CONTRACT}`);
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
/* INCLUDE: "core/adapter/dev-hub" */
const questVerseAccountId =
  props.nearQuestVerseContractAccountId ||
  (context.widgetSrc ?? "quests.near").split("/", 1)[0];

const QuestVerseProtocol = {
  get_all_deployers: () => Near.view(questVerseAccountId, "get_all_deployers") ?? null,

  get_all_quests: () => Near.view(questVerseAccountId, "get_all_quests") ?? null,

  get_quests_by_deployer: ({ deployer }) =>
    Near.view(questVerseAccountId, "get_quests_by_deployer", { deployer }) ?? null,

  get_quest_by_id: ({ quest_id }) =>
    Near.view(questVerseAccountId, "get_quest_by_id", { quest_id }) ?? null,

  useQuery: ({ name, params }) => {
    const initialState = { data: null, error: null, isLoading: true };

    const cacheState = useCache(
      () =>
        Near.asyncView(questVerseAccountId, ["get", name].join("_"), params ?? {})
          .then((response) => ({
            ...initialState,
            data: response ?? null,
            isLoading: false,
          }))
          .catch((error) => ({
            ...initialState,
            error: props?.error ?? error,
            isLoading: false,
          })),

      JSON.stringify({ name, params }),
      { subscribe: true }
    );

    return cacheState === null ? initialState : cacheState;
  },
};
/* END_INCLUDE: "core/adapter/dev-hub" */

const Gradient = styled.div`
   {
    background-color: #F3E8C2;
    height: 250px;
    text-align: center;
    font-family: Arial, sans-serif;
  }

  img {
    height: 60px;
  }

  .text-primary-gradient {
    color: #53fdca;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(#1778F2, #1778F2);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .subtitle-above {
    font-size: 18px;
    letter-spacing: 1px;
    font-family: Courier, monospace;
  }

  .subtitle-below {
    font-size: 16px;
  }

  .slogan {
    font-weight: 600;
    font-size: 60px;
  }
`;

const banner = (
  <div className="d-flex flex-column">
    <Gradient className="d-flex flex-column justify-content-center">

      <h1 className="mb-3 text-black slogan">
          <img src="https://bafkreicunntg4dhmttenyfaz27irxoq3pq5wt25by4ex6ankuzoclj2haa.ipfs.nftstorage.link/"></img>
      </h1>

      <div className="subtitle-below text-black opacity-75">
        Earn Crypto Native Assets By Completing Quests!
      </div>
    </Gradient>

    <div className="h5 pb-4"></div>
  </div>
);

const FeedPage = ({ recency }) => {

  return widget("components.template.app-layout", {
    banner,
    children: widget("feature.quest-search.panel", {
      author: state.author,
      authorQuery: { author: state.author },
      children: widget("components.layout.Controls"),
      onAuthorSearch,
      onTagSearch,
      recency,
      tag: state.tag,
      tagQuery: { tag: state.tag },
      transactionHashes: props.transactionHashes,
    }),
  });
};

return FeedPage(props);
