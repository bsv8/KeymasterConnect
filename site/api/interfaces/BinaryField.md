[@keymaster/connect](../index.md) / BinaryField

# Interface: BinaryField

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`$type`](#type) | `"binary"` | Yes | 固定 "binary"。 |
| [`bytes`](#bytes) | `ArrayBuffer` | Yes | 真实字节；`structured clone` 会原样传过去。 |
| [`mime?`](#mime) | `string` | No | 可选的内容类型；密文 / 图片 / 文件等有明确类型时填写。 |

## Properties

### $type

> **$type**: `"binary"`

固定 "binary"。缺省 / 其它值一律拒绝。

***

### bytes

> **bytes**: `ArrayBuffer`

真实字节；`structured clone` 会原样传过去。

***

### mime?

> `optional` **mime?**: `string`

可选的内容类型；密文 / 图片 / 文件等有明确类型时填写。
