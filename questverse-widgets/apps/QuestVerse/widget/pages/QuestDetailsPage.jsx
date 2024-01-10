const questContract = "v0.questverse.near";
const questId = JSON.parse(props.questId);
if (!questId) {
  return "No account or quest id provided";
}
const verifiedCheck = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="13"
    viewBox="0 0 16 13"
    fill="none"
  >
    <rect y="0.5" width="16" height="12" rx="6" fill="#B0B0B0" />
    <path
      d="M5 6.69231L7 9L11 4"
      stroke="white"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const CardRoot = styled.div`
  width: 100%;
  max-width: 1440px;
  border: 1px solid #efefef;
  box-shadow: 2px 2px 12px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  * {
    font-family: Helvetica Neue;
    line-height: 110%;
  }
  flex-flow: column nowrap;
  gap: 1rem;
  margin: 0 auto 20px auto;
  h1 {
    overflow: hidden;
    color: #000;
    text-overflow: ellipsis;
    whitespace: nowrap;
    font-family: Helvetica Neue;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
  }
  h6,
  h5 {
    font-weight: 900;
  }
`;
const Image = styled.div`
  height: 100px;
  widt: 100px;
  margin-right: 10px;
  background-image: url(${questData.img_url ??
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRub7hFLkStCvZiaSeiUGznP4uzqPPcepghhg&usqp=CAU"});
  background-size: cover;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  position: relative;
  width: 100%;
  // background: black;
`;

const ImageProfile = styled.div`
  img {
    position: absolute;
    width: 66px;
    height: 66px;
    flex-shrink: 0;
    border: 1px solid white;
    border-radius: 50%;
    top: 45px;
    z-index: 99;
    object-fit: cover;
    background: black;
    left: 16px;
  }
`;

const HeaderText = styled.div`
  margin-bottom: 2rem;
  flex: 0.8;
  p {
    margin-bottom: 10px;
    overflow: hidden;
    color: #b0b0b0;
    text-overflow: ellipsis;
    font-family: Helvetica Neue;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;

const CardBody = styled.div`
  margin-top: 20px;
  padding: 0 16px;
  display: inherit;
  flex-flow: inherit;
  gap: inherit;
  h1 {
    color: #000;
    font-family: Helvetica Neue;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
  }
  p {
    overflow: hidden;
    color: #000;
    text-overflow: ellipsis;
    whitespace: nowrap;
    font-family: Helvetica Neue;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 148%;
  }
`;

const TagsSec = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  .tags {
    display: flex;
    gap: 0.5rem;
    color: #b0b0b0;
    font-size: 12px;
    font-weight: 400;
    .tag {
      display: flex;
      padding: 2px 16px;
      justify-content: center;
      align-items: center;
      gap: 8px;
      border-radius: 50px;
      background: #f8f8f8;
    }
  }
`;

const Button = styled.div`
width: 100%;
display: flex;
align-items: center;
justify-content: center;
margin-top: 10px;
  button {
    border: 1px solid black;
    border-radius: 0;
    color: white;
    background: black;
    text-align: center
    display: flex;
    width: 296px;
    padding: 7px 0px;
    cursor: pointer;
  }
  button:disabled {
    background: grey;
    border: grey;
    cursor: not-allowed;
  }
  button:hover {
    background: white;
    color: black;
    border-color: black;
  }
`;

const Username = styled.div`
  display: flex;
  align-items: center;
  p {
    margin-bottom: 10px;
    overflow: hidden;
    color: #b0b0b0;
    text-overflow: ellipsis;
    font-weight: 400;
    line-height: normal;
    text-transform: uppercase;
  }
  svg {
    margin-bottom: 10px;
    margin-left: 5px;
  }
`;

const Card = styled.div`
  box-shadow: 2px 2px 12px 0px rgba(0, 0, 0, 0.07);
  border-radius: 0.5rem;
  padding: 1rem;
  .quest-reward {
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .near-icon {
    width: 16px;
  }
`;

const questData = Near.view(questContract, "quest_by_id", {
  quest_id: questId,
});

