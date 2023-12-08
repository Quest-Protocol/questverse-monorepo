const accountId = props.accountId ?? context.accountId;
const questId = props.questId ?? "813740323";
const notifyAccountId = props.notifyAccountId ?? true;

const quest =
  props.quest ?? Near.view("questsmock.near", "get_quest_by_id", { questId });

if (!quest) {
  return "quest data missing";
}

const questUrl = `//*__@appAccount__*//widget/quest.page?questId=${questId}`;

const isEligible = props.isEligible ?? true;
State.init({ quests: [] });
let quests_idx =
  Social.index("quest", Number(questId), {
    subscribe: true,
    order: "desc",
  }) ?? [];

const dataLoading = state.quests === null;

const questsByUsers = {};
(quests_idx || []).forEach((quest) => {
  if (quest.value.type === "accept") {
    questsByUsers[quest.accountId] = quest;
  } else if (quest.value.type === "unaccept") {
    delete questsByUsers[quest.accountId];
  }
});

if (state.hasAccepted === true) {
  questsByUsers[context.accountId] = {
    accountId: context.accountId,
  };
} else if (state.hasAccepted === false) {
  delete questsByUsers[context.accountId];
}

const accountsWithQuests = questsByUsers;
console.log(accountsWithQuests, "accountsWithQuests");

const hasAccepted = context.accountId && !!questsByUsers[context.accountId];
const hasAcceptedOptimistic =
  state.hasAcceptedOptimistic === undefined
    ? hasAccepted
    : state.hasAcceptedOptimistic;

const total_redeemed =
  accountsWithQuests.length +
  (hasAccepted === false && state.hasAcceptedOptimistic === true ? 1 : 0) -
  (hasAccepted === true && state.hasAcceptedOptimistic === false ? 1 : 0);

console.log(state.quests);
console.log("-----");

const startQuestAccept = () => {
  if (state.loading) {
    return;
  }

  State.update({
    loading: true,
    hasAcceptedOptimistic: !hasAccepted,
  });

  const data = {
    index: {
      quest: JSON.stringify({
        key: questId,
        value: {
          type: hasAccepted ? "unaccept" : "accept",
          accountId,
        },
      }),
    },
  };

  if (!hasAccepted && notifyAccountId) {
    data.index.notify = JSON.stringify({
      key: props.notifyAccountId,
      value: {
        type: "accept_quest",
        item,
        accountId,
      },
    });
  }
  Social.set(data, {
    onCommit: () => State.update({ loading: false, hasAccepted: !hasAccepted }),
    onCancel: () =>
      State.update({
        loading: false,
        hasAcceptedOptimistic: !state.hasAcceptedOptimistic,
      }),
  });
};
const ButtonContainer = styled.div`
  display: flex;
  text-align: center;
  width: 12%;
  flex-direction: column;
  margin: 0.75rem;
  justify-content: center;
`;

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
  width: 80%;
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
  display: flex;
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
      <ButtonContainer>
        <p className="text-center mb-1">
          <b>{JSON.stringify(quest.reward_amount)} NEAR</b>
        </p>

        <Widget
          src="/*__@appAccount__*//widget/components.quest.claim"
          props={{
            questId,
            handleAccept: startQuestAccept,
            hasAccepted: state.hasAccepted,
          }}
        />
        <p className="text-center mt-1">
          <i>{JSON.stringify(quest.total_participants_allowed)} left</i>
        </p>
      </ButtonContainer>
    )}
  </Card>
);
