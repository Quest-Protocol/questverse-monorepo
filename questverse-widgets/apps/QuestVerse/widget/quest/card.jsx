const accountId = props.accountId ?? context.accountId;
const questId = props.questId ?? "813740323";

const quest =
  props.quest ?? Near.view("questsmock.near", "get_quest_by_id", { questId });

if (!quest) {
  return "quest data missing";
}

const questUrl = `//*__@appAccount__*//widget/quest.page?questId=${questId}`;

const isEligible = props.isEligible ?? true;

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #eceef0;
  box-shadow: 0px 1px 3px rgba(16, 24, 40, 0.1),
    0px 1px 2px rgba(16, 24, 40, 0.06);
  overflow: hidden;
  padding: 16px;
`;

const CardLeft = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
  width: 100%;
  min-width: 0;
  padding-left: 12px;

  > div {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
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

const TagsWrapper = styled.div`
  padding-top: 4px;
`;

const Tag = styled.a`
  color: black;
  text-decoration: none;

  &:hover {
    color: blue;
    text-decoration: none;
  }
`;

return (
  <Card>
    <CardLeft>
      <div className="d-flex flex-column me-3">
        <div className="d-flex flex-row me-3">
          <div className="me-3">
            <a href={questUrl}>
              <Widget
                src="mob.near/widget/ProfileImage"
                props={{
                  accountId: `create.near`,
                  imageStyle: {
                    objectFit: "cover",
                    borderRadius: "0.6em",
                  },
                  imageClassName: "w-100 h-100",
                }}
              />
            </a>
          </div>
          <div className="text-truncate">
            <div className="text-truncate mb-1">
              <a href={questUrl} style={{ textDecoration: "none" }}>
                <span className="fw-bold" style={{ color: "black" }}>
                  {quest.title}
                </span>
              </a>
            </div>
            <div className="text-truncate text-muted">
              {quest.tags.length > 0 && (
                <>
                  {quest.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="me-1 fw-light badge border border-secondary text-bg-light"
                    >
                      <a
                        href={`//*__@appAccount__*//widget/quests?tag=${tag}`}
                        style={{ textDecoration: "none" }}
                        className="no-text-decoration"
                      >
                        <Tag>#{tag}</Tag>
                      </a>
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
        <p className="mt-3 m-1">{quest.description}</p>
      </div>
    </CardLeft>
    {!isVerified && context.accountId && (
      <div className="d-flex flex-column m-3">
        <p>
          <b>{JSON.stringify(quest.reward_amount)} NEAR</b>
        </p>

        <Widget src="/*__@appAccount__*//widget/quest.claim" props={{ questId }} />
        <p className="text-center mt-1">
          <i>{JSON.stringify(quest.total_participants_allowed)} left</i>
        </p>
      </div>
    )}
  </Card>
);