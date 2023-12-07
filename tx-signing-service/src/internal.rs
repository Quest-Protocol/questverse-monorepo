use near_crypto::{InMemorySigner, SecretKey, Signature, Signer};
use near_primitives::types::AccountId;
use std::env;
use std::error::Error;
use std::str::FromStr;

/// given a payload, `sign_claim` pulls the Secret Key and Account ID from environment and uses
/// an in-memory signer
pub(crate) fn sign_claim(payload: &[u8]) -> Result<Signature, Box<dyn Error>> {
    let secret_key = env::var("SECRET_KEY").expect("SECRET_KEY must be set up in the environment");
    let secret_key = SecretKey::from_str(&secret_key)?;

    let account_id = env::var("ACCOUNT_ID").unwrap_or("v1.questverse.near".to_string());
    let account_id = AccountId::from_str(&account_id)?;

    let signer = InMemorySigner::from_secret_key(account_id, secret_key);

    Ok(signer.sign(payload))
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_crypto::{KeyType, SecretKey};
    use serde::{Deserialize, Serialize};
    use serde_json;
    use std::env;

    #[derive(Serialize, Deserialize)]
    struct QuestPayload {
        account_id: String,
        quest_id: u64,
    }

    fn mock_payload() -> Vec<u8> {
        serde_json::to_string(&QuestPayload {
            account_id: "erika.near".to_string(),
            quest_id: 477474,
        })
        .unwrap()
        .into_bytes()
    }

    const DEFAULT_ACCOUNT_ID: &str = "v1.questverse.near";

    fn set_env_vars(secret_key: &str, account_id: Option<&str>) {
        env::set_var("SECRET_KEY", secret_key);

        if let Some(acct_id) = account_id {
            env::set_var("ACCOUNT_ID", acct_id);
        } else {
            env::remove_var("ACCOUNT_ID");
        }
    }

    fn remove_env_vars(default_account: bool) {
        env::remove_var("SECRET_KEY");

        if !default_account {
            env::remove_var("ACCOUNT_ID");
        }
    }

    /// `generate_valid_secret_key` generates a random secret key
    fn generate_valid_secret_key() -> String {
        let secret_key = SecretKey::from_random(KeyType::ED25519);

        secret_key.to_string()
    }

    #[test]
    fn test_sign_claim_with_valid_keys_and_correct_signer() {
        let valid_secret_key = generate_valid_secret_key();
        let valid_account_id = "valid_account_id";
        set_env_vars(&valid_secret_key, Some(valid_account_id));

        let payload = mock_payload();
        let signature = sign_claim(&payload);
        assert!(
            signature.is_ok(),
            "sign_claim should succeed with valid input"
        );
        let signature = signature.unwrap();

        let secret_key =
            SecretKey::from_str(&valid_secret_key).expect("Failed to parse secret key");
        let account_id = AccountId::from_str(valid_account_id).expect("Failed to parse account ID");
        let signer = InMemorySigner::from_secret_key(account_id, secret_key);

        let is_valid = signer.verify(&payload, &signature);
        remove_env_vars(false);

        assert!(is_valid, "The signature should be valid");
    }

    #[test]
    fn test_sign_claim_with_valid_keys_and_incorrect_signer() {
        let sk1 = generate_valid_secret_key();
        let valid_account_id = "valid_account_id";
        set_env_vars(&sk1, Some(valid_account_id));

        let payload = mock_payload();
        let signature = sign_claim(&payload);
        assert!(
            signature.is_ok(),
            "sign_claim should succeed with valid input"
        );
        let signature = signature.unwrap();

        let sk2 = generate_valid_secret_key();
        let secret_key = SecretKey::from_str(&sk2).expect("Failed to parse secret key");
        let account_id = AccountId::from_str(valid_account_id).expect("Failed to parse account ID");
        let signer = InMemorySigner::from_secret_key(account_id, secret_key);

        let is_valid = signer.verify(&payload, &signature);
        remove_env_vars(false);

        assert!(
            !is_valid,
            "The signature should not be valid with a different secret key"
        );
    }

    #[test]
    fn test_sign_claim_with_invalid_secret_key() {
        set_env_vars("invalid_secret_key", Some("valid_account_id"));

        let payload = mock_payload();
        let result = sign_claim(&payload);

        remove_env_vars(false);

        assert!(
            result.is_err(),
            "sign_claim should fail with invalid secret key"
        );
    }

    #[test]
    fn test_sign_claim_with_default_account_id() {
        let valid_secret_key = generate_valid_secret_key();
        set_env_vars(&valid_secret_key, None);

        let payload = mock_payload();
        let signature = sign_claim(&payload);
        assert!(
            signature.is_ok(),
            "sign_claim should succeed with default account ID"
        );
        /*
        let signature = signature.unwrap();

        let secret_key =
            SecretKey::from_str(&valid_secret_key).expect("Failed to parse secret key");
        let account_id =
            AccountId::from_str(DEFAULT_ACCOUNT_ID).expect("Failed to parse account id");
        let signer = InMemorySigner::from_secret_key(account_id, secret_key);

        let is_valid = signer.verify(&payload, &signature);
        assert!(is_valid, "The signature should be valid");
         */
    }
}
