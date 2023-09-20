const accountId = props.accountId ?? context.accountId;
const name = props.name ?? accountId;
const nameSize = props.nameSize ?? "1.625em";
const accountSize = props.accountSize ?? "0.95em";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.5em;
`;

const Name = styled.span`
  font-style: normal;
  font-weight: 700;
  font-size: ${nameSize};
  overflow: hidden;
  max-width: 25ch;
  text-overflow: ellipsis;
  color: #101828;
`;

const Account = styled.span`
  font-style: normal;
  font-weight: 400;
  font-size: ${accountSize};
  line-height: 1.4em;
  overflow: hidden;
  max-width: 25ch;
  text-overflow: ellipsis;
  color: #687076;
`;

State.init({
  name,
  nameIsFetched: name && name.length > 0 && name !== accountId,
});

if (!state.nameIsFetched) {
  Near.asyncView(
    "social.near",
    "get",
    { keys: [`${accountId}/profile/name`] },
    "final",
    false
  ).then((data) =>
    State.update({
      name: data[accountId]?.profile?.name ?? name,
      nameIsFetched: true,
    })
  );
}

return (
    <Container>
      <a
        key={i}
        href={`#/mob.near/widget/ProfilePage?accountId=${accountId}`}
        className="text-decoration-none d-inline-block"
      >
        <Widget
          src="mob.near/widget/Profile.OverlayTrigger"
          props={{
            accountId,
            children: (
              <Widget
                src="mob.near/widget/ProfileImage"
                props={{
                  accountId,
                  style: { zIndex: 10 - i },
                  className: "face",
                  tooltip: false,
                  imageStyle: {},
                  imageClassName: "",
                }}
              />
            ),
          }}
        />
      <Name>{state.name}</Name>
      <Account>@{accountId}</Account>
      </a>
    </Container>
);
