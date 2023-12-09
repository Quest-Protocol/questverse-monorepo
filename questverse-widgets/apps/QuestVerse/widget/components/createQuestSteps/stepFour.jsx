function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return [year, month, day].join("-");
}

const TODAY = formatDate(new Date());
const DAY_IN_SECONDS = 24 * 60 * 60 * 1000;
const ONE_WEEK = DAY_IN_SECONDS * 7;

const setStartDate = (e) => {
  State.update({
    date_start: e.target.value,
  });
};

const setEndDate = (e) => {
  State.update({
    date_end: e.target.value,
  });
};

State.init({
  date_start: formatDate(new Date(Date.now() + DAY_IN_SECONDS)),
  date_end: formatDate(new Date(Date.now() + ONE_WEEK)),
});

return (
  <div className="stepFour">
    <div>
      <h2>Quest Duration</h2>
      <small>Please choose your quest start and end date.</small>

      <input
        aria-label="Quest Start Date"
        type="date"
        value={state.date_start}
        onChange={(e) => {
          setStartDate(e);
        }}
        min={TODAY}
      />

      <input
        aria-label="Quest End Date"
        type="date"
        value={state.date_end}
        onChange={(e) => {
          setEndDate(e);
        }}
        min={TODAY}
      />
    </div>
  </div>
);
