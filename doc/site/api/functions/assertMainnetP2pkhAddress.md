[keymaster-connect](../index.md) / assertMainnetP2pkhAddress

# Function: assertMainnetP2pkhAddress()

> **assertMainnetP2pkhAddress**(`addr`): `void`

校验主网 P2PKH 地址：base58check 解码 → 25 字节 → version 0x00。
testnet（version 0x6f）直接 invalid_request；本次硬切换只支持主网。

不做 checksum 校验：base58 解码长度 + version 足够排除绝大多数误传；
真正的 chain-level 校验由 p2pkhTransferService.prepare 在签名时承担。

## Parameters

### addr

`string`

## Returns

`void`
