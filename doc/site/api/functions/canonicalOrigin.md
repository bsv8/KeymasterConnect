[keymaster-connect](../index.md) / canonicalOrigin

# Function: canonicalOrigin()

> **canonicalOrigin**(`input`): `string`

校验并规范化可信 origin 输入（WHATWG URL origin 序列化规则）。
接受显式默认端口与大小写主机并归一；拒绝路径/查询/片段、凭据与非 http(s)。

## Parameters

### input

`unknown`

## Returns

`string`
