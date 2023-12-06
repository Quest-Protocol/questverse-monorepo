use std::env;
use std::error::Error;
use std::str::FromStr;
use near_crypto::{InMemorySigner, SecretKey, Signature, Signer};
use near_primitives::types::AccountId;

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
    use std::env;
    use near_crypto::{KeyType, SecretKey};

    const MOCK_PAYLOAD: &[u8; 12] = b"test payload";
    // const DEFAULT_ACCOUNT_ID: &str = "v1.questverse.near";

    fn set_env_vars(secret_key: &str, account_id: Option<&str>) {
        env::set_var("SECRET_KEY", secret_key);

        if let Some(acct_id) = account_id {
            env::set_var("ACCOUNT_ID", acct_id);
        } else {
            env::remove_var("ACCOUNT_ID");
        }
    }

    fn remove_env_vars() {
        env::remove_var("SECRET_KEY");
        env::remove_var("ACCOUNT_ID");
    }

    /// `generate_valid_secret_key` generates a random secret key
    fn generate_valid_secret_key() -> String {
        let secret_key = SecretKey::from_random(KeyType::ED25519);

        secret_key.to_string()
    }

    #[test]
    fn test_sign_claim_with_valid_keys() {
        let valid_secret_key = generate_valid_secret_key();
        set_env_vars(&valid_secret_key, Some("valid_account_id"));

        let result = sign_claim(MOCK_PAYLOAD);
        remove_env_vars();

        assert!(result.is_ok(), "sign_claim should succeed with valid input");
    }

    #[test]
    fn test_sign_claim_with_invalid_secret_key() {
        set_env_vars("invalid_secret_key", Some("valid_account_id"));

        let result = sign_claim(MOCK_PAYLOAD);
        remove_env_vars();

        assert!(result.is_err(), "sign_claim should fail with invalid secret key");
    }

    #[test]
    fn test_sign_claim_with_default_account_id() {
        let valid_secret_key = generate_valid_secret_key();
        set_env_vars(&valid_secret_key, None);

        let result = sign_claim(MOCK_PAYLOAD);
        remove_env_vars();

        assert!(result.is_ok(), "sign_claim should succeed with default account ID");
    }
}