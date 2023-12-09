const AUDIENCES_JSON = props.data;

State.init({
  masterList: AUDIENCES_JSON.public_audience,
  allowedList: [],
  excludedList: [],
});

const handleRemoveItem = (item, list) => {
  if (list === "allowedList") {
    const updatedSubList = state.allowedList.filter((i) => i !== item);

    State.update({
      allowedList: updatedSubList,
    });
  } else if (list === "excludedList") {
    const updatedSubList = excludedList.filter((i) => i !== item);

    State.update({
      excludedList: updatedSubList,
    });
  }
};
const handleMoveItem = (item, fromList, toList) => {
  if (fromList === "master" && toList === "allowedList") {
    State.update({
      allowedList: [...state.allowedList, item],
      masterList: state.masterList.filter((i) => i.id !== item.id),
    });
  } else if (fromList === "master" && toList === "excludedList") {
    State.update({
      excludedList: [...state.excludedList, item],
      masterList: state.masterList.filter((i) => i.id !== item.id),
    });
  } else if (
    (fromList === "allowedList" || fromList === "excludedList") &&
    toList === "master"
  ) {
    if (fromList === "allowedList") {
      const updatedAllowedSubList = state.allowedList.filter(
        (i) => i.id !== item.id
      );
      State.update({
        allowedList: updatedAllowedSubList,
        masterList: [...state.masterList, item],
      });
    } else if (fromList === "excludedList") {
      const updatedExcludedSubList = state.excludedList.filter(
        (i) => i.id !== item.id
      );
      State.update({
        excludedList: updatedExcludedSubList,
        masterList: [...state.masterList, item],
      });
    }
  }
};

return (
  <div className="stepTwo">
    <div>
      <h2>Audience</h2>
      <small>Add or exclude audiences to refine quest eligibility.</small>

      <ul>
        {state.masterList.map((item, index) => (
          <li key={index}>
            <div>Audience Name: {item.name}</div>
            <small>Member Count: {item.member_count}</small>
            <button
              onClick={() => handleMoveItem(item, "master", "allowedList")}
            >
              Move to Allowed
            </button>
            <button
              onClick={() => handleMoveItem(item, "master", "excludedList")}
            >
              Move to Excluded
            </button>
          </li>
        ))}
      </ul>

      <h3>Allowed</h3>
      <ul>
        {state.allowedList.map((item, index) => (
          <li key={index}>
            <div>Audience Name: {item.name}</div>
            <small>Member Count: {item.member_count}</small>
            <button
              onClick={() => handleMoveItem(item, "allowedList", "master")}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <h3>Excluded</h3>
      <ul>
        {state.excludedList.map((item, index) => (
          <li key={index}>
            <div>Audience Name: {item.name}</div>
            <small>Member Count: {item.member_count}</small>
            <button
              onClick={() => handleMoveItem(item, "excludedList", "master")}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
