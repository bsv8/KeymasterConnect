<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useData, useRoute, withBase } from "vitepress";

const { site, page, localeIndex } = useData();
const route = useRoute();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

function localeHome(key: string): string {
  const link = (site.value.locales as Record<string, { link?: string } | undefined> | undefined)?.[key]?.link;
  return link || (key === "root" ? "/" : `/${key}/`);
}

const keys = computed(() => Object.keys(site.value.locales ?? {}).filter((key) => key !== "root"));
const current = computed(() => localeIndex.value);
const currentLabel = computed(() => label(current.value));

function target(key: string): string {
  const home = localeHome(key);
  // Root fallback pages (landing redirect, shared /api/) have no translations:
  // point at the locale home instead of a 404 same-page guess.
  if (current.value === "root") return withBase(home);
  if (key === current.value) return route.path;
  const prefix = localeHome(current.value);
  let rel = page.value.relativePath;
  if (prefix !== "/" && rel.startsWith(prefix.slice(1))) rel = rel.slice(prefix.length - 1);
  rel = rel.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, "");
  return withBase(home.replace(/\/$/, "") + "/" + rel);
}

function label(key: string): string {
  return (site.value.locales as Record<string, { label?: string }> | undefined)?.[key]?.label ?? key;
}

function toggle(): void {
  open.value = !open.value;
}

function close(): void {
  open.value = false;
}

// SPA 内跳转后收起菜单；整页跳转时组件重建，状态自然归零。
watch(() => route.path, () => close());

function onDocumentClick(event: MouseEvent): void {
  if (!root.value?.contains(event.target as Node)) close();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") close();
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="root" class="connect-lang-dropdown">
    <button
      class="lang-toggle"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="true"
      @click.stop="toggle"
    >
      <span class="lang-toggle-label">{{ currentLabel }}</span>
      <span class="lang-toggle-chevron" aria-hidden="true" />
    </button>
    <div v-show="open" class="lang-menu" role="menu">
      <template v-for="key in keys" :key="key">
        <span v-if="key === current" class="lang-option is-active" role="menuitemradio" aria-checked="true">
          {{ label(key) }}
        </span>
        <a v-else class="lang-option" role="menuitemradio" aria-checked="false" :href="target(key)">
          {{ label(key) }}
        </a>
      </template>
    </div>
  </div>
</template>

<style scoped>
.connect-lang-dropdown {
  position: relative;
  display: none;
  align-items: center;
  margin-left: 8px;
}

@media (min-width: 768px) {
  .connect-lang-dropdown {
    display: flex;
  }
}

.lang-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 11px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 160ms ease, border-color 160ms ease;
}

.lang-toggle:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.lang-toggle-chevron {
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg) translateY(-2px);
  transition: transform 160ms ease;
}

.lang-toggle[aria-expanded="true"] .lang-toggle-chevron {
  transform: rotate(225deg) translateY(-1px);
}

.lang-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 132px;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  z-index: 60;
}

.lang-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

a.lang-option:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.lang-option.is-active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  cursor: default;
}
</style>
