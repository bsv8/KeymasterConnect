[keymaster-connect](../index.md) / ChainTransactionResult

# Type Alias: ChainTransactionResult

> **ChainTransactionResult** = \{ `state`: `"not_observed"` \| `"invalid"`; \} \| \{ `state`: `"unconfirmed"`; `rawTxHex`: `string`; \} \| \{ `state`: `"confirmed"`; `rawTxHex`: `string`; `height`: `number`; `blockHash`: `string`; `index`: `number`; \}
