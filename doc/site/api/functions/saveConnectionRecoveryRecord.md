[keymaster-connect](../index.md) / saveConnectionRecoveryRecord

# Function: saveConnectionRecoveryRecord()

> **saveConnectionRecoveryRecord**(`storage`, `record`): `void`

保存最近一次成功连接的恢复记录；写入失败时抛错，由调用方决定提示。

## Parameters

### storage

[`ConnectionRecoveryStorage`](../interfaces/ConnectionRecoveryStorage.md) \| `null`

### record

[`ConnectionRecoveryRecord`](../interfaces/ConnectionRecoveryRecord.md)

## Returns

`void`
