[@keymaster/connect](../index.md) / P2pkhTransferParams

# Interface: P2pkhTransferParams

`p2pkh.transfer` 请求参数。

设计缘由（施工单 002 硬切换 + 施工单 2026-06-28 002 硬切换 +
施工单 2026-09-18 001 多资产硬切换）：
  - 本次只支持 `bsv` 主网 / testnet P2PKH 转账。不引入多币种资产、
    多网络协商之外的链类型。
  - site 不允许传 `text` / `confirmMessage`：确认文案由 Keymaster 自己
    按方法语义生成；不允许 site 伪装转账为登录确认。
  - `aud` 不接受：connect popup 已天然拿到 `event.origin` 真值，origin
    等价检查由 service 自动执行。
  - `feeRateSatoshisPerKb` 可选；缺省时由 service 走一个保守默认值。
  - amountSatoshis 是整数 satoshis，不接受小数；feeSatoshis 在 result 里
    回。
  - `assetId` 可选；缺省 `bsv-mainnet`。`bsv-testnet` 需要 Keymaster
    当前身份属于测试网。
  - `walletPublicKeyHex` 是**强制**输入字段（施工单 2026-06-28 002 硬切换）：
    资金 owner 取自 session 绑定 owner，**不**读取全局 active key。
    旧 session 失效时直接 fail-fast，不再静默 fallback 到 active key。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`channelId`](#channelid) | `string` | Yes | 先注册取得的完整渠道编号；不允许宿主代填或省略。 |
| [`recipientAddress`](#recipientaddress) | `string` | Yes | 主网或 testnet P2PKH 地址（base58check，version 0x00 / 0x6f）。 |
| [`amountSatoshis`](#amountsatoshis) | `number` | Yes | 正整数 satoshis。 |
| [`feeRateSatoshisPerKb?`](#feeratesatoshisperkb) | `number` | No | 可选 fee rate（sat/kB）。 |
| [`assetId?`](#assetid) | [`P2pkhTransferAssetId`](../type-aliases/P2pkhTransferAssetId.md) | No | 可选资产；缺省当前 NetworkIdentity 的网络资产。 |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | 由 `connect.login` 返回的钱包公钥。 |

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

***

### assetId?

> `optional` **assetId?**: [`P2pkhTransferAssetId`](../type-aliases/P2pkhTransferAssetId.md)

可选资产；缺省当前 NetworkIdentity 的网络资产。跨网络请求被拒绝。

***

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

由 `connect.login` 返回的钱包公钥。**必填**。
service 通过公钥与来源 找到绑定 key，不允许 fallback 到 active key。
