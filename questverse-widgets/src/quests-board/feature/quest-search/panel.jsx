/* INCLUDE: "common.jsx" */
const  questVerseProtocolAccountId =
  props. questVerseProtocolAccountId ||
  (context.widgetSrc ?? "quests.near").split("/", 1)[0];

const nearQuestVerseWidgetsAccountId =
  props.nearQuestVerseWidgetsAccountId ||
  (context.widgetSrc ?? "quests.near").split("/", 1)[0];


function widget(widgetName, widgetProps, key) {
  widgetProps = {
    ...widgetProps,
     questVerseProtocolAccountId: props. questVerseProtocolAccountId,
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

  if (props. questVerseProtocolAccountId) {
    linkProps. questVerseProtocolAccountId =
      props. questVerseProtocolAccountId;
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

return (
  <>
    <div className="d-flex flex-row gap-4">
      <div className="d-flex flex-row position-relative w-25">
        <div className="position-absolute d-flex ps-3 flex-column h-100 justify-center">
          {state.loading ? (
            <span
              className="spinner-grow spinner-grow-sm m-auto"
              role="status"
              aria-hidden="true"
            />
          ) : (
            <i class="bi bi-search m-auto"></i>
          )}
        </div>
        <input
          type="search"
          className="ps-5 form-control border border-0 bg-light"
          value={state.term ?? ""}
          onChange={(e) => updateInput(e.target.value)}
          placeholder={props.placeholder ?? `Search Quests`}
        />
      </div>
      <div class="dropdown">
        <button
          class="btn btn-light dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Sort
        </button>
        <ul class="dropdown-menu px-2 shadow">
          <li>
            <a
              style={{ borderRadius: "5px" }}
              class="dropdown-item link-underline link-underline-opacity-0"
              href={href("Feed")}
            >
              Active
            </a>
          </li>
          <li>
            <a
              style={{ borderRadius: "5px" }}
              class="dropdown-item link-underline link-underline-opacity-0"
              href={href("Feed")}
            >
              Upcoming
            </a>
          </li>
          <li>
            <a
              style={{ borderRadius: "5px" }}
              class="dropdown-item link-underline link-underline-opacity-0"
              href={href("Feed", { recency: "all" })}
            >
              All
            </a>
          </li>
          <li>
            <a
              style={{ borderRadius: "5px" }}
              class="dropdown-item link-underline link-underline-opacity-0"
              href={href("Feed", { recency: "expired" })}
            >
              Expired
            </a>
          </li>
        </ul>
      </div>
      <div className="d-flex flex-row-reverse flex-grow-1">
        {props.children}
      </div>
    </div>
    {widget("entity.quest.List", {
      recency: props.recency,
      transactionHashes: props.transactionHashes,
    })}
  </>
);