if (!questData) {
  return "loading quest details...";
}

const createdAt = questData.created_at;
const startTime = questData.starts_at;
const endTime = questData.ends_at;
const expiresAt = questData.expires_at;
const rewardAmount = (
  questData.total_reward_amount / 1000000000000000000000000
).toFixed(4);
const claimsLeft =
  questData.total_participants_allowed - questData.num_claimed_rewards;
const indexer = questData.indexer_name;

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const options = {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

const formattedStartDate = formatDate(startTime);
const formattedEndDate = formatDate(endTime);
const formattedExpiresDate = formatDate(expiresAt);
const claimsData = quest.participants || [];

// const tags =
//   questData && questData.tags.map((tag) => <span className="tag">#{tag}</span>);

const TaskContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 0.6rem;
  background: #efefef;
  box-shadow: 2px 2px 12px 0px rgba(0, 0, 0, 0.07);
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 10px solid
    ${({ completed }) =>
      completed
        ? `
      #000
    `
        : `#B0B0B0`};

  .completed {
    border-radius: 50px;
    background: #b0b0b0;
    color: #fff;
    padding: 4px 8px;
  }
`;

const Header = styled.div`
  background: black;
`;

const SubtaskText = styled.div`
  flex: 1;
  font-size: 16px;
`;

const TaskButton = styled.button`
${({ white }) =>
  white
    ? `background-color: #fff;
  color: #000;
  :hover{
    background-color: #000;
  color: #fff;
  }
  ;`
    : `background-color: #000;
  color: #fff;
  :hover{
    background-color: #fff;
  color: #000;
  }
  `}
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer
  box-shadow: 2px 2px 12px 0px rgba(0, 0, 0, 0.07);
  border: none;
  display: ${({ completed }) => completed && "none"};
`;

const SubtaskImage = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 10px;
`;

const Count = styled.span`
  display: flex;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: ${({ completed }) =>
    completed
      ? `
      #fff
    `
      : `#B0B0B0`};
  border: 1px solid
    ${({ completed }) =>
      completed
        ? `
      #fff
    `
        : `#B0B0B0`};
  background: ${({ completed }) =>
    completed
      ? `
      #000
    `
      : `#fff`};
`;

const TaskMain = styled.div`
  flex: 1;
`;
const TaskReward = styled.div`
  span {
    display: flex;
    padding: 4px 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    font-weight: 700;
    border-radius: 50px;
    background: #fff;
    opacity: 0.5;
    width: 70px;
    img {
      width: 15px !important;
    }
  }
`;

const SubtaskList = ({ tasks }) => {
  return (
    <ul>
      {tasks.map((task, index) => (
        <TaskContainer key={index} completed={task.completed}>
          <Count completed={task.completed}>{index + 1}</Count>
          <TaskMain>
            <SubtaskText>{task.text}</SubtaskText>
            {!task.completed && (
              <>
                <TaskButton white onClick={() => handleStart(index)}>
                  Start
                </TaskButton>
                <TaskButton onClick={() => handleVerify(index)}>
                  Verify
                </TaskButton>
              </>
            )}
          </TaskMain>

          {task.completed ? (
            <span className="completed">Completed</span>
          ) : (
            <TaskReward>
              <span>
                {rewardAmount}{" "}
                <img
                  src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrJuxjGxj4QmyreE6ix4ygqm5pK9Nn_rdc8Ndw6lmJcd0SSnm2zBIc2xJ_My1V0WmK2zg&usqp=CAU`}
                  className="near-icon"
                />
              </span>
            </TaskReward>
          )}
        </TaskContainer>
      ))}
    </ul>
  );
};

const handleStart = (task) => {
  console.log(`start ${task + 1}`);
};
const handleVerify = (task) => {
  console.log(`verify ${task + 1}`);
};

//check if completed base on time difference
const currentTimestamp = Date.now();
const isCompleted = () =>
  currentTimestamp > questData.end_time ? true : false;
console.log(isCompleted());

const tasks = [
  {
    text: questData.description,
    completed: true,
  },
  // sample
  {
    text: questData.description,
    completed: false,
  },
];

