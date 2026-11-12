# バイナリデータ

Connect はバイト列と通常文字列を明示構造で区別します。

```ts
interface BinaryField {
  $type: "binary";  // 固定型標識
  bytes: ArrayBuffer; // 実際バイト列
  mime?: string;      // 任意メディア型
}
```

欄の作成・読取は `binary()`・`binaryText()`・`binaryBytes()`・`binaryToText()` を使用します。
`binary()` は入力を複写するため、呼出後に元緩衝を変更してもリクエストは変わりません。

Channel 内容は JSON のみ受理します。バイナリ内容はアプリ側で符号化してから公開してください。
