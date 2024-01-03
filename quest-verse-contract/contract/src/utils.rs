use ed25519_dalek::PUBLIC_KEY_LENGTH;
use near_sdk::base64;

pub fn to_yocto(value: &str) -> u128 {
    let vals: Vec<_> = value.split('.').collect();
    let part1 = vals[0].parse::<u128>().unwrap() * 10u128.pow(24);
    if vals.len() > 1 {
        let power = vals[1].len() as u32;
        let part2 = vals[1].parse::<u128>().unwrap() * 10u128.pow(24 - power);
        part1 + part2
    } else {
        part1
    }
}

pub fn pubkey_from_b64(pubkey: String) -> [u8; PUBLIC_KEY_LENGTH] {
    let pk_bz = base64::decode(pubkey).expect("authority public key is not a valid base64");
    pk_bz
        .try_into()
        .expect("authority public key must be 32 bytes")
}
