const REWARDS_JSON = props.data; //currently not used

State.init({
  rewardNetwork: "",
  rewardToken: "",
  tokensAllocated: 0,
  rewardAmount: "",
});

function handleRewardNetworkChange(e) {
  State.update({
    rewardNetwork: e.target.value,
  });
}

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

function handleRewardAmountChange(e) {
  State.update({
    rewardAmount: e.target.value,
  });
}

return (
  <div className="stepThree">
    <div>
      <label htmlFor="rewardNetwork">Reward Network:</label>
      <select
        id="rewardNetwork"
        value={rewardNetwork}
        onChange={handleRewardNetworkChange}
      >
        <option value="">Select Reward Network</option>

        {["NEAR"].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label htmlFor="rewardToken">Reward Token:</label>
      <select
        id="rewardToken"
        value={rewardToken}
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
        value={tokensAllocated}
        onChange={handleTokensAllocatedChange}
      />
    </div>
    <div>
      <label htmlFor="rewardAmount">Reward Amount Per Participant:</label>
      <select
        id="rewardAmount"
        value={rewardAmount}
        onChange={handleRewardAmountChange}
      >
        <option value="">Select Reward Amount</option>
        <option value="Gas Rebate">Gas Rebate</option>
        <option value="Reccomended">Recommended</option>
        {/* <option value="Custom">Custom</option> */}
      </select>
    </div>
  </div>
);
