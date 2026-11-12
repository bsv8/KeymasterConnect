---
layout: page
sidebar: false
---

<script setup>
const groups = [
  ["zh", /^zh/i],
  ["ja", /^ja/i],
  ["en", /^en/i],
];
function pick() {
  try {
    const saved = localStorage.getItem("connect-docs-lang");
    if (saved === "zh" || saved === "en" || saved === "ja") return saved;
  } catch { /* storage unavailable, fall through to negotiation */ }
  const tags = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ""];
  for (const tag of tags) {
    for (const [locale, pattern] of groups) {
      if (pattern.test(tag || "")) return locale;
    }
  }
  return "en";
}
if (typeof window !== "undefined") {
  window.location.replace(`/${pick()}/`);
}
</script>

# Keymaster Connect SDK

[简体中文](/zh/) · [English](/en/) · [日本語](/ja/)
