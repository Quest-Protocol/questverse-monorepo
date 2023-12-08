const quests = Near.view("questsmock.near", "get_all_quests");

if (!quests) {
  return "";
}

const Container = styled.div`
  padding: 30px 0;
  margin: 0;
`;

return (
  <>
    <div>
      <Container className="d-flex row justify-content-between w-100">
        <h2 className="mb-3" style={{ fontFamily: "Courier" }}>
          <b>Discover</b>
        </h2>
        {quests.map((quest) => (
          <div className="m-2">
            <Widget
              src="/*__@appAccount__*//widget/components.quest.card"
              props={{ questId: quest[0] }}
            />
          </div>
        ))}
      </Container>
    </div>

    {/* <>
      {state.showModal && (
        <Widget
          src={widgets.compose}
          props={{
            handleClose: () => State.update({ showModal: false }),
          }}
        />
      )}
    </> */}
  </>
);
