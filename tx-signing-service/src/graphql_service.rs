use std::error::Error;
use near_crypto::Signature;
use crate::{QuestValidationInfo};
use reqwest::{Client, Error as ReqwestError, header::HeaderMap};
use reqwest::header::HeaderValue;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use thiserror::Error;
use crate::internal::sign_claim;

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
}

fn build_table_name(indexer_config_id: &str) -> String {
    indexer_config_id.replace(".", "_").replace("/", "_") + "_quest_tracker"
}

fn build_query(table_name: &str, account_id: &str) -> String {
    format!(
        r#"query {{
            {}(where: {{account_id: {{_eq: "{}"}}}}) {{
                account_id
                block_height
                is_completed
            }}
        }}"#,
        table_name, account_id
    )
}

async fn fetch_response(query: String) -> Result<Value, QuestStateError> {
    let client = Client::new();
    let mut headers = HeaderMap::new();
    headers.insert("x-hasura-role", HeaderValue::from_static("roshaan_near"));

    let res = client
        .post("https://near-queryapi.api.pagoda.co/v1/graphql")
        .headers(headers)
        .json(&json!({ "query": query }))
        .send()
        .await?;

    res.json::<Value>().await
        .map_err(|e| QuestStateError::ReqwestError(e.into()))
}


/// given an indexer_config_id, `check_quest` queries the graphql client to check a quest's condition
///
pub(crate) async fn check_quest(indexer_config_id: String, info: QuestValidationInfo) -> Result<QuestState, QuestStateError> {
    let table_name = build_table_name(&indexer_config_id);
    let query = build_query(&table_name, &info.account_id);

    let response_body = fetch_response(query).await?;

    let quest_state_result: Result<Vec<QuestConditionQuery>, _> = serde_json::from_value(
        response_body["data"][&table_name].clone()
    );

    let quest_snapshot = match quest_state_result {
        Ok(data) if !data.is_empty() => data.get(0).unwrap().clone(),
        _ => return Err(QuestStateError::QueryNotFound),
    };


    match &quest_snapshot.is_completed {
        true => {
            let payload= serde_json::to_string(&info)
                .unwrap()
                .into_bytes();

            let claim_response = sign_claim(&payload);

            match claim_response {
                Ok(signature) => Ok(QuestState::Completed(
                    "Quest has been completed!".to_string(),
                    signature
                )),
                Err(e) => Err(QuestStateError::ClaimError(e))
            }
        },
        false => {
           Ok(QuestState::NotCompleted(
               "Quest has not been completed".to_string(),
               QuestConditionQuery {
                   account_id: quest_snapshot.account_id.clone(),
                   block_height: quest_snapshot.block_height,
                   is_completed: quest_snapshot.is_completed,
               }
           ))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::test as tokio_test;

    #[test]
    fn test_build_query() {
        let cases = [
            ("roshaan.near/quest_dao_join_quest", "roshaan_near_quest_dao_join_quest_quest_tracker")
        ];

        assert!(cases
            .into_iter()
            .all(|(config_id, table_name)| {
                table_name == build_table_name(config_id)
            }))
    }

    #[tokio_test]
    async fn test_check_quest() {
        let indexer_config = "roshaan.near/quest_dao_join_quest".to_string();
        let info = QuestValidationInfo {
            account_id: "roshaan.near".to_string(),
            quest_id: "23233".to_string(),
        };

        let result = check_quest(indexer_config, info).await;
        assert!(result.is_ok(), "Error checking quest: {:?}", result.err());
    }

}