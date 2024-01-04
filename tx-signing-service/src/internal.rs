use ed25519_dalek::Signature;
use ed25519_dalek::{Keypair, Signer};
use std::env;
use std::error::Error;

use base64::{engine::general_purpose, Engine as _};
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Claim {
    pub account_id: String,
    pub quest_id: u64,
}

pub(crate) fn sign_claim(
    claim: &Claim,
    keypair: Option<Keypair>,
) -> Result<(String, Signature), Box<dyn Error>> {
    let keypair = match keypair {
        Some(kp) => kp,
        None => {
            let secret_key =
                env::var("SECRET_KEY").expect("SECRET_KEY not found in the environment");
            println!("secret_keysigned: {:?}", &secret_key);
            let secret_key_decoded = general_purpose::STANDARD_NO_PAD
                .decode(secret_key)
                .expect("Failed to decode secret key");

            Keypair::from_bytes(&secret_key_decoded).expect("Failed to create keypair from bytes")
        }
    };

    let claim_bytes = claim.try_to_vec().unwrap();
    let sig: Signature = keypair.sign(&claim_bytes);
    let claim_base64 = general_purpose::STANDARD_NO_PAD.encode(claim_bytes.clone());
    Ok((claim_base64, sig))
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::engine::general_purpose;
    use ed25519_dalek::Keypair;
    use ed25519_dalek::Verifier;
    use std::path::Path;

    fn sign_claim_test(claim: &Claim, keypair: Keypair) -> (String, Signature) {
        sign_claim(&claim, Some(keypair)).unwrap()
    }

    fn generate_keypair() -> Keypair {
        Keypair::generate(&mut rand::thread_rng())
    }

    /// copy of verify_claim method from the contract
    pub fn verify_claim(claim_sig: &[u8; 64], claim: &[u8], public_key: &[u8; 32]) -> bool {
        let public_key = ed25519_dalek::PublicKey::from_bytes(public_key).unwrap();
        let sig: &[u8; 64] = claim_sig
            .as_slice()
            .try_into()
            .expect("signature must be 64 bytes");
        match Signature::from_bytes(sig) {
            Ok(sig) => public_key.verify(claim, &sig).is_ok(),
            Err(_) => false,
        }
    }

    #[test]
    fn test_env() {
        let dotenv_path = Path::new(".env.test");
        dotenv::from_path(dotenv_path).ok();
    }

    #[test]
    fn verify_claim_works() {
        let keypair = generate_keypair();
        let public_key = keypair.public.to_bytes();
        let claim = Claim {
            account_id: "alice.near".to_string(),
            quest_id: 1,
        };
        let (claim_base64, sig) = sign_claim_test(&claim, keypair);

        let decoded_claim = general_purpose::STANDARD_NO_PAD
            .decode(claim_base64)
            .unwrap();

        let res = verify_claim(&sig.to_bytes(), &decoded_claim, &public_key);
        assert!(res, "res {}", res);
    }

    #[test]
    fn verify_claim_false_signer() {
        let keypair = generate_keypair();
        let claim = Claim {
            account_id: "alice.near".to_string(),
            quest_id: 1,
        };
        let (claim_base64, sig) = sign_claim_test(&claim, keypair);
        let decoded_claim = general_purpose::STANDARD_NO_PAD
            .decode(claim_base64)
            .unwrap();
        let false_keypair = generate_keypair();
        let res = verify_claim(
            &sig.to_bytes(),
            &decoded_claim,
            &false_keypair.public.to_bytes(),
        );
        assert!(!res, "res {}", res);
    }

    #[test]
    fn verify_claim_false_claim() {
        let keypair = generate_keypair();
        let public_key = keypair.public.to_bytes();
        let claim = Claim {
            account_id: "alice.near".to_string(),
            quest_id: 1,
        };
        let false_claim = Claim {
            account_id: "alice.near".to_string(),
            quest_id: 2,
        };
        let (_, sig) = sign_claim_test(&claim, keypair);
        let false_claim_bytes = false_claim.try_to_vec().unwrap();
        let res = verify_claim(&sig.to_bytes(), &false_claim_bytes, &public_key);
        assert!(!res, "res {}", res);
    }
}
