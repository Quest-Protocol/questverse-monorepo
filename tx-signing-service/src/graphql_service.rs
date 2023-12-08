use std::env;
use crate::{QuestConditionQuery, QuestState, QuestStateError, QuestValidationInfo, QuestValidationRequest};
use reqwest::{Client, header::HeaderMap};
use reqwest::header::{HeaderValue};
use serde_json::{json, Value};
use crate::internal::sign_claim;
use dotenv::dotenv;

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
    dotenv().ok();

    let query_api_url = env::var("QUERY_API").expect("QUERY_API not found in .env file");
    let header_role = env::var("HEADER_ROLE").expect("HEADER_ROLE not found in .env file");

    let client = Client::new();
    let mut headers = HeaderMap::new();
    headers.insert("x-hasura-role", HeaderValue::from_str(&header_role)?);

    let res = client
        .post(&query_api_url)
        .headers(headers)
        .json(&json!({ "query": query }))
        .send()
        .await?;

    res.json::<Value>().await
        .map_err(|e| QuestStateError::ReqwestError(e.into()))
}


/// given an indexer_config_id, `check_quest` queries the graphql client to check a quest's condition
pub(crate) async fn check_quest(validation_request: &QuestValidationRequest) -> Result<QuestState, QuestStateError> {
    let indexer_config_id = &validation_request.indexer_config_id;
    let account_id = &validation_request.account_id;
    let quest_id = &validation_request.quest_id;

    let table_name = build_table_name(indexer_config_id);
    let query = build_query(&table_name, account_id);

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
            let payload= serde_json::to_string(
                &QuestValidationInfo {
                    account_id: account_id.clone(),
                    quest_id: quest_id.clone(),
                }
            )
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
    use std::path::Path;
    use super::*;
    use tokio::test as tokio_test;

    const GREEN_TABLE: (&str, &str) = ("roshaan.near/quest_dao_join_quest", "roshaan_near_quest_dao_join_quest_quest_tracker");
    const MOCK_TABLE: &str = GREEN_TABLE.1;

    fn setup() {
        let dotenv_path = Path::new(".env.test");
        dotenv::from_path(dotenv_path).ok();
    }

    fn mock_invalid_info() -> QuestValidationInfo {
        QuestValidationInfo {
            account_id: "erika.near".to_string(),
            quest_id: "47747".to_string(),
        }
    }

    fn mock_valid_info() ->  [(QuestValidationInfo, bool); 2] {
        let mock_completed_quest_info: QuestValidationInfo = QuestValidationInfo {
            account_id: String::from("roshaan.near"),
            quest_id: "23233".to_string(),
        };
        let mock_incomplete_quest_info: QuestValidationInfo = QuestValidationInfo {
            account_id: "matt.near".to_string(),
            quest_id: "47334".to_string(),
        };

        [
            (mock_incomplete_quest_info, false),
            (mock_completed_quest_info, true),
        ]
    }

    #[test]
    fn test_build_table() {
        assert_eq!(build_table_name(GREEN_TABLE.0), GREEN_TABLE.1);
    }

    #[tokio_test]
    async fn test_fetch_response_valid_query() {
        dotenv().ok();

        let valid_info = &mock_valid_info()[0].0;

        let query = build_query(MOCK_TABLE, &valid_info.account_id);
        let result = fetch_response(query).await;

        assert!(result.is_ok());
    }

    #[tokio_test]
    async fn test_empty_quest_err() {
        let empty_info = mock_invalid_info();
        let validation_request = QuestValidationRequest {
            account_id: empty_info.account_id,
            quest_id: empty_info.quest_id,
            indexer_config_id: GREEN_TABLE.0.parse().unwrap(),
        };

        let result = check_quest(&validation_request).await;

        assert!(result.is_err());

        match result {
            Err(QuestStateError::QueryNotFound) => {},
            _ => panic!("Quest should err as it is empty")
        }

    }


    #[tokio_test]
    async fn test_check_quest() {
        setup();

        let mock_infos = mock_valid_info();

        for (info, completed_status) in mock_infos {
            let validation_request = QuestValidationRequest {
                account_id: info.account_id,
                quest_id: info.quest_id,
                indexer_config_id: GREEN_TABLE.0.parse().unwrap(),
            };
            let result = check_quest(&validation_request).await;

            assert!(result.is_ok(), "Error checking quest: {:?}", result.err());

            match result.unwrap() {
                QuestState::Completed(_, _) if completed_status => {}, // If completed_status is true, expect Completed
                QuestState::NotCompleted(_, _) if !completed_status => {}, // If completed_status is false, expect NotCompleted
                _ => panic!("Quest state does not match expected completed status"),
            }
        }
    }
}