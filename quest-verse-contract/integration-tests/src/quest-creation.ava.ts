import { Worker, NearAccount } from 'near-workspaces';
import { CONTRACT_METADATA, generateKeyPairs, getDropInformation, getKeyInformation, getKeySupplyForDrop, LARGE_GAS, queryAllViewFunctions, WALLET_GAS } from "../utils/general";
import anyTest, { TestFn } from 'ava';

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

const QUESTS_PROTOCOL_PUBLIC_KEY_STR: String = "ed25519:Dru47TDn3vaN2PMXwoq8cY6o2ERzqcidxFj6NTdxUgHh";
test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;

    // Deploy the keypom contract.
    const keypom = await root.devDeploy(`./ext-wasm/keypom.wasm`);
    const questVerse = await root.devDeploy('./contract/out/quest_protocol.wasm');
    // Init the contracts
    await keypom.call(keypom, 'new', {root_account: 'testnet', owner_id: keypom, contract_metadata: CONTRACT_METADATA});
    await questVerse.call(questVerse, 'new', {owner_id: questVerse, claim_signer_public_key: QUESTS_PROTOCOL_PUBLIC_KEY_STR});

    // Test users
    const rosh = await root.createSubAccount('rosh');
    const morgs = await root.createSubAccount('morgs');

  t.context.worker = worker;
  t.context.accounts = { root, keypom, questVerse, rosh, morgs };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('create a simple near quest', async (t) => {
  const {  root, keypom, questVerse, rosh, morgs  } = t.context.accounts;
});

