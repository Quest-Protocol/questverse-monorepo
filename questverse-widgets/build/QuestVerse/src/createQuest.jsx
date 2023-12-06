// import StepOne from "./StepOne";
// const { StepOne } = require("bos.questverse.near/newQuestComponents.StepOne");

const { fetch_step_one_data } = VM.require(
  "bos.questverse.near/widget/data_stepOne"
);
const stepOneData = fetch_step_one_data();
// const {stepOneData, stepTwoData} = VM.require("bos.questverse.near/module/data_all"); I can do it like this
// const { StepOne } = require("./bos.questverse.near/newQuestComponents.StepTwo");

State.init({
  step: 1,
  formData: {
    //STEP 1
    selectedCurrency: "",
    selectedOption: "",
    selectedFields: [],
    //STEP 2
    // audienceGroups: [],

    //STEP 3


    //
  },
});

function handleNext(data) {
  State.update({
    formData: { ...state.formData, ...data },
    step: state.step + 1,
  });
}

function handlePrevious() {
  State.update({
    step: state.step + 1,
  });
}

function renderStep() {
  switch (step) {
    case 1:
      return (
        <Widget
          src={"bos.questverse.near/widget/newQuestComponents.stepOne"}
          props={{
            data: stepOneData,
            onNext: handleNext,
          }}
        />
      );
    case 2:
      return <StepTwo onNext={handleNext} />;
    // case 3:
    //   return <StepThree data={} onNext={handleNext} onPrevious={handlePrevious} />;
    default:
      return (
        <Widget
          src={"bos.questverse.near/widget/newQuestComponents.stepOne"}
          props={{
            data: stepOneData,
            onNext: handleNext,
          }}
        />
      );
  }
}

return (
  <div>
    <h1>Create Quest</h1>
    {renderStep()}

    {state.step !== 1 && (
      <button type="button" onClick={handlePrevious}>
        Previous
      </button>
    )}

    {state.step === totalSteps && <button type="submit">Submit</button>}
  </div>
);

//I wanted to pass in all JSON configs here



/**
 * 
 * JSON -> Functions w req
 * 
 * 
 */



/**
 * 
 * 
 * CREATE QUEST
 */