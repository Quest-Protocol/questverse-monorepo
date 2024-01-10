// Feed
// const type = props.type || "quest";
//
// const things = Social.keys(`*/${type}/*`, "final", {
//   return_type: "BlockHeight",
// });
//
// if (!things) {
//   return "Loading...";
// }
//
const accountId = props.accountId || context.accountId;
const quests = Near.view("/*__@replace:QUESTVERSE_CONTRACT__*/", "quests");
console.log("quests new", quests);
const user_claimed_quests =
  Near.view("/*__@replace:QUESTVERSE_CONTRACT__*/", "claimed_quests_by_user", {
    user: accountId,
  }) ?? [];

const Container = styled.div`
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
`;

const Grid = styled.div`
  display: grid;
  grid-gap: 10px;
  // grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

  // @media (min-width: 576px) {
  //   grid-gap: 15px;
  // }

  // @media (min-width: 992px) {
  //   grid-gap: 20px;
  // }

  > * {
    transition: transform 0.3s ease; // Smooth transition for hover effect

    &:hover {
      transform: scale(1.03); // Subtle scale effect on hover
    }
  }
`;

const processData = (data) => {
  const allItems = data.map((quest) => ({
    ...quest,
    isClaimedByUser: user_claimed_quests.includes(quest.quest_id),
  }));

  // sort by latest
  allItems.sort((a, b) => b.created_at - a.created_at);
  return allItems;
};

const items = processData(quests);

if (!items) {
  return "Loading data...";
}

function Item(item) {
  return (
    <Widget
      src="/*__@appAccount__*//widget/components.quest.card"
    props={{ questId: item.quest_id, isClaimedByUser: item.isClaimedByUser }}
    />
  );
  // // Use metadata.name if it exists, otherwise use the passed name
  // const displayName = metadata.name || name;
  // const defaultImage =
  //   "https://ipfs.near.social/ipfs/bafkreihi3qh72njb3ejg7t2mbxuho2vk447kzkvpjtmulsb2njd6m2cfgi";

  // return (
  //   <div
  //     className="card"
  //     style={{
  //       maxWidth: "100%",
  //       height: "200px",
  //       display: "flex",
  //       flexDirection: "column",
  //       justifyContent: "space-between",
  //       overflow: "hidden",
  //     }}
  //   >
  //     <div
  //       className="card-img-top"
  //       style={{
  //         backgroundImage: `url(${metadata.backgroundImage || defaultImage})`,
  //         height: "80px",
  //         backgroundSize: "cover",
  //         backgroundPosition: "center",
  //       }}
  //     />

  //     <div className="card-body">
  //       <Link
  //         to={`/${accountId}/${type}/${name}`}
  //         style={{ textDecoration: "none" }}
  //       >
  //         <h5 className="card-title">
  //           {accountId}/{displayName}
  //         </h5>
  //       </Link>
  //       {metadata.description && (
  //         <p
  //           className="card-text"
  //           style={{ overflow: "hidden", textOverflow: "ellipsis" }}
  //         >
  //           {metadata.description}
  //         </p>
  //       )}
  //     </div>
  //     {context.accountId && (
  //       <div
  //         className="pb-2"
  //         style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}
  //       >
  //         <Widget
  //           src="mob.near/widget/N.StarButton"
  //           props={{
  //             notifyAccountId: accountId,
  //             item: {
  //               type: "social",
  //               path: `${accountId}/${type}/${name}`,
  //             },
  //           }}
  //         />
  //         <Widget
  //           src="mob.near/widget/N.LikeButton"
  //           props={{
  //             notifyAccountId: accountId,
  //             item: {
  //               type: "social",
  //               path: `${accountId}/${type}/${name}`,
  //             },
  //           }}
  //         />
  //       </div>
  //     )}
  //   </div>
  // );
}

return (
  <Container>
    <div className="d-flex justify-content-between align-items-center w-100">
      <h2 className="mb-3" style={{ fontFamily: "Helvetica Neue" }}>
        <b>Discover</b>
      </h2>
      <Link to={`//*__@appAccount__*//widget/app?page=create`}>
        <button className="btn btn-primary">Create</button>
      </Link>
    </div>
    <Widget
      src="everycanvas.near/widget/ItemFeed"
      props={{
        items: items,
        renderItem: Item,
        perPage: 100,
        renderLayout: (items) => <Grid>{items}</Grid>,
      }}
    />
  </Container>
);
