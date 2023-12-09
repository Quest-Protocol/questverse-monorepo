 const DAO_ACCOUNT_ID = "{{DAO_ACCOUNT_ID}}";
  const GROUP = "{{GROUP}}";

  function base64decode(encodedValue) {
    let buff = Buffer.from(encodedValue, "base64");
    return JSON.parse(buff.toString("utf-8"));
  }
  const h = block.header().height;
  const txs = block
    .actions()
    .filter((action) => action.receiverId.includes(DAO_ACCOUNT_ID))
    .flatMap((action) =>
      action.operations
        .map((operation) => operation["FunctionCall"])
        .filter((operation) => operation?.methodName === "add_proposal")
        .map((functionCallOperation) => ({
          ...functionCallOperation,
          args: base64decode(functionCallOperation.args),
          receiptId: action.receiptId, // providing receiptId as we need it
        }))
    );

  if (txs.length > 0) {
    console.log("Found DAO Txs in Block...");
    const blockHeight = block.blockHeight;
    const blockTimestamp = block.header().timestampNanosec;
    await Promise.all(
      txs.map(async (action) => {
        console.log(action);
        const addMemberArgs = action?.proposal?.kind?.AddMemberToRole;

        // if creates a post
        if (addMemberArgs.role == GROUP) {
          context.db.QuestTracker.insert({
            account_id: addMemberArgs.member_id,
            block_height: blockHeight,
            is_completed: true,
          });
          context.db.Details.insert({
            account_id: addMemberArgs.member_id,
            proposal_id: 0,
            receipt: action.receipt,
          });
        }
      })
    );
  }
