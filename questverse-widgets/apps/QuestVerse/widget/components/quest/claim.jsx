const accountId = props.accountId ?? context.accountId;
const questId = props.questId ?? "813740323";
const hasAccepted = props.hasAccepted ?? false;

if (!accountId) {
  return "";
}

const loading = joinEdge === null || memberEdge === null;

const isAvailable = true;
const isAccepted = hasAccepted;

const type = isAccepted ? "opt-out" : "accept";

const handleAccept =
  props.handleAccept ??
  (() => {
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
  });

const Container = styled.div`
  text-align: center;
`;

return (
  <>
    <Container>
      <button
        disabled={loading}
        className={`btn ${loading || claimed ? "btn-outline-secondary" : "btn-outline-dark"
          }`}
        onClick={handleAccept}
      >
        {loading ? "loading" : closed ? "opt-out" : "accept"}
      </button>
    </Container>
  </>
);