return (
  <CardRoot>
    <Header className="d-flex p-3 px-4 align-items-center rounded justify-content-between bg-black">
    <h3 className="mt-2" style={{ fontFamily: "Courier", color: "white" }}>
      <Link to="//*__@appAccount__*//widget/app">
        <b>QuestVerse</b>
      </Link>
    </h3>
    </Header>
    <CardBody>
      <div className="row">
        {questData.img_url && <Image />}
        <HeaderText>
          <h1>{questData.title ?? `Lorem Ipsum Misson/Quest/Task`}</h1>
          <Username>
            <p>{questData.indexer_config_id ?? "Lorem Ipsum User"}</p>
            {verifiedCheck}
          </Username>
        </HeaderText>
      </div>
      <Card>
        <h5>Action Details</h5>
        <Card>
          <p>
            {(questData.description.length > 100
              ? `${questData.description.slice(0, 100)}...`
              : questData.description) ??
              `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`.slice(
                0,
                100
              )}
          </p>
          <TagsSec>
            <div className="tags d-flex flex-row me-3">
              <Widget
                src="hack.near/widget/tags"
                props={{
                  path: `${questData.creator}/quest/${questData.quest_id}`,
                  url: "/bos.questverse.near/widget/pages.Discover",
                }}
              />
            </div>
          </TagsSec>
        </Card>
      </Card>
      <Card className="details-card">
        <h5>Details</h5>
        <div className="row gap-2">
          <Card className="col-5">
            <h6>Quest Reward</h6>
            <p className="quest-reward">
              {rewardAmount}{" "}
              <img
                src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrJuxjGxj4QmyreE6ix4ygqm5pK9Nn_rdc8Ndw6lmJcd0SSnm2zBIc2xJ_My1V0WmK2zg&usqp=CAU`}
                className="near-icon"
              />
            </p>
          </Card>
          <Card className="col-5">
            <h6>Total Rewards Remaining</h6>
            <p className="quest-reward">
              {(claimsLeft * rewardAmount).toFixed(4)}
              <img
                src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrJuxjGxj4QmyreE6ix4ygqm5pK9Nn_rdc8Ndw6lmJcd0SSnm2zBIc2xJ_My1V0WmK2zg&usqp=CAU`}
                className="near-icon"
              />
            </p>
            <p>{claimsLeft} Claims Left</p>
          </Card>
          <div className="w-100"></div>

          <Card className="col-5">
            <h6>Creation Date</h6>
            <p>{new Date(questData.created_at).toLocaleString()}</p>
          </Card>
          <Card className="col-5">
            <h6>Start date</h6>
            <p>{formattedStartDate}</p>
            <p>{new Date(questData.starts_at).toLocaleString()}</p>
          </Card>
          <Card className="col-5">
            <h6>End date</h6>
            {questData.ends_at ? (
              <p>
                <p>{formattedEndDate}</p>

                {new Date(questData.ends_at).toLocaleString()}
              </p>
            ) : (
              <p> Quest Has Not Ended.</p>
            )}
          </Card>
          <Card className="col-5">
            <h6>Expiry date</h6>
            <p>{formattedExpiresDate}</p>
            <p>{new Date(questData.expires_at).toLocaleString()}</p>
          </Card>
        </div>
      </Card>
      <Card>
        <h5>{tasks.length} tasks:</h5>
        <SubtaskList tasks={tasks} />
      </Card>
      <Card className="details-card">
        <h5>Claim Rewards</h5>
        <p>Claim your rewards to complete the quest and earn: </p>
        <p className="quest-reward">
          {rewardAmount}{" "}
          <img
            src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrJuxjGxj4QmyreE6ix4ygqm5pK9Nn_rdc8Ndw6lmJcd0SSnm2zBIc2xJ_My1V0WmK2zg&usqp=CAU`}
            className="near-icon"
          />
        </p>
      </Card>
    </CardBody>
    <Button>
      <button disabled={isCompleted()}>
        {isCompleted() ? "Expired" : "Claim Rewards"}
      </button>
    </Button>
  </CardRoot>
);
