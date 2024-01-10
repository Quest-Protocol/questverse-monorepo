use ed25519_dalek::PUBLIC_KEY_LENGTH;
use near_sdk::base64;

pub fn pubkey_from_b64(pubkey: String) -> [u8; PUBLIC_KEY_LENGTH] {
    let pk_bz = base64::decode(pubkey).expect("authority public key is not a valid base64");
    pk_bz
        .try_into()
        .expect("authority public key must be 32 bytes")
}
