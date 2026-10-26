[keymaster-connect](../index.md) / MethodParams

# Type Alias: MethodParams\<M\>

> **MethodParams**\<`M`\> = `M` *extends* [`ProtocolMethod`](ProtocolMethod.md) ? keyof [`MethodParamsMap`](../interfaces/MethodParamsMap.md)\[`M`\] *extends* `never` ? `Record`\<`string`, `never`\> : [`MethodParamsMap`](../interfaces/MethodParamsMap.md)\[`M`\] : `never`

## Type Parameters

### M

`M` *extends* [`ProtocolMethod`](ProtocolMethod.md)
