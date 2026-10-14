[@keymaster/connect](../index.md) / ProtocolErrorCode

# Type Alias: ProtocolErrorCode

> **ProtocolErrorCode** = `"invalid_request"` \| `"invalid_origin"` \| `"user_rejected"` \| `"active_key_unavailable"` \| `"decrypt_failed"` \| `"asset_not_enabled"` \| `"storage_not_configured"` \| `"storage_unavailable"` \| `"storage_invalid_path"` \| `"storage_not_found"` \| `"storage_conflict"` \| `"storage_forbidden"` \| `"storage_limit_exceeded"` \| `"storage_provider_error"` \| `"storage_identity_required"` \| `"msfile_not_configured"` \| `"msfile_unavailable"` \| `"msfile_identity_required"` \| `"msfile_supplier_not_found"` \| `"msfile_supplier_disabled"` \| `"msfile_invalid_hash"` \| `"msfile_price_limit_exceeded"` \| `"msfile_integrity_error"` \| `"msfile_content_not_found"` \| `"msfile_rate_limited"` \| `"msfile_supplier_error"` \| `"msfile_transport_error"` \| `"msfile_protocol_error"` \| `"internal_error"`

协议错误码。`error.message` 走英文；UI 展示由调用方决定。
错误码集合是稳定可判定的：第三方接入方写 switch 时不会因为新加错误
类型而误把"未识别"分支当作"成功"。

触发语义（施工单 001 收口）：
  - invalid_request         顶层 message 结构 / 字段类型 / aud-iat-exp
                            规则 / BinaryField 形状不合法；
                            第一条非法 request 直接被 popup 忽略，
                            不回 result（"情况 B"）。
  - invalid_origin          identity.get / intent.sign 的
                            `params.aud !== event.origin`。
  - user_rejected           用户在确认页或解锁页点"取消"。
  - active_key_unavailable  vault 已 unlocked，但 walletState 没有 ready
                            active key（"情况 D"）。
  - decrypt_failed          cipher.decrypt 失败；origin 不匹配 / nonce
                            错误 / 密文被篡改 / 内层结构不合法，V1
                            统一为这一种错误。
  - internal_error          兜底：用户可见但不属于以上分类的失败。

注意：V1 **不**对外暴露 `wallet_locked` 错误码。locked 态在 popup 内
直接走解锁页（"情况 C"），用户取消解锁统一回 `user_rejected`。任何
"locked 时直接拒绝"的中间态都不属于 V1 公开语义。
