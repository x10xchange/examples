use crate::starkex_messages::get_limit_order_msg;
use chrono::{DateTime, Duration, FixedOffset};
use log::info;
use malachite::num::conversion::traits::FromStringBase;
use malachite::{strings::ToLowerHexString, Integer};
use rust_decimal::prelude::*;
use rust_decimal_macros::dec;
use starknet_crypto::{pedersen_hash, rfc6979_generate_k, sign};
use starknet::core::types::Felt;
use std::ops::{Add, Div, Mul};

const MILLIS_IN_HOUR: f64 = 60.0 * 60.0 * 1000000.0;

struct Account {
    pub vault: u64,
    pub private_key: String,
    pub public_key: String,
}

struct MarketL2Config {
    type_: String,
    collateral_id: String,
    collateral_resolution: u32,
    synthetic_id: String,
    synthetic_resolution: u32,
}

struct Market {
    name: String,
    asset_name: String,
    asset_precision: u32,
    collateral_asset_name: String,
    collateral_asset_precision: u32,
    l2_config: MarketL2Config,
}

struct Fees {
    market: String,
    maker_fee_rate: Decimal,
    taker_fee_rate: Decimal,
}

#[derive(Debug)]
struct SettlementSignature {
    r: String,
    s: String,
}

#[derive(Debug)]
struct Settlement {
    signature: SettlementSignature,
    stark_key: String,
    collateral_position: u64,
}

#[derive(PartialEq, Eq)]
enum OrderSide {
    BUY,
}

fn utc_now() -> DateTime<FixedOffset> {
    DateTime::parse_from_rfc3339("2024-01-05T01:08:56.860694Z").unwrap()
}

fn wrapped_pedersen(left: &Integer, right: &Integer) -> Integer {
    let hashed_value = pedersen_hash(
        &Felt::from_hex(&left.to_lower_hex_string()).unwrap(),
        &Felt::from_hex(&right.to_lower_hex_string()).unwrap(),
    );

    Integer::from_string_base(16, &hashed_value.to_lower_hex_string()).unwrap()
}

