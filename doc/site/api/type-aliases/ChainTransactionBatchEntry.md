[keymaster-connect](../index.md) / ChainTransactionBatchEntry

# Type Alias: ChainTransactionBatchEntry

> **ChainTransactionBatchEntry** = `object` & \{ `state`: `"not_observed"`; \} \| \{ `state`: `"unconfirmed"`; `rawTxHex?`: `string`; \} \| \{ `state`: `"confirmed"`; `height`: `number`; `blockHash`: `string`; `rawTxHex?`: `string`; \}

## Type Declaration

### txid

> **txid**: `string`
