use malachite::num::basic::traits::Zero;

use malachite::integer::Integer;

const OP_LIMIT_ORDER_WITH_FEES: u64 = 3;

pub fn get_limit_order_msg(
    asset_id_synthetic: &Integer,
    asset_id_collateral: &Integer,
    is_buying_synthetic: bool,
    asset_id_fee: &Integer,
    amount_synthetic: &Integer,
    amount_collateral: &Integer,
    max_amount_fee: &Integer,
    nonce: u64,
    position_id: u64,
    expiration_timestamp: u64,
    hash_function: fn(&Integer, &Integer) -> Integer,
) -> Integer {
    let (asset_id_sell, asset_id_buy, amount_sell, amount_buy, nonce) = if is_buying_synthetic {
        (
            asset_id_collateral,
            asset_id_synthetic,
            amount_collateral,
            amount_synthetic,
            Integer::from(nonce),
        )
    } else {
        (
            asset_id_synthetic,
            asset_id_collateral,
            amount_synthetic,
            amount_collateral,
            Integer::from(nonce),
        )
    };

    let a = hash_function(asset_id_sell, asset_id_buy);
    let b = hash_function(&a, asset_id_fee);

    let mut w4_packed = amount_sell.clone();
    w4_packed = (w4_packed << (64)) + amount_buy;
    w4_packed = (w4_packed << (64)) + max_amount_fee;
    w4_packed = (w4_packed << (32)) + &nonce;

    let c = hash_function(&b, &w4_packed);

    let mut w5_packed: Integer = (Integer::ZERO << (10)) + Integer::from(OP_LIMIT_ORDER_WITH_FEES);

    w5_packed = (w5_packed << (64)) + Integer::from(position_id);
    w5_packed = (w5_packed << (64)) + Integer::from(position_id);
    w5_packed = (w5_packed << (64)) + Integer::from(position_id);
    w5_packed = (w5_packed << (32)) + Integer::from(expiration_timestamp);
    w5_packed = w5_packed << (17);

    hash_function(&c, &w5_packed)
}