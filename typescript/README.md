# Extended TypeScript examples

Update `./src/config.ts` file with your data:
```typescript
export const config = {
  // Replace with `api.starknet.sepolia.extended.exchange` for TESTNET
  host: 'api.starknet.extended.exchange',
  apiKey: '{YOUR_API_KEY}',
  starkPrivateKey: '0x{YOUR_STARK_PRIVATE_KEY}',
  vaultId: '{YOUR_VAULT_ID}',
} as const
```

You can get it from:
- [TESTNET API Management page](https://starknet.sepolia.extended.exchange/api-management)
- [MAINNET API Management page](https://app.extended.exchange/api-management)

Install project dependencies with `npm install`.

Run an example, e.g. `npm run example:01-create-limit-order`.

> [!WARNING]
> DON'T FORGET TO CANCEL YOUR POSITIONS/ORDERS IF YOU ARE USING MAINNET!
