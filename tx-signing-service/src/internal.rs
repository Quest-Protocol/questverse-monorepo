use near_crypto::{InMemorySigner, SecretKey, Signature, Signer};
use near_primitives::types::AccountId;
use std::env;
use std::error::Error;
use std::str::FromStr;
use tracing::{error, info};

/// given a payload, `sign_claim` pulls the Secret Key and Account ID from environment and uses
/// an in-memory signer
pub(crate) fn sign_claim(payload: &[u8]) -> Result<Signature, Box<dyn Error>> {
    info!("Signing claim");

    let secret_key = match env::var("SECRET_KEY") {
        Ok(key) => key,
        Err(_) => {
            error!("SECRET_KEY environment variable not found");
            return Err("SECRET_KEY not found".into());
        }
    };

    let secret_key = match SecretKey::from_str(&secret_key) {
        Ok(key) => key,
        Err(e) => {
            error!("Failed to parse SECRET_KEY: {}", e);
            return Err(e.into());
        }
    };

    let account_id = env::var("ACCOUNT_ID").unwrap_or("v1.questverse.near".to_string());
    let account_id = AccountId::from_str(&account_id)?;

    let signer = InMemorySigner::from_secret_key(account_id, secret_key);

    Ok(signer.sign(&payload))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::QuestValidationInfo;
    use near_crypto::{KeyType, SecretKey};
    use serde_json;
    use std::path::Path;

    fn setup() {
        let dotenv_path = Path::new(".env.test");
        dotenv::from_path(dotenv_path).ok();
    }

    fn mock_payload() -> Vec<u8> {
        serde_json::to_string(&QuestValidationInfo {
            account_id: "erika.near".to_string(),
            quest_id: 477474.to_string(),
        })
        .unwrap()
        .into_bytes()
    }

    const DEFAULT_ACCOUNT_ID: &str = "v1.questverse.near";

    /// `generate_valid_secret_key` generates a random secret key
    fn generate_valid_secret_key() -> String {
        let secret_key = SecretKey::from_random(KeyType::ED25519);
        secret_key.to_string()
    }

    #[test]
    fn test_sign_claim_with_valid_keys_and_correct_signer() {
        setup();

        let valid_secret_key = env::var("SECRET_KEY").expect("SECRET_KEY not found");
        let valid_account_id = env::var("ACCOUNT_ID").expect("ACCOUNT_ID not found");

        let payload = mock_payload();
        let signature = sign_claim(&payload);
        assert!(
            signature.is_ok(),
            "sign_claim should succeed with valid input"
        );

        let signature = signature.unwrap();

        let secret_key =
            SecretKey::from_str(&valid_secret_key).expect("Failed to parse secret key");
        let account_id =
            AccountId::from_str(&valid_account_id).expect("Failed to parse account ID");
        let signer = InMemorySigner::from_secret_key(account_id, secret_key);

        let is_valid = signer.verify(&payload, &signature);

        assert!(is_valid, "The signature should be valid");
    }

    #[test]
    fn test_sign_claim_with_valid_keys_and_incorrect_signer() {
        setup();

        let valid_account_id = env::var("ACCOUNT_ID").expect("ACCOUNT_ID not found");

        let payload = mock_payload();
        let signature = sign_claim(&payload);
        assert!(
            signature.is_ok(),
            "sign_claim should succeed with valid input"
        );

        let payload = mock_payload();
        let signature = sign_claim(&payload);
        assert!(
            signature.is_ok(),
            "sign_claim should succeed with valid input"
        );
        let signature = signature.unwrap();

        let sk2 = generate_valid_secret_key();
        let secret_key = SecretKey::from_str(&sk2).expect("Failed to parse secret key");
        let account_id =
            AccountId::from_str(&valid_account_id).expect("Failed to parse account ID");
        let signer = InMemorySigner::from_secret_key(account_id, secret_key);

        let is_valid = signer.verify(&payload, &signature);

        assert!(
            !is_valid,
            "The signature should not be valid with a different secret key"
        );
    }

    #[test]
    fn test_sign_claim_with_default_account_id() {
        setup();

        let valid_secret_key = env::var("SECRET_KEY").expect("SECRET_KEY not found");

        let payload = mock_payload();
        let signature = sign_claim(&payload);
        assert!(
            signature.is_ok(),
            "sign_claim should succeed with default account ID"
        );

        let signature = signature.unwrap();

        let secret_key =
            SecretKey::from_str(&valid_secret_key).expect("Failed to parse secret key");
        let account_id =
            AccountId::from_str(DEFAULT_ACCOUNT_ID).expect("Failed to parse account id");
        let signer = InMemorySigner::from_secret_key(account_id, secret_key);

        let is_valid = signer.verify(&payload, &signature);

        assert!(is_valid, "The signature should be valid");
    }
}
