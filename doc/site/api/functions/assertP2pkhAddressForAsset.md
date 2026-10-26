[keymaster-connect](../index.md) / assertP2pkhAddressForAsset

# Function: assertP2pkhAddressForAsset()

> **assertP2pkhAddressForAsset**(`addr`, `assetId`): `void`

按资产校验 P2PKH 地址：mainnet version 0x00，testnet version 0x6f。

不做 checksum 校验：base58 解码长度 + version 足够排除绝大多数误传；
真正的 chain-level 校验由 p2pkhTransferService.prepare 在签名时承担。

## Parameters

### addr

`string`

### assetId

[`P2pkhTransferAssetId`](../type-aliases/P2pkhTransferAssetId.md)

## Returns

`void`
