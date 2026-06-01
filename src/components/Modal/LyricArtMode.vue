<template>
  <Teleport to="body">
    <Transition name="flow">
      <div v-if="visible" class="lyric-art" :class="[preset, { dark: isDark }]" @click.self="close">
        <!-- 背景 -->
        <div class="art-bg" :style="{ backgroundImage: `url(${coverUrl})` }" />
        <div class="art-overlay" />

        <!-- 预设切换 -->
        <div class="art-toolbar">
          <n-button size="small" quaternary circle @click="prevPreset">
            <SvgIcon name="ChevronLeft" :size="20" />
          </n-button>
          <span class="preset-label">{{ presetLabel }}</span>
          <n-button size="small" quaternary circle @click="nextPreset">
            <SvgIcon name="ChevronRight" :size="20" />
          </n-button>
          <n-button size="small" quaternary circle @click="close" style="margin-left: auto">
            <SvgIcon name="Close" :size="20" />
          </n-button>
        </div>

        <!-- 歌词主体 -->
        <div class="art-content">
          <div class="art-lyric">
            <div class="art-current-lyric" :key="currentLine">
              {{ currentLine }}
            </div>
            <div v-if="showTran && currentTran" class="art-tran-lyric">
              {{ currentTran }}
            </div>
          </div>
          <div class="art-meta">
            <div class="art-song-name">{{ songName }}</div>
            <div class="art-artist-name">{{ artistName }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useMusicStore, useStatusStore, useSettingStore } from "@/stores";

defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

const musicStore = useMusicStore();
const statusStore = useStatusStore();
const settingStore = useSettingStore();

interface PresetConfig {
  key: string;
  label: string;
}

const presets: PresetConfig[] = [
  { key: "center-classic", label: "经典居中" },
  { key: "subtitle", label: "电影字幕" },
  { key: "vinyl-card", label: "黑胶歌词卡" },
  { key: "minimal-poster", label: "极简海报" },
];

const presetIndex = ref(0);
const preset = computed(() => presets[presetIndex.value].key);
const presetLabel = computed(() => presets[presetIndex.value].label);
const isDark = computed(() => settingStore.themeMode !== "light");

const prevPreset = () => {
  presetIndex.value = (presetIndex.value - 1 + presets.length) % presets.length;
};
const nextPreset = () => {
  presetIndex.value = (presetIndex.value + 1) % presets.length;
};

const coverUrl = computed(() => musicStore.songCover);
const songName = computed(() => musicStore.playSong.name || "未知曲目");
const artistName = computed(() => {
  const artists = musicStore.playSong.artists;
  if (Array.isArray(artists)) return artists.map((a) => a.name).join(" / ");
  return artists || "未知艺术家";
});
const showTran = computed(() => settingStore.showTran);

const currentLine = computed(() => {
  const isYrc = musicStore.songLyric.yrcData?.length && settingStore.showWordLyrics;
  const data = isYrc ? musicStore.songLyric.yrcData : musicStore.songLyric.lrcData;
  const idx = statusStore.lyricIndex;
  const line = data?.[idx];
  return line?.words?.map((w: any) => w.word).join("") || "";
});

const currentTran = computed(() => {
  const data = musicStore.songLyric.lrcData;
  const idx = statusStore.lyricIndex;
  return data?.[idx]?.translatedLyric || "";
});

const close = () => emit("close");
</script>

<style lang="scss" scoped>
.lyric-art {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  overflow: hidden;
}
.art-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(40px) brightness(0.5);
  transform: scale(1.2);
  transition: background-image 0.6s ease;
}
.art-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
}
.art-toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
  padding: 8px 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  .preset-label {
    font-size: 14px;
    font-weight: 500;
    min-width: 80px;
    text-align: center;
  }
}
.art-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 80px 60px;
}
.art-lyric {
  text-align: center;
  max-width: 80%;
}
.art-current-lyric {
  font-size: clamp(28px, 5vw, 56px);
  font-weight: 700;
  line-height: 1.4;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.4s ease;
}
.art-tran-lyric {
  font-size: clamp(18px, 2.5vw, 28px);
  opacity: 0.7;
  margin-top: 16px;
  font-weight: 400;
}
.art-meta {
  position: absolute;
  bottom: 60px;
  text-align: center;
  .art-song-name {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .art-artist-name {
    font-size: 16px;
    opacity: 0.6;
  }
}

// 预设样式
.subtitle {
  .art-lyric {
    position: absolute;
    bottom: 120px;
    text-align: center;
    max-width: 90%;
    .art-current-lyric {
      font-size: clamp(24px, 3vw, 40px);
      background: rgba(0, 0, 0, 0.3);
      padding: 12px 24px;
      border-radius: 8px;
      display: inline-block;
      backdrop-filter: blur(4px);
    }
  }
  .art-meta {
    top: 40px;
    bottom: auto;
  }
}
.vinyl-card {
  .art-bg {
    filter: blur(0) brightness(0.7);
  }
  .art-content {
    flex-direction: row;
    gap: 40px;
  }
  .art-lyric {
    flex: 1;
    text-align: left;
    max-width: 50%;
    .art-current-lyric {
      font-size: clamp(22px, 3vw, 38px);
    }
  }
  .art-meta {
    position: static;
    text-align: right;
    max-width: 200px;
  }
}
.minimal-poster {
  .art-bg {
    filter: blur(60px) brightness(0.4);
  }
  .art-lyric {
    .art-current-lyric {
      font-size: clamp(32px, 6vw, 64px);
      font-weight: 300;
      letter-spacing: 2px;
      background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0.7));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
  .art-meta {
    .art-song-name {
      font-weight: 300;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
  }
}
</style>
