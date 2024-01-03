use near_units::parse_near;
use near_workspaces::{Account, AccountId, Contract, DevNetwork, Worker};
use serde_json::json;

use near_sdk::base64;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::AccountId as NearAccountId;

extern crate ed25519_dalek;
extern crate rand;
use ed25519_dalek::{Keypair, Signature, Signer};

/// 1s in ms
const MSECOND: u64 = 1_000_000;
const SEC_TO_MS: u64 = 1_000;

#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Claim {
    pub account_id: NearAccountId,
    pub quest_id: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Quest {
    pub quest_id: u64,
    pub creator: NearAccountId,
    pub created_at: u64,
    pub starts_at: u64,
    pub expires_at: u64,
    pub closed_at: Option<u64>,
    pub total_reward_amount: u128,
    pub total_participants_allowed: u64,
    pub num_claimed_rewards: u64,
    pub participants: Vec<NearAccountId>,
    pub indexer_name: String,
}

pub struct InitStruct {
    pub quest_protocol: Contract,
    pub alice: Account,
    pub bob: Account,
    pub john: Account,
    pub admin: Account,
    pub keypair: Keypair,
}

fn generate_keypair() -> Keypair {
    Keypair::generate(&mut rand::thread_rng())
}

fn sign_claim(c: &Claim, k: &Keypair) -> (String, String) {
    let claim_bytes = c.try_to_vec().unwrap();
    let sig: Signature = k.sign(&claim_bytes);
    let sig_bytes = sig.to_bytes();
    (
        base64::encode(claim_bytes),
        base64::encode(sig_bytes.to_vec()),
    )
}

fn to_near_account(acc: &AccountId) -> NearAccountId {
    NearAccountId::new_unchecked(acc.to_string())
}

async fn init(worker: &Worker<impl DevNetwork>) -> anyhow::Result<InitStruct> {
    // deploy contracts
    let quest_protocol = worker
        .dev_deploy(include_bytes!("../../out/quest_protocol.wasm"))
        .await?;

    let keypair = generate_keypair();
    let signer = base64::encode(keypair.public.to_bytes().to_vec());

    print!("public key base64: {}", signer);

    let admin = worker.dev_create_account().await?;
    let alice = worker.dev_create_account().await?;
    let bob = worker.dev_create_account().await?;
    let john = worker.dev_create_account().await?;
    let registry = worker.dev_create_account().await?;

    // initialize contracts
    let res = quest_protocol
        .call("new")
        .args_json(json!({"admin": admin.id(),"sbt_registry": registry.id(), "claim_signer_pk": signer, "quest_fee": 10}))
        .max_gas()
        .transact()
        .await?;
    assert!(res.is_success(), "{:?}", res);

    Ok(InitStruct {
        quest_protocol: quest_protocol.to_owned(),
        alice,
        bob,
        john,
        admin,
        keypair,
    })
}
#[tokio::test]
async fn flow1() -> anyhow::Result<()> {
    let worker = near_workspaces::sandbox().await?;
    let setup = init(&worker).await?;

    // get current block time
    let block_info = worker.view_block().await?;
    let current_timestamp_ms = block_info.timestamp() / MSECOND;
    let start_time_ms = current_timestamp_ms + (5 * SEC_TO_MS);
    let end_time_ms = current_timestamp_ms + (600 * SEC_TO_MS);

    let res = setup.alice
        .call(setup.quest_protocol.id(), "create_quest")
        .args_json(json!({"quest_id": 1,"starts_at": start_time_ms,"expires_at": end_time_ms, "total_participants_allowed": 3, "indexer_name": "indexer_test", "title": "", "description": "", "img_url": "", "tags": [], "humans_only": false}))
        .max_gas()
        .deposit(parse_near!(" 10 N"))
        .transact()
        .await?;
    assert!(res.is_success(), "{:?}", res);

    // fast forward to quest in progress
    worker.fast_forward(10).await?;

    let initial_bob_balance = setup.bob.view_account().await?.balance;

    let claim = Claim {
        account_id: to_near_account(setup.bob.id()),
        quest_id: 1,
    };

    let (claim_b64, sig_b64) = sign_claim(&claim, &setup.keypair);

    let res = setup
        .bob
        .call(setup.quest_protocol.id(), "claim_reward")
        .args_json(json!({"claim_b64": claim_b64,"sig_b64": sig_b64}))
        .max_gas()
        .transact()
        .await?;
    assert!(res.is_success(), "{:?}", res);

    let new_bob_balance = setup.bob.view_account().await?.balance;

    print!("initial bob balance: {:?}", initial_bob_balance);
    print!("new bob balance: {:?}", new_bob_balance);
    print!("diff: {:?}", new_bob_balance - initial_bob_balance);

    let res: Vec<Quest> = setup
        .alice
        .call(setup.quest_protocol.id(), "quests")
        .max_gas()
        .transact()
        .await?
        .json()?;
    print!("{:?}", res);

    let initial_alice_balance = setup.alice.view_account().await?.balance;

    let res = setup
        .alice
        .call(setup.quest_protocol.id(), "close_quest")
        .args_json(json!({"quest_id": 1}))
        .max_gas()
        .transact()
        .await?;
    assert!(res.is_success(), "{:?}", res);

    let new_alice_balance = setup.alice.view_account().await?.balance;

    print!("initial alie balance: {:?}", initial_alice_balance);
    print!("new alices balance: {:?}", new_alice_balance);
    print!("diff: {:?}", new_alice_balance - initial_alice_balance);

    let res: Vec<Quest> = setup
        .alice
        .call(setup.quest_protocol.id(), "quests")
        .max_gas()
        .transact()
        .await?
        .json()?;
    print!("{:?}", res);

    Ok(())
}
