use log::info;
use simple_logger::SimpleLogger;


use starknet::core::types::Felt;
use rust_crypto_lib_base::StarkSignature;

mod pkg;
use pkg::{sign_order,starkex_messages};
use std::any::{Any, TypeId};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    SimpleLogger::new().env().init().unwrap();

    let client = reqwest::Client::new();
    let response = client.get("https://api.starknet.extended.exchange/api/v1/info/markets")
        .header("Accept", "application/json")
        .header("User-Agent", "reqwest")
        .send()
        .await?
        .error_for_status()?;

    let my_data = response.text().await?;
    let order_hash = sign_order::sign_order_example();

    let ss = StarkSignature {
        r: Felt::from_dec_str("0").unwrap(),
        s: Felt::from_dec_str("1").unwrap(),
        v: Felt::from_dec_str("2").unwrap(),
    };

    println!("ss.r={}", ss.s.to_string());

    info!("order_hash = {}", order_hash);

    Ok(())
}
