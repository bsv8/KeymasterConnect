[keymaster-connect](../index.md) / isStructuredCloneRequestCandidate

# Function: isStructuredCloneRequestCandidate()

> **isStructuredCloneRequestCandidate**(`v`): v is ProtocolRequestMessage\<"identity.get" \| "intent.sign" \| "cipher.encrypt" \| "cipher.decrypt" \| "payment.pay" \| "payment.status" \| "payment.prepare" \| "payment.commit" \| "payment.cancel" \| "chain.get\_height" \| "chain.list\_script\_history" \| "chain.get\_transaction" \| "chain.get\_transactions" \| "chain.list\_script\_unspent" \| "chain.broadcast" \| "application.key" \| "application.sign\_message" \| "application.sign\_payment" \| "msfile.seller.status" \| "msfile.import" \| "msfile.content.read" \| "msfile.content.status" \| "msfile.content.open" \| "msfile.content.price" \| "msfile.content.range" \| "msfile.streamseed.follow" \| "msfile.streamseed.read" \| "domain.profiles" \| "domain.get\_public\_key" \| "connect.login" \| "connect.logout" \| "connect.launch" \| "channel.publish" \| "channel.subscription\_set" \| "msfile.stat" \| "msfile.seed.read" \| "msfile.block.read"\>

顶层 message 形状的"只看是不是已绑定 source 会话能接受的 request"。

## Parameters

### v

`unknown`

## Returns

v is ProtocolRequestMessage\<"identity.get" \| "intent.sign" \| "cipher.encrypt" \| "cipher.decrypt" \| "payment.pay" \| "payment.status" \| "payment.prepare" \| "payment.commit" \| "payment.cancel" \| "chain.get\_height" \| "chain.list\_script\_history" \| "chain.get\_transaction" \| "chain.get\_transactions" \| "chain.list\_script\_unspent" \| "chain.broadcast" \| "application.key" \| "application.sign\_message" \| "application.sign\_payment" \| "msfile.seller.status" \| "msfile.import" \| "msfile.content.read" \| "msfile.content.status" \| "msfile.content.open" \| "msfile.content.price" \| "msfile.content.range" \| "msfile.streamseed.follow" \| "msfile.streamseed.read" \| "domain.profiles" \| "domain.get\_public\_key" \| "connect.login" \| "connect.logout" \| "connect.launch" \| "channel.publish" \| "channel.subscription\_set" \| "msfile.stat" \| "msfile.seed.read" \| "msfile.block.read"\>
