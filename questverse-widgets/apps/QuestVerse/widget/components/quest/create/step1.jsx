const { formState, errors, renderFooter } = props;

const initialAnswers = {
  name: formState.name,
  address: formState.address,
  soulBoundTokenIssuer: formState.soulBoundTokenIssuer,
  purpose: formState.purpose,
  legalStatus: formState.legalStatus,
  legalDocument: formState.legalDocument,
};

State.init({
  answers: initialAnswers,
});

const onValueChange = (key, value) => {
  State.update({
    answers: {
      ...state.answers,
      [key]: value,
    },
  });
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
        DAO Info & KYC
      </h2>
      <h3 className="h5 fw-bold">
        KYC <span className="text-black-50 fw-light small">(optional)</span>
      </h3>
      <Widget
        src="nearui.near/widget/Input.ExperimentalText"
        props={{
          label: (
            <>
              Please explain your DAO&apos;s Legal Status and Jurisdiction{" "}
              <span className="text-black-50 fw-light small">(if known)</span>
            </>
          ),
          placeholder: "LLC",
          size: "md",
          onChange: (v) => onValueChange("legalStatus", v),
          error: errors["legalStatus"],
          inputProps: {
            name: "legalStatus",
            defaultValue: state.answers.legalStatus,
          },
        }}
      />
      <Widget
        src="nearui.near/widget/Input.ExperimentalText"
        props={{
          label: (
            <>
              Please provide a link to your DAO&apos;s Legal Document{" "}
              <span className="text-black-50 fw-light small">(if any)</span>
            </>
          ),
          placeholder: "https://Legal_Document",
          size: "md",
          onChange: (v) => onValueChange("legalDocument", v),
          error: errors["legalDocument"],
          inputProps: {
            name: "legalDocument",
            defaultValue: state.answers.legalDocument,
          },
        }}
      />
    </div>

    {renderFooter(state.answers)}
  </div>
);
