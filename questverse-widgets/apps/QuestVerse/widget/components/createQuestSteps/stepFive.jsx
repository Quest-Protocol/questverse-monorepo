// State.init({
//   isChecked: false,
//   isSubmitEnabled: false,
// });

// const handleCheckboxChange = (event) => {
//   console.log(event.target.checked);
//   State.update({
//     isChecked: event.target.checked,
//     isSubmitEnabled: true,
//   });
// };

// const handleSubmit = () => {
//   if (state.isChecked) {
//     console.log("Form submitted!");
//   } else {
//     console.log("Checkbox must be checked to submit.");
//   }
// };

const FORM_DATA = props.data;
console.log(FORM_DATA)
return (
  <div className="stepFive">
    <h2>Review</h2>
    <small>Please review following Information</small>

  </div>
);
