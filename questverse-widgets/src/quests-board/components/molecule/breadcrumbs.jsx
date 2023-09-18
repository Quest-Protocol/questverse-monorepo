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

const Breadcrumbs = ({ classNames, path }) => (
  <div
    aria-label="breadcrumb"
    className={[
      "d-flex",
      classNames?.root ?? "",
      Array.isArray(path) ? "" : "d-none",
    ].join(" ")}
    style={{ backgroundColor: "#181818" }}
  >
    <ol className="breadcrumb d-flex align-items-end m-0 h-100">
      {(path ?? []).map(({ isActive, isHidden, label, pageId, params }) => (
        <li
          aria-current="page"
          className={[
            "breadcrumb-item d-flex",
            isActive ? "active" : "",
            isHidden ? "d-none" : "",
          ].join(" ")}
        >
          <a
            className={["pb-1 lh-1 text-white", classNames?.link ?? ""].join(
              " "
            )}
            href={href(pageId, params ?? {})}
            style={{ fontWeight: 420 }}
          >
            {label}
          </a>
        </li>
      ))}
    </ol>
  </div>
);

return Breadcrumbs(props);
