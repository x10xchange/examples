use starknet_crypto::Felt;
use rust_crypto_lib_base::StarkSignature;

fn main() {
    let ss = StarkSignature {
        r: Felt::from_dec_str("0").unwrap(),
        s: Felt::from_dec_str("1").unwrap(),
        v: Felt::from_dec_str("2").unwrap(),
    };

    println!("ss.r={}", ss.s.to_string());
}
