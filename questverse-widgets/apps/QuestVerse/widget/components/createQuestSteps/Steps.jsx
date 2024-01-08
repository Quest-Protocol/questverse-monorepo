const { fetch_indexers_config } = VM.require(
  "bos.questverse.near/widget/data.data_indexers"
);
const INDEXERS = fetch_indexers_config();

function getRandomValue() {
  return Math.floor(Math.random() * 2000000) + 1;
}
function replaceTemplateLiterals(code_string, dataObject) {
  return code_string.replace(/{{(.*?)}}/g, (match, key) => {
    return dataObject[key] !== undefined ? dataObject[key] : match;
  });
}
function transformVariables(quest_id, selectedOption, selectedAction) {
  const replacePattern = /[.\- ]/g;

  quest_id = String(quest_id).replace(replacePattern, "_");
  selectedOption = String(selectedOption).replace(replacePattern, "_");
  selectedAction = String(selectedAction).replace(replacePattern, "_");

  return `quest_${quest_id}_${selectedOption}_${selectedAction}`;
}
function handleFormComplete(value) {
  const quest_id = getRandomValue();
  console.log(value, "form");
  const indexer_config =
    INDEXERS[value.indexerConfig.selectedOption][
    value.indexerConfig.selectedAction
    ];
  const new_code = replaceTemplateLiterals(indexer_config.code, value.formData);

  const indexer_name = transformVariables(
    quest_id,
    value.selectedOption,
    value.selectedAction
  );
  const questArgs = {
    args: {
      quest_id: quest_id,
      starts_at: value.starts_at,
      expires_at: value.expires_at,
      total_participants_allowed: value.numberOfParticipants,
      indexer_name: indexer_name,
      title: value.form.title,
      description: value.form.description,
      img_url: value.form.img_url,
      tags: value.tags,
      humans_only: value.humans_only || false,
    },
  };

  const gas = 200000000000000;

  Near.call([
    {
      contractName: "queryapi.dataplatform.near",
      methodName: "register_indexer_function",
      args: {
        function_name: indexer_name,
        code: new_code,
        schema: indexer_config.schema,
        filter_json: indexer_config.filter_json,
        start_block_height: null,
      },
      gas,
    },
    {
      contractName: "v0.questverse.near",
      methodName: "create_quest",
      args: questArgs.args,
      deposit: (value.tokensAllocated + 0.02) * 1000000000000000000000000,
    },
  ]);
}

const steps = [
  {
    title: "Select Quest Template",
    active: state.step === 0,
    icon: state.step > 0 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 0 ? "active-outline" : undefined,
  },
  {
    title: "Allowlist",
    active: state.step === 1,
    icon: state.step > 1 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 1 ? "active-outline" : undefined,
  },
  {
    title: "Allocate Rewards",
    active: state.step === 2,
    icon: state.step > 2 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 2 ? "active-outline" : undefined,
  },
  {
    title: "Timing",
    active: state.step === 3,
    icon: state.step > 3 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 3 ? "active-outline" : undefined,
  },
  {
    title: "Finalize",
    active: state.step === 4,
    icon: state.step > 4 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 5 ? "active-outline" : undefined,
  },
];

const totalSteps = 4;

let initialFormState = {
  quest_id: value.id,
  title: "",
  name: context.accountId,
  starts_at: null,
  expires_at: null,
  total_participants_allowed: 10,
  indexer_name: "",
  description: "",
  img_url: "",
  tags: ["quest"],
  humans_only: False,

  //STEP
  inputs: {},
  //STEP 2
  masterList: [],
  allowedList: [],
  excludedList: [],

  //STEP 3
  rewardToken: "NEAR",
  tokensAllocated: .1,
  numberOfParticipants: 1,

  //STEP 4
  date_start: "",
  date_end: "",
  indexerConfig: {
    selectedOption: "astrodao.near",
    selectedAction: "join_dao",
    formData: {},
    contractID: "",
    inputs: {
      account_id: "",
      amount: "",
      post_id: "",
      count: "",
      tags: "",
      role: "",
    },
    indexerId: "",
  },
};

State.init({
  step: 0,
  form: initialFormState,
  errors: null,
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

const handleStepComplete = (value) => {
  // const stepValid = true;
  // Object.keys(value).forEach((key) => {
  //   const properties = types["hack.near/type/quest"].properties.find(
  //     (p) => p.name === key
  //   );
  //   const validation = validateType(properties.type, value[key], properties);
  //   if (validation) {
  //     State.update({
  //       errors: {
  //         ...state.errors,
  //         [key]: validation,
  //       },
  //     });
  //     stepValid = false;
  //   } else {
  //     State.update({
  //       errors: {
  //         ...state.errors,
  //         [key]: null,
  //       },
  //     });
  //   }
  // });
  //
  // if (!stepValid) return;
  //
  if (state.step === 4) {
    console.log("FINAL FORM", value);
    const finalAnswers = {
      ...state.form,
      ...value,
    };

    State.update({
      step: state.step,
      form: finalAnswers,
    });
    console.log("FINAL ANSWERS", finalAnswers);
    handleFormComplete(finalAnswers);
    return;
  }
  State.update({
    step: state.step + 1,
    form: {
      ...state.form,
      ...value,
    },
  });
};

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
return (
  <FormContainer>
    <h1 className="h3 fw-bold mb-4">Create a Quest</h1>
    <Widget
      src={`nearui.near/widget/Navigation.Steps`}
      props={{
        steps: steps,
        onClick: (i) => {
          if (i > state.step) return;
          State.update({
            step: i,
          });
        },
      }}
    />
    <Widget
      src={`/*__@appAccount__*//widget/components.createQuestSteps.step${state.step + 1
        }`}
      props={{
        formState: state.form,
        onComplete: handleStepComplete,
        errors: state.errors,
        renderFooter: (stepState, otherProps) => (
          <Widget
            src={`/*__@appAccount__*//widget/components.quest.create.footer`}
            props={{
              isLast: state.step >= steps.length - 1,
              hasPrevious: state.step > 0,
              onNext: () => {
                handleStepComplete(stepState);
              },
              onPrevious: () => {
                State.update({
                  step: state.step - 1,
                });
              },
              onReset: () => {
                State.update({
                  step: 0,
                  form: initialFormState,
                  errors: null,
                });
              },
              ...otherProps,
            }}
          />
        ),
      }}
    />
  </FormContainer>
);
