const JSON = props.data;
const options = JSON.options;

State.init({
  selectedOption: null,
  selectedAction: null,
  formData: {},
});

const handleOptionChange = (e) => {
  State.update({
    selectedOption: e.target.value,
    selectedAction: null,
    formData: {},
  });
};

const handleActionChange = (e) => {
  State.update({
    selectedAction: e.target.value,
    formData: {},
  });
};

const handleInputChange = (e, fieldName) => {
  const value = e.target.value;
  State.update({
    formData: { ...state.formData, [fieldName]: value },
  });
};

const renderActionsDropdown = () => {
  if (state.selectedOption !== null) {
    const selectedOptionObj = options.find(
      (option) => option.name === state.selectedOption
    );
    if (selectedOptionObj && selectedOptionObj.actions) {
      const actions = Object.keys(selectedOptionObj.actions);
      return (
        <div>
          <label>Select Action:</label>
          <select onChange={handleActionChange} value={state.selectedAction || ""}>
            <option value="">Select Action</option>
            {actions.map((action, index) => (
              <option key={index} value={action}>
                {action}
              </option>
            ))}
          </select>
          {state.selectedAction &&
            renderSubFields(selectedOptionObj.actions[state.selectedAction])}
        </div>
      );
    }
  }
  return null;
};

const renderSubFields = (fields) => {
  return (
    <div>
      {Object.keys(fields).map((field, index) => (
        <div key={index}>
          <label>{field}</label>
          <input
            type="text"
            placeholder={fields[field]}
            onChange={(event) => handleInputChange(event, field)}
          />
        </div>
      ))}
    </div>
  );
};

return (
  <div>
    <label>Select Option:</label>
    <select onChange={handleOptionChange} value={state.selectedOption || ""}>
      <option value="">Select Option</option>
      {options.map((option, index) => (
        <option key={index} value={option.name}>
          {option.name}
        </option>
      ))}
    </select>
    {renderActionsDropdown()}
  </div>
);
