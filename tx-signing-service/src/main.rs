use crate::graphql_service::check_quest;
use base64::{engine::general_purpose, Engine as _};
use ed25519_dalek::Signature;
use reqwest::{header::InvalidHeaderValue, Error as ReqwestError};
use serde::{Deserialize, Serialize};
use std::convert::Infallible;
use std::fmt::Debug;
use thiserror::Error;
use warp::Filter;

mod graphql_service;
mod internal;

#[derive(Debug, Deserialize, Serialize, Clone)]
struct QuestConditionQuery {
    account_id: String,
    block_height: u64,
    is_completed: bool,
}

enum QuestState {
    Completed(String, Signature),
    NotCompleted(String, QuestConditionQuery),
}

#[derive(Debug, Error)]
enum QuestStateError {
    #[error("Request failed: {0}")]
    ReqwestError(#[from] ReqwestError),

    #[error("Query not found")]
    QueryNotFound,

    #[error("Claim error: {0}")]
    ClaimError(String),

    #[error("Invalid header value: {0}")]
    InvalidHeaderValueError(#[from] InvalidHeaderValue),
}

impl warp::reject::Reject for QuestStateError {}

#[derive(Serialize)]
struct WarpErrorMessage {
    code: u16,
    message: String,
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
    claim_data: String,
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
) -> Result<impl warp::Reply, warp::Rejection> {
    println!("info: {:?}", info);

    let quest_condition = check_quest(&info).await;

    let mut signed_receipt = String::new();
    let mut message = None;

    match quest_condition {
        Ok(QuestState::Completed(_, sig)) => {
            signed_receipt = sig.to_string();
        }
        Ok(QuestState::NotCompleted(msg, _)) => {
            message = Some(msg);
        }
        Err(quest_error) => {
            return Err(warp::reject::custom(quest_error));
        }
    }

    let sig_bytes = signed_receipt.into_bytes();
    let sig_bytes_encoded = general_purpose::STANDARD_NO_PAD.encode(&sig_bytes.to_vec());
    let claim_data_bytes = serde_json::to_vec(&QuestValidationInfo {
        account_id: info.account_id,
        quest_id: info.quest_id,
    })
    .unwrap();

    let claim_data_encoded = general_purpose::STANDARD_NO_PAD.encode(claim_data_bytes);
    Ok(warp::reply::json(&ClaimReceiptResponse {
        message,
        signed_receipt: sig_bytes_encoded,
        claim_data: claim_data_encoded,
    }))
}

async fn handle_errors(err: warp::Rejection) -> Result<impl warp::Reply, warp::Rejection> {
    if let Some(api_error) = err.find::<QuestStateError>() {
        let code = match api_error {
            QuestStateError::ReqwestError(_) => warp::http::StatusCode::BAD_GATEWAY,
            QuestStateError::ClaimError(_) => warp::http::StatusCode::BAD_REQUEST,
            QuestStateError::InvalidHeaderValueError(_) => warp::http::StatusCode::BAD_REQUEST,
            QuestStateError::QueryNotFound => warp::http::StatusCode::NOT_FOUND,
        };

        let json = warp::reply::json(&WarpErrorMessage {
            code: code.as_u16(),
            message: api_error.to_string(),
        });

        Ok(warp::reply::with_status(json, code))
    } else {
        Err(err)
    }
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
            .and_then(generate_claim_receipt)
            .recover(handle_errors);

    let routes = validate.or(generate_claim_receipt);

    warp::serve(routes).run(([127, 0, 0, 1], 8080)).await;
}
