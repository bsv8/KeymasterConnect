[keymaster-connect](../index.md) / clearConnectionRecovery

# Function: clearConnectionRecovery()

> **clearConnectionRecovery**(`init?`): `boolean`

主动清除本地恢复记录，只删除本地材料，不代表钱包授权已撤销。
提供 targetOrigin/authorizationId 时仅在完全相符时删除，避免旧实例误删新记录。
返回 true 表示已删除。

## Parameters

### init?

[`ClearRecoveryInit`](../interfaces/ClearRecoveryInit.md)

## Returns

`boolean`
