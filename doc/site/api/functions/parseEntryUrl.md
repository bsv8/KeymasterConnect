[keymaster-connect](../index.md) / parseEntryUrl

# Function: parseEntryUrl()

> **parseEntryUrl**(`input`): `object`

从应用入口 URL 推导 canonical origin。
入口可带路径/查询/片段；origin 取标准 URL origin（协议+主机+有效端口）。
返回规范 origin 与保留的完整启动 URL。

## Parameters

### input

`unknown`

## Returns

`object`

### origin

> **origin**: `string`

### url

> **url**: `string`
