const { formState, errors, renderFooter } = props;
const { fetch_step_one_data } = VM.require(
  "bos.questverse.near/widget/data.data_step1"
);
const JSON = fetch_step_one_data();
const options = JSON.options;

const initialForm = {
  selectedOption: formState.indexerConfig.selectedOption,
  selectedAction: formState.indexerConfig.selectedAction,
  formData: formState.initialForm.formData,
  title: formState.initialForm.title,
  description: formState.initialForm.description,
  img_url: formState.initialForm.img_url,
};

State.init({
  form: initialForm,
});

const handleOptionsChange = (value) => {
  State.update({
    form: {
      ...state.form,
      selectedOption: value,
      selectedAction: null,
    },
  });
};

const handleInputChange = (value, fieldName) => {
  State.update({
    form: {
      ...state.form,
      formData: { ...state.form.formData, [fieldName]: value },
    },
  });
};

const onValueChange = (key, value) => {
  State.update({
    form: {
      ...state.form,
      [key]: value,
    },
  });
};

const renderActionsDropdown = () => {
  if (state.form.selectedOption !== null) {
    const selectedOptionObj = options.find(
      (option) => option.name === state.form.selectedOption
    );
    if (selectedOptionObj && selectedOptionObj.actions) {
      const actions = Object.keys(selectedOptionObj.actions);
      return (
        <div>
          <h5 className="h5 fw-bold p-2">Choose Action To Index</h5>
          <Widget
            src="nearui.near/widget/Input.Select"
            props={{
              placeholder: "Select Action",
              size: "md",
              options: actions
                .filter((action) => action !== null && action !== "")
                .map((action) => ({
                  title: action,
                  value: action,
                })),
              value: state.form.selectedAction || "",
              onChange: (v) => onValueChange("selectedAction", v),
            }}
          />
          {state.form.selectedAction &&
            renderSubFields(
              selectedOptionObj.actions[state.form.selectedAction]
            )}
        </div>
      );
    }
  }
  return null;
};

const renderSubFields = (fields) => {
  {
    console.log(fields, "field");
  }

  return (
    <div>
      <h3 className="h5 fw-bold p-2">Customize Quest</h3>
      {Object.keys(fields).map((field, index) => (
        <div key={index}>
          <Widget
            src="nearui.near/widget/Input.ExperimentalText"
            props={{
              label: <>{field}</>,
              placeholder: field,
              size: "sm",
              onChange: (event) => handleInputChange(event, field),
              error: errors["formData"],
              inputProps: {
                name: field,
                defaultValue: state.form.formData[`${field}`],
              },
            }}
          />
        </div>
      ))}
    </div>
  );
};

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
          1
        </span>
        Quest Details & Action
      </h2>
      <h5 className="h5 fw-bold pt-4">Select Project</h5>
      <Widget
        src="nearui.near/widget/Input.Select"
        props={{
          placeholder: "Select Project",
          size: "md",
          options: options.map((option) => ({
            title: option.name,
            value: option.name,
          })),
          value: state.form.selectedOption || "",
          onChange: (v) => handleOptionsChange(v),
        }}
      />
      {renderActionsDropdown()}
      {renderFooter(state.form)}
    </div>
  </div>
);
