const { formState, errors, renderFooter } = props;
const { fetch_step_two_data } = VM.require(
  "bos.questverse.near/widget/data.data_step2"
);
const AUDIENCES_JSON = fetch_step_two_data();

State.init({
  masterList: AUDIENCES_JSON.public_audience,
  allowedList: AUDIENCES_JSON.public_audience,
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
    (fromList === "allowedList" ) &&
    toList === "excludedList"
  ) {
    if (fromList === "allowedList") {
      const updatedAllowedSubList = state.allowedList.filter(
        (i) => i.id !== item.id
      );
      State.update({
        allowedList: updatedAllowedSubList,
        excludedList: [...state.excludedList, item],
      });
    } else if (fromList === "excludedList") {
      const updatedExcludedSubList = state.excludedList.filter(
        (i) => i.id !== item.id
      );
      State.update({
        excludedList: updatedExcludedSubList,
        allowedList: [...state.allowedList, item],
      });
    }
  }
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
          2
        </span>
      Target Your Quest To Specific Users
      </h2>
    {state.masterList.map((l, i) => (
      <div
        className={[
          "d-flex align-items-center gap-2 pt-2",
          l === null && "d-none",
        ].join(" ")}
      >
        <p className="text-black-100 fw-dark small">
          <div>Target Users: {l.name}</div>
          <small>Count: {l.member_count}</small>
        </p>
        {state.allowedList.find((a) => l.id == a.id) && (
          <Widget
            src="nearui.near/widget/Input.Button"
            props={{
              children: <i className="bi bi-trash" />,
              variant: "icon danger outline",
              size: "lg",
              onClick: () => handleMoveItem(l, "allowedList", "excludedList"),
            }}
          />
        )}

        {state.excludedList.find((a) => a.id == l.id) && (
          <Widget
            src="nearui.near/widget/Input.Button"
            props={{
              children: <i className="bi bi-plus" />,
              variant: "icon success outline",
              size: "lg",
              onClick: () => handleRemoveItem(l, "excludedList"),
            }}
          />
        )}
      </div>
    ))}

    {renderFooter(state)}
  </div>
  </div>
);
