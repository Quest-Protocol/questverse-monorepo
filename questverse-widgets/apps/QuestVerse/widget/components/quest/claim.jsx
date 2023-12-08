const accountId = props.accountId ?? context.accountId;
const questId = props.questId ?? "813740323";

if (!accountId) {
  return "";
}

const loading = joinEdge === null || memberEdge === null;

const isAvailable = true;
const isClaimed = false;

const type = isClaimed ? "disclaim" : "claim";

const handleClaim = () => {
  Social.set({
    index: {
      quest: JSON.stringify({
        key: questId,
        value: {
          type,
          accountId,
        },
      }),
    },
  });
};

return (
  <>
    <button
      disabled={loading}
      className={`btn ${
        loading || claimed ? "btn-outline-secondary" : "btn-outline-dark"
      }`}
      onClick={handleClaim}
    >
      {loading ? "loading" : closed ? "claimed" : "claim"}
    </button>
  </>
);