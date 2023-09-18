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

const Header = styled.div`
  height: 62px;
  background: #181818;
  margin-top: -25px;
  padding: 16px 20px;

  img {
    height: 60px;
  }

  .text-primary-gradient {
    color: white;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
  }
`;

const AppHeader = ({ path }) => (
  <Header className="d-flex text-white justify-content-between align-items-center">
    <div className="d-flex gap-2">
      <a href={href("Feed")}>
        <span className="text-white">Quest Verse</span>
      </a>

      {widget("components.molecule.breadcrumbs", {
        classNames: { link: "fs-5" },
        path,
      })}
    </div>

    <div className="d-flex align-items-center gap-3">
      <a
        className="text-white"
        href="https://t.me/+Zm90mNuOKehkNjcx"
        target="_blank"
      >
        Create your own Quests!
      </a>

      <div className="btn-group" role="group">
        <button
          type="button"
          className="btn btn-outline-light border-opacity-75 rounded-circle"
          style={{
            width: "30px",
            height: "30px",
            padding: "6px 0px",
            borderWidth: "2px",
            lineHeight: "0px",
          }}
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="bi bi-question-lg"></i>
        </button>

        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <a
              target="_blank"
              className="dropdown-item"
              href="https://github.com/Quest-Protocol/questverse-monorepo/issues/new?assignees=&labels=bug&template=bug_report.md&title="
            >
              Report a bug
            </a>
          </li>

          <li>
            <a
              target="_blank"
              className="dropdown-item"
              href="https://github.com/Quest-Protocol/questverse-monorepo/issues/new?assignees=&labels=enhancement&template=feature-request.md&title="
            >
              Suggest an improvement
            </a>
          </li>
        </ul>
      </div>
    </div>
  </Header>
);

return AppHeader(props);
