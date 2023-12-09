
const JSON = props.data;
const options = JSON.options;

State.init({
  selectedOption: "",
  inputs: {},
});

const handleOptionChange = (e) => {
  State.update({
    selectedOption: e.target.value,
    inputs: {},
  });
};

const handleInputChange = (e, field) => {
  const { id, value } = e.target;

  State.update({
    inputs: {
      ...state.inputs,
      [field]: { ...state.inputs[field], [id]: value },
    },
  });
};

const handleDisplay = () => {
  console.log(state.inputs); //read
};

const renderInputs = () => {
  if (!state.selectedOption) {
    return null;
  }

  const selected = options.find(
    (option) => option.name === state.selectedOption
  );
  if (!selected) {
    return null;
  }

  return Object.keys(selected.actions).map((action, index) => {
    const fields = selected.actions[action];
    return (
      <div key={index}>
        <h3>{action}</h3>
        {Object.keys(fields).map((field, i) => (
          <div key={i}>
            <label htmlFor={field}>{field}:</label>
            <input
              type="text"
              id={field}
              onChange={(e) => handleInputChange(e, action)}
            />
          </div>
        ))}
      </div>
    );
  });
};

return (
  <div>
    <label htmlFor="options">Choose an option:</label>
    <select
      id="options"
      onChange={handleOptionChange}
      value={state.selectedOption}
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option.name} value={option.name}>
          {option.name}
        </option>
      ))}
    </select>
    <div>
      <h2>Inputs:</h2>
      {renderInputs()}
    </div>
    <button onClick={handleDisplay}>console log</button>
  </div>
);
