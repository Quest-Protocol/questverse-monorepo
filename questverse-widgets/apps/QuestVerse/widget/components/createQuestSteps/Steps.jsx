const { fetch_step_one_data } = VM.require(
  "bos.questverse.near/widget/data.data_stepOne"
);
const { fetch_step_two_data } = VM.require(
  "bos.questverse.near/widget/data.data_stepTwo"
);
const { fetch_step_three_data } = VM.require(
  "bos.questverse.near/widget/data.data_stepThree"
);
const stepOneData = fetch_step_one_data();
const stepTwoData = fetch_step_two_data();
const stepThreeData = fetch_step_three_data();

const totalSteps = 5;

State.init({
  step: 1,

  //STEP 1
  inputs: {},
  //STEP 2
  masterList: [],
  allowedList: [],
  excludedList: [],

  //STEP 3
  rewardNetwork: "",
  rewardToken: "",
  tokensAllocated: 0,
  rewardAmount: "",

  //STEP 4
  date_start: "",
  date_end: "",

  //step5
});

const handleNext = (data) => {
  State.update({
    // update here
    step: state.step + 1,
  });
};

const handlePrevious = () => {
  State.update({
    step: state.step - 1,
  });
};

const renderStep = () => {
  switch (state.step) {
    case 1:
      return (
        <Widget
          src={"bos.questverse.near/widget/components.createQuestSteps.stepOne"}
          props={{
            data: stepOneData,
            onNext: (data) => handleNext(data),
          }}
        />
      );
    case 2:
      return (
        <Widget
          src={"bos.questverse.near/widget/newQuestComponents.stepTwo"}
          props={{
            data: stepTwoData,
            onNext: (data) => handleNext(data),
          }}
        />
      );
    case 3:
      return (
        <Widget
          src={"bos.questverse.near/widget/components.createQuestSteps.stepThree"}
          props={{
            data: stepThreeData,
            onNext: (data) => handleNext(data),
          }}
        />
      );

    case 4:
      return (
        <Widget
          src={"bos.questverse.near/widget/components.createQuestSteps.stepFour"}
          props={{
            onNext: (data) => handleNext(data),
          }}
        />
      );
    case 5:
      return (
        <Widget
          src={"bos.questverse.near/widget/components.createQuestSteps.stepFive"}
          props={{
            data: state.formData,
            onNext: (data) => handleNext(data),
          }}
        />
      );
    default:
      return "Error In Form";
  }
};

return (
  <div>
    <h1>Create Quest</h1>
    {renderStep()}

    {state.step !== 1 && (
      <button type="button" onClick={handlePrevious}>
        Previous
      </button>
    )}

    {state.step !== 5 && (
      <button onClick={() => handleNext(state.formData)}>Next</button>
    )}

    {state.step === totalSteps && <button type="submit">Submit</button>}
  </div>
);
