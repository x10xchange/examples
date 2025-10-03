use log::info;
use simple_logger::SimpleLogger;


use starknet::core::types::Felt;
use rust_crypto_lib_base::StarkSignature;

mod sign_order;
mod starkex_messages;

fn main() {
    SimpleLogger::new().env().init().unwrap();

    let order_hash = sign_order::sign_order_example();

    let ss = StarkSignature {
        r: Felt::from_dec_str("0").unwrap(),
        s: Felt::from_dec_str("1").unwrap(),
        v: Felt::from_dec_str("2").unwrap(),
    };

    println!("ss.r={}", ss.s.to_string());

    info!("order_hash = {}", order_hash);
}
