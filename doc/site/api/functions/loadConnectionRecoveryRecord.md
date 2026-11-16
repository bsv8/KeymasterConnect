[keymaster-connect](../index.md) / loadConnectionRecoveryRecord

# Function: loadConnectionRecoveryRecord()

> **loadConnectionRecoveryRecord**(`init`): [`ConnectionRecoveryRecord`](../interfaces/ConnectionRecoveryRecord.md) \| `null`

供 client.resume() 内部装载完整凭据；不直接设置为已登录。

## Parameters

### init

#### recoveryStorage?

[`ConnectionRecoveryStorage`](../interfaces/ConnectionRecoveryStorage.md)

#### targetOrigin

`string`

#### mode

[`KeymasterConnectMode`](../type-aliases/KeymasterConnectMode.md)

## Returns

[`ConnectionRecoveryRecord`](../interfaces/ConnectionRecoveryRecord.md) \| `null`
