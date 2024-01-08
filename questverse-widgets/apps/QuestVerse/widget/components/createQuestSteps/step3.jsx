const { formState, errors, renderFooter } = props;
const { fetch_step_three_data } = VM.require(
  "bos.questverse.near/widget/data.data_step3"
);
const REWARDS_JSON = fetch_step_three_data();
State.init({
  rewardToken: "NEAR",
  tokensAllocated: formState.tokensAllocated,
  numberOfParticipants: formState.numberOfParticipants,
});

function handleRewardTokenChange(e) {
  State.update({
    rewardToken: e.target.value,
  });
}

function handleTokensAllocatedChange(e) {
  State.update({
    tokensAllocated: e.target.value,
  });
}

function handleTotalParticipantsAllowed(e) {
  State.update({
    numberOfParticipants: e.target.value,
  });
}
function handleRewardAmountChange(e) {
  State.update({
    rewardAmount: e.target.value,
  });
}

return (
  <div className="mt-4 ndc-card p-4">
    <div className="d-flex flex-column gap-4">
        <h2 className="h5 fw-bold">
        <span
          className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bolder h5 me-2"
          style={{
            width: "48px",
            height: "48px",
            border: "1px solid #82E299",
          }}
        >
          3
        </span>
    Select Reward & Payout
      </h2>

    <div>
      <label htmlFor="rewardToken">Reward Token:</label>
      <select
        id="rewardToken"
        value={state.rewardToken}
        onChange={handleRewardTokenChange}
      >
        <option value="">Select Reward Token</option>
        {["NEAR"].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label htmlFor="tokensAllocated">Tokens Allocated to Quest:</label>
      <input
        type="number"
        id="tokensAllocated"
        value={state.tokensAllocated}
        onChange={handleTokensAllocatedChange}
      />
    </div>
    <div>
      <label htmlFor="totalParticipants">Total Participants Allowed</label>
      <input
        type="number"
        id="participantsAllowed"
        value={state.numberOfParticipants}
        onChange={handleTotalParticipantsAllowed}
      />
    </div>

    <div>
      <label htmlFor="rewardAmount">
        Reward Amount Per Participant:
        {state.tokensAllocated / state.numberOfParticipants} {state.rewardToken}
      </label>
    </div>
    {renderFooter(state)}
  </div>
  </div>
);
