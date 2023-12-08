use serde::{Deserialize, Serialize};
use std::convert::Infallible;
use std::error::Error;
use std::fmt::Debug;
use std::future::Future;
use reqwest::{header::InvalidHeaderValue, Error as ReqwestError};
use thiserror::Error;
use warp::Filter;
use near_crypto::Signature;
use crate::graphql_service::check_quest;

mod internal;
mod graphql_service;

#[derive(Debug, Deserialize, Serialize, Clone)]
struct QuestConditionQuery {
    account_id: String,
    block_height: u64,
    is_completed: bool,
}

enum QuestState {
    Completed(
        String,
        Signature
    ),
    NotCompleted(
        String,
        QuestConditionQuery,
    )
}

#[derive(Debug, Error)]
enum QuestStateError {
    #[error("Request failed: {0}")]
    ReqwestError(#[from] ReqwestError),

    #[error("Query not found")]
    QueryNotFound,

    #[error("Claim error: {0}")]
    ClaimError(Box<dyn Error>),

    #[error("Invalid header value: {0}")]
    InvalidHeaderValueError(#[from] InvalidHeaderValue),
}

#[derive(Serialize, Deserialize)]
struct QuestPayload {
    account_id: String,
    quest_id: u64,
}

#[derive(Deserialize, Serialize, Debug)]
struct QuestValidationInfo {
    account_id: String,
    quest_id: String,
}

#[derive(Deserialize, Serialize, Debug)]
struct QuestValidationRequest {
    account_id: String,
    quest_id: String,
    indexer_config_id: String,
}

#[derive(Serialize, Debug)]
struct ValidationResponse {
    valid: bool,
    message: String,
}

#[derive(Serialize, Debug)]
struct ClaimReceiptResponse {
    message: Option<String>,
    signed_receipt: String,
    claim_data: QuestValidationInfo,
}

async fn validate_quest(info: QuestValidationInfo) -> Result<impl warp::Reply, Infallible> {
    println!("info: {:?}", info);
    Ok(warp::reply::json(&ValidationResponse {
        valid: true,
        message: "Hello, World!".to_string(),
    }))
}

async fn generate_claim_receipt(
    info: QuestValidationRequest,
) -> Result<impl warp::Reply, Infallible> {
    println!("info: {:?}", info);

    let quest_condition = check_quest(&info)?;

    let mut signed_receipt = String::new();
    let mut message = None;
    match quest_condition {
        QuestState::Completed(_, sig) => {
            signed_receipt = sig.to_string();
        },
        QuestState::NotCompleted(msg, condition_query) => {
            message = Some(msg);
        }
    }

    Ok(warp::reply::json(&ClaimReceiptResponse {
        message,
        signed_receipt,
        claim_data: QuestValidationInfo {
            account_id: info.account_id,
            quest_id: info.quest_id,
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

    let generate_claim_receipt =
        warp::path!("v1" / "generate_claim_receipt" / String / String / String)
            .map(
                |account_id, quest_id, indexer_config_id| QuestValidationRequest {
                    account_id,
                    quest_id,
                    indexer_config_id,
                },
            )
            .and_then(generate_claim_receipt);
    let routes = validate.or(generate_claim_receipt);

    warp::serve(routes).run(([127, 0, 0, 1], 8080)).await;
}
