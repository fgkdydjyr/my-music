<template>
  <n-scrollbar
    style="max-height: 70vh"
    :content-style="{
      padding: '4px 0',
    }"
  >
    <div class="skin-grid">
      <div
        v-for="skin in skinPresets"
        :key="skin.key"
        :class="['skin-card', { active: activeSkin === skin.key }]"
        @click="selectSkin(skin.key)"
      >
        <div class="skin-preview">
          <SvgIcon :name="skin.icon" :size="40" />
        </div>
        <div class="skin-info">
          <div class="skin-name">{{ skin.name }}</div>
          <div class="skin-desc">{{ skin.description }}</div>
        </div>
        <div v-if="activeSkin === skin.key" class="skin-check">
          <SvgIcon name="Check" :size="20" />
        </div>
      </div>
    </div>
  </n-scrollbar>
</template>

<script setup lang="ts">
import { useThemeSkin } from "@/composables/useThemeSkin";

const emit = defineEmits<{ close: [] }>();

const { activeSkin, applySkin, skinPresets } = useThemeSkin();

const selectSkin = (key: string) => {
  applySkin(key);
  window.$message.success("皮肤已应用");
  emit("close");
};
</script>

<style lang="scss" scoped>
.skin-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 4px 0;
}
.skin-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid rgba(var(--primary), 0.12);
  cursor: pointer;
  transition:
    border-color 0.3s,
    background-color 0.3s,
    transform 0.25s var(--ease-out-back);
  &:hover {
    border-color: rgba(var(--primary), 0.58);
    transform: translateY(-2px);
  }
  &.active {
    border-color: var(--primary-hex);
    background-color: rgba(var(--primary), 0.08);
  }
}
.skin-preview {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--primary), 0.15), rgba(var(--primary), 0.05));
  flex-shrink: 0;
}
.skin-info {
  flex: 1;
  min-width: 0;
  .skin-name {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .skin-desc {
    font-size: 12px;
    opacity: 0.6;
    line-height: 1.4;
  }
}
.skin-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--primary-hex);
}
</style>
