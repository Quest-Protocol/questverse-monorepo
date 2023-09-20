const accountId = props.accountId ?? context.accountId;
const name = props.name ?? accountId;
const nameSize = props.nameSize ?? "1.625em";
const accountSize = props.accountSize ?? "0.95em";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.2em;
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
  <a
    key={i}
    href={`#/mob.near/widget/ProfilePage?accountId=${accountId}`}
  >
    <Container>
      <Name>{state.name}</Name>
      <Account>@{accountId}</Account>
    </Container>
  </a>
);
