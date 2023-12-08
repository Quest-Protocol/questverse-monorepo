//use near_crypto::{InMemorySigner, SecretKey, Signature, Signer};
//use near_primitives::types::AccountId;

use base64::engine::general_purpose::STANDARD_NO_PAD as BASE64_ENGINE;
use base64::Engine;
use ed25519_dalek::{Keypair, PublicKey, SecretKey, Signature, Signer};
use std::env;
use std::error::Error;
use std::str::FromStr;

/// given a payload, `sign_claim` pulls the Secret Key and Account ID from environment and uses
/// an in-memory signer
pub(crate) fn sign_claim(payload: &[u8]) -> Result<Signature, Box<dyn Error>> {
    let payload_str =
        String::from_utf8(payload.to_vec()).unwrap_or_else(|_| "<Invalid UTF-8>".to_string());
    println!("Payload: {}", payload_str);
    // Payload: {"account_id":"erika.near","quest_id":"477474"}

    println!("Payload (Base64): {}", BASE64_ENGINE.encode(payload));
    // Payload (Base64): eyJhY2NvdW50X2lkIjoiZXJpa2EubmVhciIsInF1ZXN0X2lkIjoiNDc3NDc0In0

    let secret_key = env::var("SECRET_KEY")?;
    let secret_key_bytes = BASE64_ENGINE.decode(secret_key.as_bytes())?;

    let ed25519_secret_key = SecretKey::from_bytes(&secret_key_bytes[..32])?;
    let public_key = PublicKey::from(&ed25519_secret_key);

    let keypair = Keypair {
        secret: ed25519_secret_key,
        public: public_key,
    };

    println!(
        "Secret Key: {}",
        BASE64_ENGINE.encode(keypair.secret.to_bytes())
    );
    println!(
        "Public Key: {}",
        BASE64_ENGINE.encode(keypair.public.to_bytes())
    );

    /*
    Secret Key: 3gRVHC4Zzf8YdBUnvg3j3FTA163W4vbbR94rJ4oFW90
    Public Key: 7lFxe6c0JlTveOEnULoV+L6gtGKXE1seN3usT21jrZM
     */

    let signature = keypair.sign(payload);
    println!("Signature: {}", BASE64_ENGINE.encode(signature.to_bytes()));
    // Signature: aThQoO3GYfuB2/pXDqx4ABP/kt6tj02ceM7rlCIQndo8H/c0ccXRNj5G4VuNuy9FgZrWilkxhNlu1LF7bJbaBw


    Ok(signature)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::QuestValidationInfo;
    use ed25519_dalek::Verifier;
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
    fn verify_with_ed25519() {
        setup();

        let payload = mock_payload();
        let signature = sign_claim(&payload).unwrap();

        let expected_public_key = env::var("PUBLIC_KEY").expect("PUBLIC_KEY not found");

        let public_key_bytes = BASE64_ENGINE
            .decode(expected_public_key.as_bytes())
            .expect("Failed to decode PUBLIC_KEY from base64");
        let public_key = PublicKey::from_bytes(&public_key_bytes).expect("Invalid public key");

        assert!(
            public_key.verify(&payload, &signature).is_ok(),
            "Signature verification failed"
        );
    }

    /*

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

    */
}
