# App 主动打开钱包

`popup` 是独立部署 App 的默认连接方向，名称不表示独立协议页：

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: keymasterDeploymentOrigin,
  mode: "popup"
});
const connected = await keymaster.login({ text: "连接钱包", appIdentity });
```

候选 0.1.2 默认打开完整钱包根页面 `/`，以正常浏览器窗口或标签页展示，不再打开专用协议页，也不设置 popup 尺寸。浏览器决定最终窗口形态。首次调用应来自用户点击，避免被拦截。

钱包先完成正常的创建、导入或解锁，再发布 ready；ready 只说明传输可用。登录与逐次操作审批都在完整钱包的应用连接中心和全局审批面板中进行。默认 ready 超时为两分钟，超时后需显式重连，不关闭钱包。

默认每个客户端打开自己的钱包文档，避免复用其他 App 窗口后继承错误 opener。SDK 只能识别它实际打开的窗口，不能寻找用户手工打开的任意钱包标签页。`popupName` 如显式配置，调用者必须保证不会跨应用共用该名称。

`close()` 拒绝本地等待任务并尽力取消原申请，但不会调用 `window.close()`，也不自动执行 `connect.logout`。错误、超时、Demo 卸载或切换地址同样不能关闭钱包。需要撤销当前连接时显式调用 `logout()`，关闭钱包由用户决定。

候选包验收不等于公共 npm 发布；消费方只有在对应版本公共发布后才切换精确依赖。
