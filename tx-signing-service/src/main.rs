use serde::{Deserialize, Serialize};
use std::convert::Infallible;
use std::fmt::Debug;
use warp::Filter;
use near_jsonrpc_client::{JsonRpcClient};
use near_primitives::types::{AccountId};

use serde_json::Value;
use anyhow::Result;
mod internal;

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

async fn validate_quest(info: QuestValidationInfo) -> Result<impl warp::Reply, Infallible> {
    println!("info: {:?}", info);
    Ok(warp::reply::json(&ValidationResponse {
        valid: true,
        message: "Hello, World!".to_string(),
    }))
}

async fn generate_claim_receipt(info: QuestValidationInfo) -> Result<impl warp::Reply, Infallible> {
    println!("info: {:?}", info);
    let _signed_tx = "example_signed_tx".to_string();

    Ok(warp::reply::json(&ClaimReceiptResponse {
        signed_receipt: "".to_string(),
        claim_data: QuestValidationInfo {
            account_id: "".to_string(),
            quest_id: "".to_string(),
        },
    }))
}

pub(crate) fn get_function_call_request(
    block_height: u64,
    account_id: near_primitives::types::AccountId,
    method_name: &str,
    args: serde_json::Value,
) -> near_jsonrpc_client::methods::query::RpcQueryRequest {
    near_jsonrpc_client::methods::query::RpcQueryRequest {
        block_reference: near_primitives::types::BlockReference::BlockId(
            near_primitives::types::BlockId::Height(block_height),
        ),
        request: near_primitives::views::QueryRequest::CallFunction {
            account_id,
            method_name: method_name.to_string(),
            args: near_primitives::types::FunctionArgs::from(args.to_string().into_bytes()),
        },
    }
}

pub(crate) async fn get_indexer_config_id(
    block_height: u64,
    account_id: AccountId,
    method_name: &str,
    args: Value,
) -> Result<String> {
    // Create the function call request
    let request = get_function_call_request(block_height, account_id, method_name, args);

    // Create a JSON RPC client
    let client = JsonRpcClient::connect("https://rpc.mainnet.near.org");

    // Send the request and wait for the response
    let response = client.call(request).await?;

    let json_string = serde_json::to_string(&response)?;
    let parsed: Value = serde_json::from_str(&json_string)?;

    let indexer_config_id = parsed["indexer_config_id"].as_str()
        .ok_or(anyhow::Error::msg("indexer_config_id not found or not a string"))?;

    return Ok(indexer_config_id.to_string());

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
