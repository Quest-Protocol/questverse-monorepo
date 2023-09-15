<p align="center">
    <img width="341" alt="Pasted Graphic 5" src="https://github.com/roshaans/quests/assets/25015977/b35e6343-91d5-4746-9d70-2412dc2475b9">
</p>

### What is the **Quest Protocol**?
Quest Protocol is a rewards-like protocol that allows anyone to engage users to perform on-chain activity and earn crypto-native rewards for doing so. 

We think that incentivized Quests (NFTs or USDC/Near/ETH) are an excellent tool in any web3 founders toolbox to not only educate their userbase but also incentive users to engage with their protocol to get usage and feedback from their customers!

By creating a robust toolkit for creating, validating, and claiming quests we have made this effective tool available for everyone to utilize in a fair way. 

## 🧩 Components
1. [Quest Protocol Contract](./contracts/block-quests)
A smart contract on the Near Blockchain that handles quest creation, indexer configuration for quests, and quest reward redemptions.
2. [quest-indexer](./quest-indexer/runner)
Indexer adapted from `near/queryapi` which is used to run and host indexers that power quests. The service exposes a GraphQL endpoint to fetch information completion status for each quest. The `tx-signing-service` uses this endpoint to validate and create reward redemption receipts. You can follow the project [here](https://github.com/near/queryapi)
3. [Signing Service](./tx-signing-service)
This service allows users to retrieve a `receipt` that allows them to redeem their rewards for compeleting quests.The service validates that the user completed the quest and signs a tx for the intended `account_id` to redeem the reward from the protocol deployed at `quests.near` 

4. [BOS Components](./widgets)
UI components hosted on the BOS which let users sign up for quests, create quests, see a leaderboard of fellow questors, as well as redeem your quest rewards.

### Possible Use Cases: 

####  **For Education:**

- **Want to teach people learn to rotate their keys?**

> Create a quest that distributes social NFT Badges to those who embark on the quest and successfully do it!

- **Teach people to participate in on-chain governance**
> Create a multi-step quest that walks users through joining a DAO and voting on a proposal to claim an exclusive social badge. Give an NFT reward or Near to those users who  

#### **For Founders:**

- **Launched your Dapp but struggling to find users?**
> Create an incentivized campaign that will distribute 1 Near each to users that interact with your protocol at least 5 times.

- **Created an awesome community tool like devogogs?**

> Give users an incentive to interact with your contract. e.g. 5 interactions with devgogs.near contract will mint you an NFT or unlock .001 Near reward. 

#### **For BOS ecosystem developers**

- **Tired of seeing apps on BOS that do not have their metadata tags filled in?**
> Incentivise pre-existing users with widgets on the BOS to fill out their metadata by giving them some cool NFTS or tokens!

- **Not happy with the number of likes on your BOS Post?**

> Create an incentivized quest for 10 participants and lock up 1 Near. Every user who likes your post will get .1 Near for doing so :)



