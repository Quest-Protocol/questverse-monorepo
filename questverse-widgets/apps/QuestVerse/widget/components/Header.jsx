const Toolbar = styled.div`
  margin-left: 20px;
  @media only screen and (max-width: 1061px) {
    margin: 10px 0 0 0;
  }
`;

const registryContract = "registry.i-am-human.near";
const issuer = "fractal.i-am-human.near";

// SBT verification
let isVerified = false;
const userSBTs = Near.view("registry.i-am-human.near", "sbt_tokens_by_owner", {
  account: context.accountId,
});

for (let i = 0; i < userSBTs.length; i++) {
  if ("fractal.i-am-human.near" == userSBTs[i][0]) {
    isVerified = true;
  }
}

return (
  <div className="d-flex p-3 px-4 align-items-center rounded justify-content-between bg-black">
    <h3 className="mt-2" style={{ fontFamily: "Courier", color: "white" }}>
      <Link to="//*__@appAccount__*//widget/app">
        <b>QuestVerse</b>
      </Link>
    </h3>
    <Toolbar>
      {!isVerified ? (
        <Widget
          src="hack.near/widget/n.style"
          props={{
            Link: {
              text: "Get Verified",
              href: "https://i-am-human.app/",
            },
          }}
        />
      ) : (
        <Widget src="hack.near/widget/start" />
      )}
    </Toolbar>
  </div>
);
