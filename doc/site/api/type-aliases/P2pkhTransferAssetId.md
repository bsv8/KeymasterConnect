[keymaster-connect](../index.md) / P2pkhTransferAssetId

# Type Alias: P2pkhTransferAssetId

> **P2pkhTransferAssetId** = `"bsv-mainnet"` \| `"bsv-testnet"`

Connect 公开的 P2PKH 资产标识。

设计缘由（施工单 2026-09-18 001 多资产硬切换）：
  - 公开命名固定 `bsv-mainnet` / `bsv-testnet`，不暴露 p2pkh 内部
    的 `bsv` / `bsvtest`；
  - 资产由连接绑定的钱包网络决定，调用方不能选择或覆盖该网络。
