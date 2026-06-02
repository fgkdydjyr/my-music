<template>
  <div :class="['background', settingStore.playerBackgroundType]">
    <Transition name="fade" mode="out-in">
      <!-- 背景色 -->
      <div
        v-if="settingStore.playerBackgroundType === 'color'"
        :key="musicStore.songCover"
        class="color"
      />
      <!-- 背景模糊 -->
      <s-image
        v-else-if="settingStore.playerBackgroundType === 'blur'"
        :src="musicStore.songCover"
        :observe-visibility="false"
        class="bg-img"
        alt="cover"
      />
      <!-- 流体效果 -->
      <BackgroundRender
        v-else-if="settingStore.playerBackgroundType === 'animation'"
        :album="musicStore.songCover"
        :fps="settingStore.playerBackgroundFps ?? 60"
        :flowSpeed="flowSpeed"
        :hasLyric="musicStore.isHasLrc"
        :lowFreqVolume="lowFreqVolume"
        :renderScale="settingStore.playerBackgroundRenderScale ?? 0.5"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useMusicStore, useSettingStore, useStatusStore } from "@/stores";
import { usePlayerController } from "@/core/player/PlayerController";
import { useMoodIntegration } from "@/composables/useMoodIntegration";

const musicStore = useMusicStore();
const settingStore = useSettingStore();
const statusStore = useStatusStore();
const player = usePlayerController();

const { tickMood } = useMoodIntegration();

// 低频音量
const lowFreqVolume = ref(1.0);

const flowSpeed = computed(() => {
  if (!statusStore.playStatus && settingStore.playerBackgroundPause) return 0;
  else return settingStore.playerBackgroundFlowSpeed ?? 4;
});

// 更新低频音量 + 情绪分析
const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
  () => {
    tickMood();
    if (
      settingStore.playerBackgroundLowFreqVolume &&
      settingStore.playerBackgroundType === "animation" &&
      statusStore.playStatus
    ) {
      lowFreqVolume.value = player.getLowFrequencyVolume();
    }
  },
  { immediate: false },
);

// 启动或暂停 RAF
watch(
  () => [
    settingStore.playerBackgroundLowFreqVolume,
    settingStore.moodAtmosphere,
    settingStore.playerBackgroundType,
    statusStore.playStatus,
  ],
  ([enabled, moodEnabled, bgType, playing]) => {
    const shouldRun = (enabled && bgType === "animation") || moodEnabled;
    if (shouldRun) {
      playing ? resumeRaf() : pauseRaf();
    } else {
      pauseRaf();
      lowFreqVolume.value = 1.0;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  pauseRaf();
});
</script>

<style lang="scss" scoped>
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  // 暖色渐变覆盖层
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      linear-gradient(135deg, rgba(180, 100, 60, 0.15), rgba(80, 40, 60, 0.15)), rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }
  &.blur {
    display: flex;
    align-items: center;
    justify-content: center;
    .bg-img {
      width: 100%;
      height: auto;
      transform: scale(1.5);
      filter: blur(80px) contrast(1.2);
      transition: opacity 0.6s var(--ease-out);
    }
  }
  &.color {
    background-color: rgb(var(--main-cover-color));
    transition: background-color 0.8s var(--ease-out);
    .color {
      width: 100%;
      height: 100%;
      background-color: rgb(var(--main-cover-color));
      transition: background-color 0.8s var(--ease-out);
    }
  }
  &.animation {
    &::after {
      display: none;
    }
  }
}
</style>