/// Example of signing a StarkEx order
/// Based on the [Python SDK buy order test](https://github.com/x10xchange/python_sdk/blob/main/tests/perpetual/test_order_object.py#L86-L118)
pub fn sign_order_example() -> Integer {
    let account = Account {
        vault: 10002,
        private_key: "0x7a7ff6fd3cab02ccdcd4a572563f5976f8976899b03a39773795a3c486d4986"
            .to_string(),
        public_key: "0x61c5e7e8339b7d56f197f54ea91b776776690e3232313de0f2ecbd0ef76f466".to_string(),
    };
    let btc_usd_market = Market {
        name: "BTC-USD".to_string(),
        asset_name: "BTC".to_string(),
        asset_precision: 5,
        collateral_asset_name: "USD".to_string(),
        collateral_asset_precision: 6,
        l2_config: MarketL2Config {
            type_: "STARKEX".to_string(),
            collateral_id: "0x31857064564ed0ff978e687456963cba09c2c6985d8f9300a1de4962fafa054"
                .to_string(),
            collateral_resolution: 1000000,
            synthetic_id: "0x4254432d3600000000000000000000".to_string(),
            synthetic_resolution: 1000000,
        },
    };
    let synthetic_amount = dec!(0.00100000);
    let price = dec!(43445.11680000);
    let side = OrderSide::BUY;
    let utc_now = utc_now();
    let expire_time = utc_now.add(
        // order expiration
        Duration::days(14),
    );
    let fees = Fees {
        market: "BTC-USD".to_string(),
        maker_fee_rate: dec!(2).div(dec!(10000)),
        taker_fee_rate: dec!(5).div(dec!(10000)),
    };

    let nonce = 1473459052;
    let fee_rounding_strategy = RoundingStrategy::AwayFromZero;
    let amount_rounding_strategy = if side == OrderSide::BUY {
        RoundingStrategy::AwayFromZero
    } else {
        RoundingStrategy::ToZero
    };
    let collateral_amount = synthetic_amount.mul(price);
    let fee_amount = fees.taker_fee_rate.mul(collateral_amount);

    info!("synthetic_amount = {}", synthetic_amount);
    info!("collateral_amount = {}", collateral_amount);
    info!("taker_fee_rate = {}", fees.taker_fee_rate);
    info!("fee_amount = {}", fee_amount);

    let stark_synthetic_amount = synthetic_amount
        .mul(Decimal::from(btc_usd_market.l2_config.synthetic_resolution))
        .round_dp_with_strategy(0, amount_rounding_strategy)
        .to_i32()
        .unwrap();
    let stark_collateral_amount = collateral_amount
        .mul(Decimal::from(
            btc_usd_market.l2_config.collateral_resolution,
        ))
        .round_dp_with_strategy(0, amount_rounding_strategy)
        .to_i32()
        .unwrap();
    let stark_max_fee_amount = fee_amount
        .mul(Decimal::from(
            btc_usd_market.l2_config.collateral_resolution,
        ))
        .round_dp_with_strategy(0, fee_rounding_strategy)
        .to_i32()
        .unwrap();

    let expire_time_with_settlement_buffer = expire_time.add(
        // starkex settlement expiration
        Duration::days(14),
    );
    let expire_time_with_settlement_buffer_as_hours = (expire_time_with_settlement_buffer
        .timestamp_micros()
        .to_f64()
        .unwrap()
        / MILLIS_IN_HOUR)
        .ceil()
        .to_u64()
        .unwrap();

    let synthetic_id_as_int = Integer::from_string_base(
        16,
        btc_usd_market
            .l2_config
            .synthetic_id
            .trim_start_matches("0x"),
    )
        .unwrap();
    let collateral_id_as_int = Integer::from_string_base(
        16,
        btc_usd_market
            .l2_config
            .collateral_id
            .trim_start_matches("0x"),
    )
        .unwrap();
    let order_hash = get_limit_order_msg(
        &synthetic_id_as_int,
        &collateral_id_as_int,
        side == OrderSide::BUY,
        &collateral_id_as_int,
        &Integer::from(stark_synthetic_amount),
        &Integer::from(stark_collateral_amount),
        &Integer::from(stark_max_fee_amount),
        nonce,
        account.vault,
        expire_time_with_settlement_buffer_as_hours,
        wrapped_pedersen,
    );
    let account_private_key_as_felt = Felt::from_hex(&account.private_key).unwrap();
    let order_hash_as_felt = Felt::from_hex(&order_hash.to_lower_hex_string()).unwrap();
    let rfc6979_k = rfc6979_generate_k(&order_hash_as_felt, &account_private_key_as_felt, None);
    let order_signature = sign(
        &account_private_key_as_felt,
        &order_hash_as_felt,
        &rfc6979_k,
    )
        .unwrap();

    let mut signature_r_hex = order_signature.r.to_lower_hex_string();
    signature_r_hex.insert_str(0, "0x");
    let mut signature_s_hex = order_signature.s.to_lower_hex_string();
    signature_s_hex.insert_str(0, "0x");

    let order_settlement = Settlement {
        signature: SettlementSignature {
            r: signature_r_hex,
            s: signature_s_hex,
        },
        stark_key: account.public_key.clone(),
        collateral_position: account.vault,
    };

    info!("stark_synthetic_amount = {}", stark_synthetic_amount);
    info!("stark_collateral_amount = {}", stark_collateral_amount);
    info!("stark_max_fee_amount = {}", stark_max_fee_amount);
    info!("expire_time_millis = {}", expire_time.timestamp_millis());
    info!(
        "expire_time_with_settlement_buffer_as_hours = {}",
        expire_time_with_settlement_buffer_as_hours
    );
    info!("order_hash = {}", order_hash);
    info!("order_settlement = {:?}", order_settlement);

    order_hash
}

#[test]
fn test_sign_order_example() {
    let order_hash = sign_order_example();
    assert_eq!(
        order_hash,
        Integer::from_string_base(
            10,
            "1166889461421716582054747865777410838520755143669870072976787470981175645302"
        )
            .unwrap()
    )
}
