[keymaster-connect](../index.md) / readConnectionRecovery

# Function: readConnectionRecovery()

> **readConnectionRecovery**(`init?`): [`ConnectionRecoverySummary`](../interfaces/ConnectionRecoverySummary.md) \| `null`

读取恢复摘要供应用在创建 client 前展示，不向 UI 暴露凭据。
提供 targetOrigin/mode 时只在完全相符时返回，否则返回 null。

## Parameters

### init?

[`ReadRecoveryInit`](../interfaces/ReadRecoveryInit.md)

## Returns

[`ConnectionRecoverySummary`](../interfaces/ConnectionRecoverySummary.md) \| `null`
