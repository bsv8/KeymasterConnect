<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";

const sourceUrl = __CONNECT_SOURCE_URL__;
const { localeIndex } = useData();
const lang = computed(() => (localeIndex.value === "en" || localeIndex.value === "ja" ? localeIndex.value : "zh"));
const prefix = computed(() => `/${lang.value}`);

const copy = {
  zh: {
    kicker: "@keymaster/connect · browser SDK",
    titleA: "开放能力，",
    titleB: "私钥不出 Keymaster。",
    summary: "浏览器 App 可以请求身份、密码学、消息、存储、文件和支付能力，但不会取得用户私钥。",
    start: "开始接入",
    viewApi: "查看 API",
    install: "npm install --save-exact keymaster-connect@0.1.4",
    footnote: "POSTMESSAGE 传输 · 精确来源 · 会话绑定",
    capIndex: "01 / 能力",
    capTitleA: "一个会话，",
    capTitleB: "六类受控能力。",
    capNote: "每个业务请求都绑定钱包网络、公钥和实际来源。",
    flowIndex: "02 / 连接模型",
    flowTitleA: "窗口负责传输，",
    flowTitleB: "网络与公钥确定身份。",
    finalIndex: "03 / 构建",
    finalTitleA: "API 就是 SDK，",
    finalTitleB: "不维护第二份字段文档。",
    finalNote: "字段页面从指定版本的 SDK 公开源码和中文类型注释生成。",
    openGuide: "打开指南",
    viewSource: "查看源码",
    steps: [
      ["连接", "打开可复用 Session Window，或在 appView 中复用 opener。"],
      ["确认身份", "用户确认目标钱包，SDK 核对完整网络身份并取得钱包公钥。"],
      ["请求", "调用类型化方法；Keymaster 负责确认、私密材料和执行。"],
    ],
    capabilities: [
      ["身份", "登录用户并签发身份断言", "identity.get"],
      ["密码学", "签署意图并加密来源绑定数据", "intent.sign · cipher.*"],
      ["通信", "发布和订阅已签名频道消息", "channel.*"],
      ["存储", "在 App 隔离对象空间中读写", "storage.*"],
      ["文件", "查询并读取 MSFile 内容", "msfile.*"],
      ["支付", "按 outputs 数组请求受控 BSV 转账", "payment.*"],
    ],
  },
  en: {
    kicker: "@keymaster/connect · browser SDK",
    titleA: "Open capabilities,",
    titleB: "private keys never leave Keymaster.",
    summary: "Browser apps can request identity, cryptography, messaging, storage, file and payment capabilities — without ever obtaining user private keys.",
    start: "Get started",
    viewApi: "View API",
    install: "npm install --save-exact keymaster-connect@0.1.4",
    footnote: "PostMessage transport · exact origin · session binding",
    capIndex: "01 / Capabilities",
    capTitleA: "One session,",
    capTitleB: "six controlled capabilities.",
    capNote: "Every business request is bound to wallet network, public key and live origin.",
    flowIndex: "02 / Connection model",
    flowTitleA: "Windows carry transport,",
    flowTitleB: "network and public key define identity.",
    finalIndex: "03 / Build",
    finalTitleA: "The API is the SDK —",
    finalTitleB: "no second copy of field docs.",
    finalNote: "Field pages are generated from the pinned SDK public sources and type comments.",
    openGuide: "Open the guide",
    viewSource: "View source",
    steps: [
      ["Connect", "Open a reusable session window, or reuse the opener in appView."],
      ["Confirm identity", "The user confirms the target wallet; the SDK checks the full network identity and takes the wallet public key."],
      ["Request", "Call typed methods; Keymaster owns confirmation, private material and execution."],
    ],
    capabilities: [
      ["Identity", "Sign users in and issue identity assertions", "identity.get"],
      ["Cryptography", "Sign intents and encrypt origin-bound data", "intent.sign · cipher.*"],
      ["Messaging", "Publish and subscribe to signed channel messages", "channel.*"],
      ["Storage", "Read and write in the app-isolated object space", "storage.*"],
      ["Files", "Query and read MSFile content", "msfile.*"],
      ["Payments", "Request controlled BSV transfers by outputs array", "payment.*"],
    ],
  },
  ja: {
    kicker: "@keymaster/connect · browser SDK",
    titleA: "能力を開放し、",
    titleB: "秘密鍵は Keymaster の外に出さない。",
    summary: "ブラウザアプリはアイデンティティ・暗号・メッセージ・ストレージ・ファイル・決済の機能を利用できますが、ユーザーの秘密鍵を取得することはありません。",
    start: "導入開始",
    viewApi: "API を見る",
    install: "npm install --save-exact keymaster-connect@0.1.4",
    footnote: "PostMessage 転送 · 厳密なオリジン · セッション紐付け",
    capIndex: "01 / 機能",
    capTitleA: "一つのセッション、",
    capTitleB: "六種の制御機能。",
    capNote: "すべての業務リクエストはウォレットのネットワーク・公開鍵・実際のオリジンに紐付きます。",
    flowIndex: "02 / 接続模型",
    flowTitleA: "ウィンドウは転送を担い、",
    flowTitleB: "ネットワークと公開鍵がアイデンティティを確定する。",
    finalIndex: "03 / 構築",
    finalTitleA: "API こそが SDK であり、",
    finalTitleB: "二重のフィールド文書は維持しない。",
    finalNote: "フィールドページは指定バージョンの SDK 公開ソースと型注釈から生成されます。",
    openGuide: "ガイドを開く",
    viewSource: "ソースを見る",
    steps: [
      ["接続", "再利用可能な Session Window を開くか、appView で opener を再利用します。"],
      ["アイデンティティ確認", "ユーザーが対象ウォレットを確認し、SDK が完全なネットワークアイデンティティを照合してウォレット公開鍵を取得します。"],
      ["リクエスト", "型付きメソッドを呼び出します。確認・秘密材料・実行は Keymaster が担います。"],
    ],
    capabilities: [
      ["アイデンティティ", "ログインしてアイデンティティ表明を発行する", "identity.get"],
      ["暗号", "インテントに署名しオリジン紐付けデータを暗号化する", "intent.sign · cipher.*"],
      ["メッセージ", "署名付きチャネルメッセージを公開・購読する", "channel.*"],
      ["ストレージ", "アプリ隔離オブジェクト空間で読み書きする", "storage.*"],
      ["ファイル", "MSFile コンテンツを照会・読み取る", "msfile.*"],
      ["決済", "outputs 配列で制御された BSV 送金を要求する", "payment.*"],
    ],
  },
} as const;

