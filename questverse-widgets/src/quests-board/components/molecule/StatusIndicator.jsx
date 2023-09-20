const status = props.status ?? "Upcoming";

const getStatusStyles = (status) => {
  switch (status) {
    case "Active":
      return {
        bgColor: "#12b76a",
        textColor: "#027a48",
        containerBgColor: "#ecfdf3",
      };
    case "Expired":
      return {
        bgColor: "#d3302f",
        textColor: "#d3302f",
        containerBgColor: "#fdeced",
      };
    case "Upcoming":
      return {
        bgColor: "#f79009",
        textColor: "#b54708",
        containerBgColor: "#fffaeb",
      };
    default:
      return {};
  }
};

const TextSpan = styled.span`
  font-size: 0.95em;
  color: ${({ status }) => getStatusStyles(status).textColor};
  display: block;
  margin-left: 0.25em;
  white-space: nowrap;
`;

const Icon = styled.i`
  background-color: ${({ status }) => getStatusStyles(status).bgColor};
  border-radius: 100%;
  width: 0.6em;
  height: 0.6em;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.125em 0.5em 0.125em 0.375em;
  gap: 0.25em;
  background-color: ${({ status }) => getStatusStyles(status).containerBgColor};
  mix-blend-mode: multiply;
  border-radius: 16px;
`;

const statusTextMap = {
  Active: "Open",
  Expired: "Expired",
  Upcoming: "Upcoming",
};

return (
  <Container status={props.status}>
    <Icon status={props.status} />
    <TextSpan status={props.status}>{statusTextMap[props.status]}</TextSpan>
  </Container>
);
