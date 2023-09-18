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

return (
  <div class="card border-secondary mb-2">
    <div class="nav navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item ">
            <a class="nav-link active" href={href("Feed")}>
              <i class="bi-house-fill"> </i>
              Home
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href={href("Feed", { recency: "all" })}>
              <i class="bi-envelope-fill"> </i>
              Recent
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link active"
              href={href("Feed", { label: "recurrent" })}
            >
              <i class="bi-repeat"> </i>
              Recurrent
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href={href("Feed", { recency: "hot" })}>
              <i class="bi-fire"> </i>
              Hottest
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href={href("Boards")}>
              <i class="bi-kanban"> </i>
              Boards
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link active"
              href={href("Teams")}
              title="View teams and permissions"
            >
              <i class="bi-people-fill"> </i>
              Teams
            </a>
          </li>

          {props.children
            ? props.children.map((child) => (
                <li class="nav-item active ms-2">{child}</li>
              ))
            : null}
        </ul>
      </div>
    </div>
  </div>
);
