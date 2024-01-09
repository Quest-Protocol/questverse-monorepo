const accountId = props.accountId ?? context.accountId;
const questId = props.questId ?? 3;
const pageUrl = props.url ?? "/bos.questverse.near/widget/pages.Discover";

const quest =
  props.quest ??
  Near.view("v0.questverse.near", "quest_by_id", { quest_id: questId });

if (!quest) {
  return "quest data missing";
}

const questUrl = `/bos.questverse.near/widget/pages.QuestDetailsPage?questId=${questId}`;

const isEligible = props.isEligible ?? true;

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 39px;
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

const amount = (quest.total_reward_amount / 1000000000000000000000000).toFixed(
  1
);

const indexer = quest.indexer_name;

const openClaims = quest.total_participants_allowed - quest.num_claimed_rewards;

return (
  <>
    <Card>
      <CardLeft>
        <div className="d-flex flex-column me-3">
          <div className="d-flex flex-row me-3">
            <div className="me-3">
              <a href={questUrl}>
                <Widget
                  src="mob.near/widget/ProfileImage"
                  props={{
                    accountId: `${quest.creator}`,
                    imageStyle: {
                      objectFit: "cover",
                      borderRadius: "0.6em",
                    },
                    imageClassName: "w-100 h-100",
                  }}
                />
              </a>
            </div>
            <div className="text-truncate mb-1">
              <a href={questUrl} style={{ textDecoration: "none" }}>
                <span className="fw-bold" style={{ color: "black" }}>
                  {indexer}
                </span>
              </a>
              <p>@{quest.creator}</p>
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
                        href={`${pageUrl}?tag=${tag}`}
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
          <div className="d-flex flex-row me-3">
            <Widget
              src="hack.near/widget/tags"
              props={{
                path: `${quest.creator}/quest/${quest.quest_id}`,
                url: "/bos.questverse.near/widget/pages.Discover",
              }}
            />
          </div>
        </div>
      </CardLeft>
      <div className="d-flex flex-row me-3">
        <p>
          <Widget
            src="mob.near/widget/N.Overlay.Faces"
            props={{ accounts: quest.participants, limit: 10 }}
          />
          {quest.participants.length !== 0 && "done"}
        </p>
      </div>
      <div className="d-flex flex-column">
        <p>
          <b>Starts At:</b>
        </p>
        <p>{new Date(quest.starts_at).toLocaleString()}</p>
      </div>
      <div className="d-flex flex-column">
        <p>
          <b>Expires At:</b>
        </p>
        <p>{new Date(quest.expires_at).toLocaleString()}</p>
      </div>
      {!isVerified && context.accountId && (
        <div className="d-flex flex-column m12">
          <b>{amount} NEAR</b>

          <Widget src="bos.questverse.near/widget/components.quest.claim" props={{ questId }} />
          <p className="text-center mt-1">
            <i>{openClaims} left</i>
          </p>
          <p className="text-center">
            <i>{quest.total_participants_allowed} total</i>
          </p>
        </div>
      )}
    </Card>
  </>
);
