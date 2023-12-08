const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  min-height: 100vh;

  background: #f4f4f4;

  margin-top: calc(-1 * var(--body-top-padding));
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Header = styled.div`
  background: black;
`;

const registryContract = "registry.i-am-human.near";
const issuer = "fractal.i-am-human.near";

// SBT verification
let isVerified = false;
const userSBTs = Near.view("registry.i-am-human.near", "sbt_tokens_by_owner", {
  account: props.accountId ?? context.accountId,
});

for (let i = 0; i < userSBTs.length; i++) {
  if ("fractal.i-am-human.near" == userSBTs[i][0]) {
    isVerified = true;
  }
}

const AppHeader = ({ page }) => (
  <Widget src="/*__@appAccount__*//widget/components.Header" props={{ page }} />
);

const Footer = ({ page }) => {
  return <></>;
};

function AppLayout({ page, children }) {
  return (
    <>
      <Container>
        <AppHeader page={page} />
        <ContentContainer>{children}</ContentContainer>
        <Footer page={page} />
      </Container>
    </>
  );
}

return { AppLayout };
