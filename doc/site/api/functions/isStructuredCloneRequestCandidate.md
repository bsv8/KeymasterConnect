[keymaster-connect](../index.md) / isStructuredCloneRequestCandidate

# Function: isStructuredCloneRequestCandidate()

> **isStructuredCloneRequestCandidate**(`v`): v is ProtocolRequestMessage\<"identity.get" \| "intent.sign" \| "cipher.encrypt" \| "cipher.decrypt" \| "payment.pay" \| "payment.status" \| "connect.login" \| "connect.logout" \| "connect.launch" \| "channel.publish" \| "channel.subscription\_set" \| "msfile.stat" \| "msfile.seed.read" \| "msfile.block.read"\>

顶层 message 形状的"只看是不是已绑定 source 会话能接受的 request"。

## Parameters

### v

`unknown`

## Returns

v is ProtocolRequestMessage\<"identity.get" \| "intent.sign" \| "cipher.encrypt" \| "cipher.decrypt" \| "payment.pay" \| "payment.status" \| "connect.login" \| "connect.logout" \| "connect.launch" \| "channel.publish" \| "channel.subscription\_set" \| "msfile.stat" \| "msfile.seed.read" \| "msfile.block.read"\>
