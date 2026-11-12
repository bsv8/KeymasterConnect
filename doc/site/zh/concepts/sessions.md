# 会话

App 连接指定 Keymaster origin，用户授权后取得当前钱包的 `{ bsvNetwork, publicKeyHex }`。App 不选择私钥或网络。

| 层次 | 生命周期 |
| --- | --- |
| 钱包身份 | 公钥和初始化网络；相同公钥在 main/test 是不同身份 |
| 钱包世代 | 重置后变化；同公钥重新导入也不能继承旧运行授权 |
| 本地连接记录 | 当前来源的 claims 和已验证 App proof；不是可转移令牌 |
| Transport binding | 接收端按实际 origin、窗口、钱包世代及 Worker 运行世代签发；SDK 自动使用 |
| 解锁运行时 | 钱包锁定或 Worker 重启后需重新获取受控操作能力 |

## 登录与恢复

```ts
const session = await keymaster.login({ text: "连接钱包" });
const resumed = await keymaster.resume();
// 需要 Storage / MSFile 时：
const appSession = await keymaster.resume({ appIdentity });
```

三种建立方式 `login / resume / launch` 均返回 `networkIdentity` 和 claims 等结果，SDK 绑定返回身份。
业务方法不再携带钱包定位参数。`connect()` 和 ready 仅表示传输可用，不表示授权成功。

恢复读取当前钱包和当前来源的本地记录；缺缓存时只重建当前缺省上下文，不恢复已删除的 claims、额度或运行句柄。发行人 proof 必须重新验签，不能用未签名参数取得 App 权限。

## 身份变化

钱包重置、重新初始化或 Worker 重启后，旧绑定、排队请求及事件不得自动漂移到新身份。
即使重新导入同一私钥，旧运行授权仍失效。App 必须显式重新建立连接，读取新返回身份并自行判断和提示。

重置不改写外部已经持有的签名材料。验证方仍按公钥、网络、签名、范围及凭证自身有效期校验。
连接结果和公开公钥本身不是免确认付款凭证。

## 注销与关闭

`logout()` 撤销当前来源的本地连接及相关运行授权；不接受钱包公钥参数。
`close()` 仅关闭传输并清空 SDK 本地绑定，不执行注销。重新打开后先 `resume()` 或重新登录，再发业务请求。
