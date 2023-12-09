  const h = block.header().height;
  // await context.set("height", h);
  const daoTxs = block
    .actions()
    .filter((action) => action.receiverId.includes({{accountId}}))
    .flatMap((action) =>
      action.operations
        .map((operation) => operation["FunctionCall"])
        .map((functionCallOperation) => ({
          ...functionCallOperation,
          args: base64decode(functionCallOperation.args),
          receiptId: action.receiptId, // providing receiptId as we need it
        }))
    );

  if (daoTxs.length > 0) {
    console.log("Found DAO Txs in Block...");
    console.log(daoTxs);
  }
