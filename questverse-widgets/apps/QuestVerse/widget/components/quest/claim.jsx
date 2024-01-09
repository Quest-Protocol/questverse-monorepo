const isAvailable = true;
const isClaimed = false;

const accountId = props.accountId ?? context.accountId;
const questId = props.questId;

if (!accountId || !questId) {
  return "No account or quest id provided";
}

const data = {
  [accountId]: {
    index: {
      quest: JSON.stringify({
        key: questId,
        value: {
          type,
          accountId,
        },
      }),
    },
  },
};

const type = isClaimed ? "disclaim" : "claim";

const claimQuest = () => {
  const claimArgs = {
    claim: {
      account_id: accountId,
      quest_id: String(questId),
    },
    signature: "signed_signature"
  };
  const transactions = [
    {
      contractName: "social.near",
      methodName: "set",
      args: { data },
    },
    {
      contractName: "v0.questverse.near",
      methodName: "claim_reward_unverified",
      args: claimArgs,
    },
  ];
  Near.call(transactions);
};

return (
  <div className="m-3">
    <button
      className={`btn ${
        isClaimed ? "btn-outline-secondary" : "btn-outline-dark"
      }`}
      onClick={claimQuest}
    >
      {isClaimed ? "claimed" : "claim"}
    </button>
  </div>
);