type Lang = keyof typeof copy;
const t = computed(() => copy[lang.value as Lang] ?? copy.zh);
</script>

<template>
  <main class="connect-home">
    <section class="connect-hero" aria-labelledby="connect-title">
      <div class="protocol-field" aria-hidden="true">
        <div class="protocol-orbit orbit-one" />
        <div class="protocol-orbit orbit-two" />
        <div class="protocol-node node-a">APP</div>
        <div class="protocol-node node-b">SESSION</div>
        <div class="protocol-node node-c">KEYMASTER</div>
        <div class="protocol-packet packet-one">request · identity.get</div>
        <div class="protocol-packet packet-two">result · approved</div>
        <div class="protocol-packet packet-three">event · message_received</div>
      </div>

      <div class="hero-copy">
        <p class="hero-kicker">{{ t.kicker }}</p>
        <h1 id="connect-title">{{ t.titleA }}<br><span>{{ t.titleB }}</span></h1>
        <p class="hero-summary">{{ t.summary }}</p>
        <div class="hero-actions">
          <a class="primary-action" :href="withBase(`${prefix}/guide/getting-started`)">{{ t.start }} <span>→</span></a>
          <a class="secondary-action" :href="withBase('/api/')">{{ t.viewApi }}</a>
        </div>
        <div class="install-line" aria-label="install">
          <span class="prompt">$</span>
          <code>{{ t.install }}</code>
        </div>
      </div>

      <p class="hero-footnote">{{ t.footnote }}</p>
    </section>

    <section class="capability-section" aria-labelledby="capability-title">
      <div class="section-intro">
        <p class="section-index">{{ t.capIndex }}</p>
        <h2 id="capability-title">{{ t.capTitleA }}<br>{{ t.capTitleB }}</h2>
        <p>{{ t.capNote }}</p>
      </div>
      <div class="capability-list">
        <a v-for="([title, detail, methods], index) in t.capabilities" :key="title" :href="withBase(`${prefix}/guide/capabilities`)" class="capability-row">
          <span class="row-number">0{{ index + 1 }}</span>
          <strong>{{ title }}</strong>
          <span class="row-detail">{{ detail }}</span>
          <code>{{ methods }}</code>
          <span class="row-arrow">↗</span>
        </a>
      </div>
    </section>

    <section class="flow-section" aria-labelledby="flow-title">
      <div class="flow-heading">
        <p class="section-index">{{ t.flowIndex }}</p>
        <h2 id="flow-title">{{ t.flowTitleA }}<br>{{ t.flowTitleB }}</h2>
      </div>
      <ol class="flow-steps">
        <li v-for="([step, text], index) in t.steps" :key="step">
          <span>0{{ index + 1 }}</span>
          <h3>{{ step }}</h3>
          <p>{{ text }}</p>
        </li>
      </ol>
    </section>

    <section class="final-section">
      <p class="section-index">{{ t.finalIndex }}</p>
      <h2>{{ t.finalTitleA }}<br>{{ t.finalTitleB }}</h2>
      <p>{{ t.finalNote }}</p>
      <div class="final-actions">
        <a class="primary-action" :href="withBase(`${prefix}/guide/getting-started`)">{{ t.openGuide }} <span>→</span></a>
        <a v-if="sourceUrl" class="secondary-action" :href="sourceUrl">{{ t.viewSource }}</a>
      </div>
    </section>
  </main>
</template>
