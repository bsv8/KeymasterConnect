// Transport-only record reading. The SDK hands the record string to the wallet
// unchanged; decoding, field checks, version comparison and signature
// verification all belong to the wallet, never to the app side.
/** 读取当前入口 <head> 中唯一的 keymaster-app 记录字符串；缺标签时返回 null。 */
export function readOwnPublicationRecord(doc?: Document):string|null {
 const d=doc??globalThis.document;if(!d)return null;
 const nodes=d.querySelectorAll('meta[name="keymaster-app"]');
 if(!nodes.length)return null;
 if(nodes.length!==1||d.querySelectorAll('head > meta[name="keymaster-app"]').length!==1)throw new Error('publication record must be unique in head');
 const content=nodes[0].getAttribute('content');
 if(!content)throw new Error('publication record is empty');
 return content;
}
