# appView 模式

当 Keymaster 主动启动 App 时，App 使用一次性令牌并连接主钱包的 `window.opener`，不需要中间 Session Window。
初始化不传钱包身份。`launch` 成功返回当前钱包公钥和网络，App 自行判断并提示；App 发布者公钥不是钱包公钥。

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: sessionWindowOrigin, // 启动 URL 注入的主钱包精确来源
  mode: "appView"
});

await keymaster.connect();
const session = await keymaster.launch({ launchToken, appIdentity });
```

SDK 会复用已有 opener，监听就绪后发送 ready。opener 缺失或丢失时安全失败，不会改用
`window.open()`。`connect.launch` 不能在 Popup 模式使用，无效令牌也不能降级成登录。
