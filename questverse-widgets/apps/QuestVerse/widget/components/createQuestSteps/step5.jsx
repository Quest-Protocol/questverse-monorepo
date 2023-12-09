const { formState, errors, renderFooter } = props;

const initialForm = {
  title: formState.initialForm.title,
  description: formState.initialForm.description,
  img_url: formState.initialForm.img_url,
};

State.init({
  form: initialForm,
});

const onValueChange = (key, value) => {
  State.update({
    form: {
      ...state.form,
      [key]: value,
    },
  });
};
const FORM_DATA = props.data;
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
          5
        </span>
        Review Quest Details
      </h2>
      <Widget
        src="nearui.near/widget/Input.ExperimentalText"
        props={{
          label: (
            <>
              <h3 className="h5 fw-bold p-2">Title</h3>
            </>
          ),
          placeholder: "Do X and Earn Y tokens",
          size: "md",
          onChange: (v) => onValueChange("title", v),
          error: errors["title"],
          inputProps: {
            name: "title",
            defaultValue: state.form.title,
          },
        }}
      />
      <Widget
        src="nearui.near/widget/Input.ExperimentalText"
        props={{
          label: (
            <>
              <h3 className="h5 fw-bold p-2">Description</h3>
            </>
          ),
          placeholder: "Information about the quest",
          size: "md",
          onChange: (v) => onValueChange("description", v),
          error: errors["description"],
          inputProps: {
            name: "description",
            defaultValue: state.form.description,
          },
        }}
      />
      <h3 className="h5 fw-bold p-2">Image URL</h3>
      <Widget
        src="nearui.near/widget/Input.ExperimentalText"
        props={{
          placeholder: "https://",
          size: "md",
          onChange: (v) => onValueChange("img_url", v),
          inputProps: {
            name: `link`,
            defaultValue: l,
          },
        }}
      />
      <div className="review">{JSON.stringify(FORM_DATA)}</div>
      {renderFooter(state)}
    </div>
  </div>
);
