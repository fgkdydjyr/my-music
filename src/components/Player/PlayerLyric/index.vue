<template>
  <div class="player-lyric">
    <!-- 歌词内容 -->
    <AMLyric v-if="settingStore.useAMLyrics" :currentTime="playSeek" />
    <DefaultLyric v-else :currentTime="playSeek" />
    <!-- 歌词菜单 -->
    <n-flex :class="['lyric-menu', { show: statusStore.playerMetaShow }]" justify="center" vertical>
      <div
        v-if="settingStore.fullscreenPlayerElements.copyLyric"
        class="menu-icon"
        @click="openCopyLyrics"
      >
        <SvgIcon name="Copy" />
      </div>
      <div
        v-if="
          settingStore.fullscreenPlayerElements.copyLyric &&
          (settingStore.fullscreenPlayerElements.lyricOffset ||
            settingStore.fullscreenPlayerElements.lyricSettings)
        "
        class="divider"
      />
      <div
        v-if="settingStore.fullscreenPlayerElements.lyricOffset"
        class="menu-icon"
        @click="changeOffset(-settingStore.lyricOffsetStep)"
      >
        <SvgIcon name="Replay5" />
      </div>
      <n-popover
        v-if="settingStore.fullscreenPlayerElements.lyricOffset"
        class="player"
        trigger="click"
        placement="left"
        style="padding: 8px"
      >
        <template #trigger>
          <span class="time">
            {{ currentTimeOffsetValue }}
          </span>
        </template>
        <n-flex class="offset-menu" :size="4" vertical>
          <span class="title"> 歌词偏移 </span>
          <span class="tip"> 正值为歌词提前，单位毫秒 </span>
          <n-input-number
            v-model:value="offsetMilliseconds"
            class="offset-input"
            :precision="0"
            :step="100"
            placeholder="0"
            size="small"
          >
            <template #suffix>ms</template>
          </n-input-number>
          <n-button
            :disabled="offsetMilliseconds == 0"
            class="player"
            size="small"
            secondary
            strong
            @click="resetOffset"
          >
            清零
          </n-button>
        </n-flex>
      </n-popover>
      <div
        v-if="settingStore.fullscreenPlayerElements.lyricOffset"
        class="menu-icon"
        @click="changeOffset(settingStore.lyricOffsetStep)"
      >
        <SvgIcon name="Forward5" />
      </div>
      <div
        v-if="
          settingStore.fullscreenPlayerElements.lyricOffset &&
          settingStore.fullscreenPlayerElements.lyricSettings
        "
        class="divider"
      />
      <div
        v-if="settingStore.fullscreenPlayerElements.lyricSettings"
        class="menu-icon"
        @click="openSetting('lyrics')"
      >
        <SvgIcon name="Settings" />
      </div>
    </n-flex>
  </div>
</template>

<script setup lang="ts">
import { usePlayerController } from "@/core/player/PlayerController";
import { useMusicStore, useSettingStore, useStatusStore } from "@/stores";
import { openSetting, openCopyLyrics } from "@/utils/modal";

const musicStore = useMusicStore();
const settingStore = useSettingStore();
const statusStore = useStatusStore();
const player = usePlayerController();

/**
 * 当前歌曲 id
 */
const currentSongId = computed(() => musicStore.playSong?.id as number | undefined);

// 实时播放进度
const playSeek = ref<number>(player.getSeek() + statusStore.getSongOffset(musicStore.playSong?.id));

// 实时更新播放进度
const { pause: pauseSeek, resume: resumeSeek } = useRafFn(() => {
  const songId = musicStore.playSong?.id;
  const offsetTime = statusStore.getSongOffset(songId);
  playSeek.value = player.getSeek() + offsetTime;
});

/**
 * 当前进度偏移值
 */
const currentTimeOffsetValue = computed(() => {
  const currentTimeOffset = statusStore.getSongOffset(currentSongId.value);
  if (currentTimeOffset === 0) return "0";
  // 将毫秒转换为秒显示
  const offsetSeconds = parseFloat((currentTimeOffset / 1000).toFixed(2));
  return currentTimeOffset > 0 ? `+${offsetSeconds}` : `${offsetSeconds}`;
});

/**
 * 当前进度偏移值（毫秒）
 */
const offsetMilliseconds = computed({
  get: () => {
    return statusStore.getSongOffset(currentSongId.value);
  },
  set: (val: number | null) => {
    statusStore.setSongOffset(currentSongId.value, val || 0);
  },
});

/**
 * 改变进度偏移
 * @param delta 偏移量（单位：毫秒）
 */
const changeOffset = (delta: number) => {
  statusStore.incSongOffset(currentSongId.value, delta);
};

/**
 * 重置进度偏移
 */
const resetOffset = () => {
  statusStore.resetSongOffset(currentSongId.value);
};

onMounted(() => {
  resumeSeek();
});

onBeforeUnmount(() => {
  pauseSeek();
});
</script>

<style lang="scss" scoped>
.player-lyric {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      .lyric-menu {
        pointer-events: auto;
        opacity: 1;
      }
    }
  }
}
.lyric-menu {
  position: absolute;
  pointer-events: none;
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 220, 180, 0.08);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 10;
  .divider {
    height: 1px;
    width: 28px;
    background: rgba(255, 255, 255, 0.1);
  }
  .time {
    width: 40px;
    padding: 4px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: background-color 0.3s;
    cursor: pointer;
    &::after {
      content: "s";
      margin-left: 2px;
    }
    &:hover {
      background: rgba(255, 255, 255, 0.12);
    }
  }
  .menu-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 8px;
    transition:
      background-color 0.3s,
      transform 0.3s;
    cursor: pointer;
    :deep(.n-icon) {
      font-size: 26px;
      color: rgba(255, 255, 255, 0.6);
    }
    &:hover {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 0.08);
    }
    &:active {
      transform: scale(1);
    }
  }
}
.offset-menu {
  width: 180px;
  .title {
    font-size: 14px;
    line-height: normal;
  }
  .tip {
    font-size: 12px;
    opacity: 0.6;
  }
  :deep(.n-input) {
    --n-caret-color: rgba(255, 255, 255, 0.8);
    --n-color: rgba(255, 255, 255, 0.06);
    --n-color-focus: rgba(255, 255, 255, 0.08);
    --n-text-color: rgba(255, 255, 255, 0.8);
    --n-border-hover: 1px solid rgba(255, 255, 255, 0.2);
    --n-border-focus: 1px solid rgba(255, 255, 255, 0.2);
    --n-suffix-text-color: rgba(255, 255, 255, 0.6);
    --n-box-shadow-focus: 0 0 8px 0 rgba(255, 255, 255, 0.1);
    input {
      &::selection {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
    .n-button {
      --n-text-color: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
