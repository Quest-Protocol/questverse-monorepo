use near_crypto::{InMemorySigner, SecretKey, Signature, Signer};
use near_primitives::types::AccountId;
use serde::{Deserialize, Serialize};
use std::convert::Infallible;
use std::env;
use std::error::Error;
use std::fmt::Debug;
use std::str::FromStr;
use warp::Filter;

#[derive(Deserialize, Serialize, Debug)]
struct QuestValidationInfo {
    account_id: String,
    quest_id: String,
}

#[derive(Serialize, Debug)]
struct ValidationResponse {
    valid: bool,
    message: String,
}

#[derive(Serialize, Debug)]
struct ClaimReceiptResponse {
    signed_receipt: String,
    claim_data: QuestValidationInfo,
}
fn sign_claim(payload: &[u8]) -> Result<Signature, Box<dyn Error>> {
    let secret_key = env::var("SECRET KEY").expect("SECRET_KEY must be set up in the environment");
    let secret_key = SecretKey::from_str(&secret_key)?;

    let account_id = env::var("ACCOUNT ID").unwrap_or("v1.questverse.near".to_string());
    let account_id = AccountId::from_str(&account_id)?;

    let signer = InMemorySigner::from_secret_key(account_id, secret_key);

    Ok(signer.sign(payload))
}

async fn validate_quest(info: QuestValidationInfo) -> Result<impl warp::Reply, Infallible> {
    println!("info: {:?}", info);
    Ok(warp::reply::json(&ValidationResponse {
        valid: true,
        message: "Hello, World!".to_string(),
    }))
}

async fn generate_claim_receipt(info: QuestValidationInfo) -> Result<impl warp::Reply, Infallible> {
    println!("info: {:?}", info);
    let signed_tx = "example_signed_tx".to_string();

    Ok(warp::reply::json(&ClaimReceiptResponse {
        signed_receipt: "".to_string(),
        claim_data: QuestValidationInfo {
            account_id: "".to_string(),
            quest_id: "".to_string(),
        },
    }))
}

#[tokio::main]
async fn main() {
    let validate = warp::path!("v1" / "validate" / String / String)
        .map(|account_id, quest_id| QuestValidationInfo {
            account_id,
            quest_id,
        })
        .and_then(validate_quest);

    let generate_claim_receipt = warp::path!("v1" / "generate_claim_receipt" / String / String)
        .map(|account_id, quest_id| QuestValidationInfo {
            account_id,
            quest_id,
        })
        .and_then(generate_claim_receipt);
    let routes = validate.or(generate_claim_receipt);

    warp::serve(routes).run(([127, 0, 0, 1], 8080)).await;
}
