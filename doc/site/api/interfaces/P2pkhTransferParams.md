[keymaster-connect](../index.md) / P2pkhTransferParams

# Interface: P2pkhTransferParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`channelId`](#channelid) | `string` | Yes | 先注册取得的完整渠道编号；不允许宿主代填或省略。 |
| [`recipientAddress`](#recipientaddress) | `string` | Yes | 主网或 testnet P2PKH 地址（base58check，version 0x00 / 0x6f）。 |
| [`amountSatoshis`](#amountsatoshis) | `number` | Yes | 正整数 satoshis。 |
| [`feeRateSatoshisPerKb?`](#feeratesatoshisperkb) | `number` | No | 可选 fee rate（sat/kB）。 |

## Properties

### channelId

> **channelId**: `string`

先注册取得的完整渠道编号；不允许宿主代填或省略。

***

### recipientAddress

> **recipientAddress**: `string`

主网或 testnet P2PKH 地址（base58check，version 0x00 / 0x6f）。

***

### amountSatoshis

> **amountSatoshis**: `number`

正整数 satoshis。

***

### feeRateSatoshisPerKb?

> `optional` **feeRateSatoshisPerKb?**: `number`

可选 fee rate（sat/kB）。>= 1。
