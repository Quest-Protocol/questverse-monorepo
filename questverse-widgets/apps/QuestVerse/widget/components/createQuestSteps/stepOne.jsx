// import TYPES from "./types.json"
const TYPES = props.data;
console.log('types', TYPES);
// function formatDate(date) {
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, "0");
//   const day = date.getDate().toString().padStart(2, "0");
//   return [year, month, day].join("-");
// }

// const TODAY = formatDate(new Date());
// const DAY_IN_SECONDS = 24 * 60 * 60 * 1000;

State.init({
  selectedCurrency: null,
  selectedOption: null,
  selectedFields: [],
});

function handleCurrencyChange(e) {
  State.update({
    selectedCurrency: e.target.value,
    selectedOption: null,
    selectedFields: [],
  });
}

function handleOptionChange(e) {
  console.log(e.target.value);
  const currency = TYPES.project_types[0].crypto_currencies.find(
    (crypto) => crypto.name === state.selectedCurrency
  );
  const action = currency.actions[e.target.value];
  State.update({
    selectedOption: e.target.value,
    selectedFields: action.fields,
  });
}

return (
  <div>
    <div className="stepOne">
      {/* <form action="123" onSubmit="..."> */}
      <label htmlFor="currency">Select Currency:</label>
      <select id="currency" onChange={handleCurrencyChange}>
        <option value="">Select</option>
        {TYPES.project_types[0].crypto_currencies.map((crypto) => (
          <option key={crypto.name} value={crypto.name}>
            {crypto.name}
          </option>
        ))}
      </select>

      {state.selectedCurrency && (
        <div>
          <label htmlFor="option">Select Option:</label>
          <select id="option" onChange={handleOptionChange}>
            <option value="">Select</option>
            {TYPES.project_types[0].crypto_currencies
              .find((crypto) => crypto.name === state.selectedCurrency)
              .options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
        </div>
      )}
      {state.selectedFields.length > 0 && (
        <div>
          {state.selectedFields.map((field, index) => (
            <div key={index}>
              <label htmlFor={field.name}>{field.name}:</label>
              <select id={field.name}>
                <option value="">Select</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
      {/* </form> */}
      {/* <button type="submit"> Submit</button> */}
    </div>
  </div>
);
//creation ->

/**
 Import components to turn it into a carosel
 */
