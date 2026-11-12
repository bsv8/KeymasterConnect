# Binary data

Connect separates real bytes from plain strings with an explicit shape:

```ts
interface BinaryField {
  $type: "binary";  // fixed type tag
  bytes: ArrayBuffer; // actual bytes
  mime?: string;      // optional media type
}
```

Create or read fields with `binary()`, `binaryText()`, `binaryBytes()` and `binaryToText()`.
`binary()` copies the input; mutating the caller's buffer afterwards never changes the request.

Channel content accepts JSON only; apps should encode binary payloads themselves before publishing.
