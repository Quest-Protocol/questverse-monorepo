const { typeToEmptyData, validateType, types } = props;

const initialFormState =
  typeToEmptyData(types["hack.near/type/quest"]) ??
  "https://ipfs.near.social/ipfs/bafkreiad5c4r3ngmnm7q6v52joaz4yti7kgsgo6ls5pfbsjzclljpvorsu";
const coverImage =
  "https://ipfs.near.social/ipfs/bafkreicd7wmjfizslx72ycmnsmo7m7mnvfsyrw6wghsaseq45ybslbejvy";

State.init({
  step: 0,
  form: initialFormState,
  errors: null,
});

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

  if (state.step === 5) {
    const finalForm = {
      ...state.form,
      ...value,
    };

    State.update({
      step: state.step,
      form: finalForm,
    });
    handleFormComplete(finalForm)
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

function handleFormComplete(value) {
  const questArgs = {
    args: {
      quest_id: value.id,
      title: value.form.title,
      name: context.accountId,
      starts_at: value.starts_at,
      expires_at: value.expires_at,
      total_participants_allowed: value.total_participants_allowed,
      indexer_name: value.total_participants_allowed,
      description: value.description,
      img_url: value.img_url,
      tags: value.tags,
      humans_only: value.humans_only,
    },
  };

  Near.call([
    {
      contractName: "v1.questverse.near",
      methodName: "create_quest",
      args: questArgs,
      deposit: "1000000000000000000000000",
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
  title: "Project Title & Description",
  active: state.step === 1,
  icon: state.step > 1 ? <i className="bi bi-check2"></i> : undefined,
  className: state.step > 1 ? "active-outline" : undefined,
},
{
  title: "Allowlist",
  active: state.step === 2,
  icon: state.step > 2 ? <i className="bi bi-check2"></i> : undefined,
  className: state.step > 2 ? "active-outline" : undefined,
},
{
  title: "Allocate Rewards",
  active: state.step === 3,
  icon: state.step > 3 ? <i className="bi bi-check2"></i> : undefined,
  className: state.step > 3 ? "active-outline" : undefined,
},
{
  title: "Timing",
  active: state.step === 4,
  icon: state.step > 4 ? <i className="bi bi-check2"></i> : undefined,
  className: state.step > 4 ? "active-outline" : undefined,
},
{
  title: "Finalize",
  active: state.step === 5,
  icon: state.step > 5 ? <i className="bi bi-check2"></i> : undefined,
  className: state.step > 5 ? "active-outline" : undefined,
}
];

return (
  <>
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
      src={`/*__@appAccount__*//widget/components.quest.create.step${state.step + 1}`}
      props={{
        formState: state.form,
        onComplete: handleStepComplete,
        errors: state.errors,
        renderFooter: (stepState, otherProps) => (
          <Widget
            src={`/*__@appAccount__*//widget/quest.create.footer`}
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
  </>
);
