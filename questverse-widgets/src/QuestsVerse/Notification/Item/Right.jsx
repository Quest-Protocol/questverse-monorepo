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

return props.post === undefined ? (
  "Loading ..."
) : (
  <>
    <a className="btn btn-outline-dark" href={href("Quest", { id: props.quest })}>
      View Quest
    </a>
  </>
);
