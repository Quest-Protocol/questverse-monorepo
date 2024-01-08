const { formState, errors, renderFooter } = props;

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return [year, month, day].join("-");
}

const TODAY = formatDate(new Date());
const ONE_HOUR = 60 * 60 * 1000;
const DAY_IN_SECONDS = 24 * 60 * 60 * 1000;
const ONE_WEEK = DAY_IN_SECONDS * 7;

State.init({
  date_start: formatDate(new Date(Date.now() + DAY_IN_SECONDS)),
  date_end: formatDate(new Date(Date.now() + ONE_WEEK)),
  starts_at: new Date(Date.now() + ONE_HOUR).getTime(),
  expires_at: new Date(Date.now() + ONE_WEEK).getTime(),
});

const setStartDate = (e) => {
  State.update({
    ...state,
    date_start: e.target.value,
    starts_at: new Date(e.target.value).getTime(),
  });
};

const setEndDate = (e) => {
  State.update({
    ...state,
    date_end: e.target.value,
    expires_at: new Date(e.target.value).getTime(),
  });
};

return (
  <div className="mt-4 ndc-card p-4">
    <div className="d-flex flex-column gap-4">
      <div>
        <h2 className="h5 fw-bold">
          <span
            className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bolder h5 me-2"
            style={{
              width: "48px",
              height: "48px",
              border: "1px solid #82E299",
            }}
          >
            4
          </span>
          Duration Of Quest
        </h2>
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
      {renderFooter(state)}
    </div>
  </div>
);
