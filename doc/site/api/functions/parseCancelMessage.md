[keymaster-connect](../index.md) / parseCancelMessage

# Function: parseCancelMessage()

> **parseCancelMessage**(`raw`): `object`

校验顶层 `cancel` 报文。

返回 `{ id }` 或抛错。**只**做结构 + id 非空字符串校验：
  - `v` 必须是 `PROTOCOL_VERSION`；
  - `type` 必须是 `"cancel"`；
  - `id` 必须是非空字符串。

设计缘由（施工单 003）：
  - cancel 是 transport 控制消息；除了 id 之外没有 params。
  - "是否生效"的判定（current binding 匹配 / source/origin 匹配 /
    phase === "executing" 时忽略）由 service 在 `handleMessage` 路径
    里集中做；validation 只负责"报文本身能不能进入 service"。
  - 校验失败不抛 cancel 专属 error code：复用 `invalid_request` 与
    其它顶层报文保持一致；popup 收到非法 cancel 直接忽略即可。

## Parameters

### raw

`unknown`

## Returns

`object`

### id

> **id**: `string`
