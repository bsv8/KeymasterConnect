[keymaster-connect](../index.md) / isStructuredCloneRequestCandidate

# Function: isStructuredCloneRequestCandidate()

> **isStructuredCloneRequestCandidate**(`v`): v is ProtocolRequestMessage\<"identity.get" \| "intent.sign" \| "cipher.encrypt" \| "cipher.decrypt" \| "p2pkh.transfer" \| "payment.pay" \| "payment.status" \| "payment.channel.register" \| "connect.login" \| "connect.resume" \| "connect.logout" \| "connect.launch" \| "channel.publish" \| "channel.subscription\_set" \| "storage.list" \| "storage.directory.create" \| "storage.directory.delete" \| "storage.put" \| "storage.get" \| "storage.delete" \| "msfile.stat" \| "msfile.seed.read" \| "msfile.block.read"\>

顶层 message 形状的"只看是不是已绑定 source 会话能接受的 request"。

## Parameters

### v

`unknown`

## Returns

v is ProtocolRequestMessage\<"identity.get" \| "intent.sign" \| "cipher.encrypt" \| "cipher.decrypt" \| "p2pkh.transfer" \| "payment.pay" \| "payment.status" \| "payment.channel.register" \| "connect.login" \| "connect.resume" \| "connect.logout" \| "connect.launch" \| "channel.publish" \| "channel.subscription\_set" \| "storage.list" \| "storage.directory.create" \| "storage.directory.delete" \| "storage.put" \| "storage.get" \| "storage.delete" \| "msfile.stat" \| "msfile.seed.read" \| "msfile.block.read"\>
