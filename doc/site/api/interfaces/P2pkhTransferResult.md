[keymaster-connect](../index.md) / P2pkhTransferResult

# Interface: P2pkhTransferResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`assetId`](#assetid) | [`P2pkhTransferAssetId`](../type-aliases/P2pkhTransferAssetId.md) | Yes | 本次实际转账的资产；与 params.assetId 一致（缺省回 `bsv-mainnet`）。 |
| [`txid`](#txid) | `string` | Yes | 已广播交易的 canonical txid。 |
| [`rawTxHex`](#rawtxhex) | `string` | Yes | 已签名交易 raw hex。 |
| [`feeSatoshis`](#feesatoshis) | `number` | Yes | 实际花费的 fee satoshis。 |

## Properties

### assetId

> **assetId**: [`P2pkhTransferAssetId`](../type-aliases/P2pkhTransferAssetId.md)

本次实际转账的资产；与 params.assetId 一致（缺省回 `bsv-mainnet`）。

***

### txid

> **txid**: `string`

已广播交易的 canonical txid。

***

### rawTxHex

> **rawTxHex**: `string`

已签名交易 raw hex。

***

### feeSatoshis

> **feeSatoshis**: `number`

实际花费的 fee satoshis。
