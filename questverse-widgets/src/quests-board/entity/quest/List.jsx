
// This component implementation was forked from [IndexFeed], but it does not fully implement lazy loading.
// While this component uses InfiniteScroll, it still loads the whole list of Post IDs in one view call.
// The contract will need to be extended with pagination support, yet, even in the current state the page loads much faster.
// [IndexFeed]: https://near.social/#/mob.near/widget/WidgetSource?src=mob.near/widget/IndexFeed

/* INCLUDE: "common.jsx" */
const questVersePrtocolAccountId =
  props.questVersePrtocolAccountId ||
  (context.widgetSrc ?? "quests.near").split("/", 1)[0];

const nearQuestVerseWidgetsAccountId =
  props.nearQuestVerseWidgetsAccountId ||
  (context.widgetSrc ?? "quests.near").split("/", 1)[0];

function widget(widgetName, widgetProps, key) {
  widgetProps = {
    ...widgetProps,
    questVersePrtocolAccountId: props.questVersePrtocolAccountId,
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

  if (props.questVersePrtocolAccountId) {
    linkProps.questVersePrtocolAccountId =
      props.questVersePrtocolAccountId;
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

function defaultRenderItem(questId, additionalProps) {
  if (!additionalProps) {
    additionalProps = {};
  }
  // It is important to have a non-zero-height element as otherwise InfiniteScroll loads too many items on initial load
  return (
    <div className="py-2" style={{ minHeight: "150px" }}>
      {widget(
        `entity.quest.Quest`,
        {
          id: questId,
          ...additionalProps,
        },
        questId
      )}
    </div>
  );
}

const renderItem = props.renderItem ?? defaultRenderItem;

const cachedRenderItem = (item, i) => {
  const key = JSON.stringify(item);

  if (!(key in state.cachedItems)) {
    state.cachedItems[key] = renderItem(item);
    State.update();
  }
  return state.cachedItems[key];
};

const initialRenderLimit = props.initialRenderLimit ?? 3;
const addDisplayCount = props.nextLimit ?? initialRenderLimit;

const ONE_DAY = 60 * 60 * 24 * 1000;
const ONE_WEEK = 60 * 60 * 24 * 1000 * 7;
const ONE_MONTH = 60 * 60 * 24 * 1000 * 30;

let questIds;
if (props.recency == "all") {
  questIds = Near.view(questVersePrtocolAccountId, "get_all_quest_ids");
  if (questIds) {
    questIds.reverse();
  }
} else if (props.recency == "active") {
  console.log("loading active");
} else if (props.recency == "expired") {
  console.log("loading expired");
} else if (props.recency == "upcoming") {
  console.log("loading upcoming");
}

const loader = (
  <div className="loader" key={"loader"}>
    <span
      className="spinner-grow spinner-grow-sm me-1"
      role="status"
      aria-hidden="true"
    />
    Loading ...
  </div>
);

if (questIds === null) {
  return loader;
}
const initialItems = questIds;
const jInitialItems = JSON.stringify(initialItems);

if (state.jInitialItems !== jInitialItems) {
  // const jIndex = JSON.stringify(index);
  // if (jIndex !== state.jIndex) {
  State.update({
    jIndex,
    jInitialItems,
    items: initialItems,
    fetchFrom: false,
    //nextFetchFrom: computeFetchFrom(initialItems, index.options.limit),
    nextFetchFrom: false,
    displayCount: initialRenderLimit,
    cachedItems: {},
  });
}

const makeMoreItems = () => {
  State.update({
    displayCount: state.displayCount + addDisplayCount,
  });
  if (
    state.items.length - state.displayCount < addDisplayCount * 2 &&
    !state.fetchFrom &&
    state.nextFetchFrom &&
    state.nextFetchFrom !== state.fetchFrom
  ) {
    State.update({
      fetchFrom: state.nextFetchFrom,
    });
  }
};

const fetchMore =
  props.manual &&
  (state.fetchFrom && state.items.length < state.displayCount
    ? loader
    : state.displayCount < state.items.length && (
      <div key={"loader more"}>
        <a href="javascript:void" onClick={(e) => makeMoreItems()}>
          {props.loadMoreText ?? "Load more..."}
        </a>
      </div>
    ));

const items = state.items ? state.items.slice(0, state.displayCount) : [];

const renderedItems = items.map(cachedRenderItem);

return (
  <>
    {state.items.length > 0 ? (
      <InfiniteScroll
        pageStart={0}
        loadMore={makeMoreItems}
        hasMore={state.displayCount < state.items.length}
        loader={loader}
      >
        {renderedItems}
      </InfiniteScroll>
    ) : (
      "No Quests Created"
    )}
  </>
);
