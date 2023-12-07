const QUESTVERSE_CONTRACT = "/*__@replace:QUESTVERSE_CONTRACT__*/";
const QUERYAPI_CONTRACT = "/*__@replace:QUERYAPI_CONTRACT__*/";
const API_SIGNER_SERVICE = "/*__@replace:API_SIGNER_SERVICE__*/";

return (
  <>
    <h1>Hello BOS</h1>
    <p>Deploying to /*__@appAccount__*/</p>
    <p>QUESTVERSE_CONTRACT: {QUESTVERSE_CONTRACT}</p>
    <p>QUERYAPI_CONTRACT: {QUERYAPI_CONTRACT}</p>
    <p>API_SIGNER_SERVICE: {API_SIGNER_SERVICE}</p>
    <Widget src="/*__@appAccount__*//widget/createQuest" />
  </>
);
