<template>
  <!-- 全屏封面 -->
  <div
    v-if="settingStore.playerType === 'fullscreen' && !isTablet"
    class="full-screen"
    :style="{ '--gradient-percent': settingStore.playerFullscreenGradient + '%' }"
  >
    <Transition name="cover-switch" mode="out-in">
      <s-image
        :key="getCoverUrl('xl')"
        :src="getCoverUrl('xl')"
        :alt="musicStore.playSong.name"
        :title="musicStore.playSong.name"
        :lazy="false"
        :width="'100%'"
        :height="'100%'"
      />
    </Transition>
  </div>
  <!-- 普通封面 -->
  <div
    v-else
    :class="[
      'player-cover',
      settingStore.playerType,
      `${recordStyle}-record`,
      { playing: statusStore.playStatus },
    ]"
  >
    <!-- 指针 -->
    <img
      v-if="settingStore.playerType === 'record'"
      :class="['pointer', tonearmStyle]"
      :src="tonearmImages[tonearmStyle]"
      alt="pointer"
    />
    <!-- 专辑图片 -->
    <Transition name="cover-switch" mode="out-in">
      <s-image
        :key="getCoverUrl('l')"
        :src="getCoverUrl('l')"
        :observe-visibility="false"
        object-fit="cover"
        class="cover-img"
      />
    </Transition>
    <!-- 唱片标签 -->
    <div v-if="settingStore.playerType === 'record' && showRecordLabel" class="record-label">
      <span class="label-text">{{ musicStore.playSong.name?.slice(0, 8) || "SPlayer" }}</span>
    </div>
    <!-- 动态封面 -->
    <Transition name="fade" mode="out-in">
      <video
        v-if="dynamicCover && settingStore.dynamicCover && settingStore.playerType === 'cover'"
        ref="videoRef"
        :src="dynamicCover"
        :class="['dynamic-cover', { loaded: dynamicCoverLoaded }]"
        muted
        autoplay
        @loadeddata="dynamicCoverLoaded = true"
        @ended="dynamicCoverEnded"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { songDynamicCover } from "@/api/song";
import { useMobile } from "@/composables/useMobile";
import { useVinylRecord } from "@/composables/useVinylRecord";
import { useBlobURLManager } from "@/core/resource/BlobURLManager";
import { useSettingStore, useStatusStore, useMusicStore } from "@/stores";
import { isLogin } from "@/utils/auth";
import { isElectron } from "@/utils/env";
import { isEmpty } from "lodash-es";

const { recordStyle, tonearmStyle, showRecordLabel } = useVinylRecord();

const musicStore = useMusicStore();
const statusStore = useStatusStore();
const settingStore = useSettingStore();

const { isTablet } = useMobile();

// 本地歌曲高清封面（Data URL）
const localCoverDataUrl = ref<string>("");

// 动态封面
const dynamicCover = ref<string>("");
const dynamicCoverLoaded = ref<boolean>(false);

// 视频元素
const videoRef = ref<HTMLVideoElement | null>(null);

// 唱针图片映射（使用同一图片，不同 CSS 样式）
const tonearmImages: Record<string, string> = {
  classic: "/images/pointer.png?asset",
  straight: "/images/pointer.png?asset",
  wooden: "/images/pointer.png?asset",
};

// 清理本地封面资源
const cleanupLocalCover = () => {
  localCoverDataUrl.value = "";
};

// 清理动态封面资源
const cleanupDynamicCover = () => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.src = "";
    videoRef.value.load();
  }
  dynamicCover.value = "";
  dynamicCoverLoaded.value = false;
};

// 封面再放送
const { start: dynamicCoverStart, stop: dynamicCoverStop } = useTimeoutFn(
  () => {
    dynamicCoverLoaded.value = true;
    videoRef.value?.play();
  },
  2000,
  { immediate: false },
);

// 获取本地歌曲高清封面
const getLocalCover = async () => {
  if (!isElectron || !musicStore.playSong.path || musicStore.playSong.type === "streaming") {
    cleanupLocalCover();
    return;
  }
  // 先检查blob中是否存在
  const blobURLManager = useBlobURLManager();
  const blobURL = blobURLManager.getBlobURL(musicStore.playSong.path);
  if (blobURL) {
    localCoverDataUrl.value = blobURL;
    return;
  }
  try {
    const coverData = await window.electron.ipcRenderer.invoke(
      "get-music-cover",
      musicStore.playSong.path,
    );
    if (coverData) {
      // 使用 Data URL，确保跨窗口可用
      const blob = new Blob([coverData.data], { type: coverData.format });
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.onabort = reject;
        reader.readAsDataURL(blob);
      });
      localCoverDataUrl.value = dataUrl;
    } else {
      localCoverDataUrl.value = "";
    }
  } catch (error) {
    console.error("获取本地封面失败:", error);
    localCoverDataUrl.value = "";
  }
};

// 获取动态封面
const getDynamicCover = async () => {
  if (
    isLogin() !== 1 ||
    musicStore.playSong.path ||
    !musicStore.playSong.id ||
    !settingStore.dynamicCover ||
    settingStore.playerType !== "cover"
  )
    return;
  dynamicCoverStop();
  dynamicCoverLoaded.value = false;
  const result = await songDynamicCover(musicStore.playSong.id);
  if (!isEmpty(result.data) && result?.data?.videoPlayUrl) {
    dynamicCover.value = result.data.videoPlayUrl;
  } else {
    dynamicCover.value = "";
  }
};

// 封面播放结束
const dynamicCoverEnded = () => {
  dynamicCoverLoaded.value = false;
  dynamicCoverStart();
};

// 获取封面 URL
const getCoverUrl = (size: "s" | "m" | "l" | "xl" = "l") => {
  if (localCoverDataUrl.value) {
    return localCoverDataUrl.value;
  }
  return musicStore.getSongCover(size);
};

watch(
  () => [musicStore.playSong.id, settingStore.dynamicCover, settingStore.playerType],
  () => getDynamicCover(),
);

// 监听歌曲切换，获取/清理本地封面
watch(
  () => musicStore.playSong.path,
  () => getLocalCover(),
  { immediate: true },
);

onMounted(() => {
  getDynamicCover();
  getLocalCover();
});

onBeforeUnmount(() => {
  // 停止定时器
  dynamicCoverStop();
  // 清理动态封面资源
  cleanupDynamicCover();
  // 清理本地封面资源
  cleanupLocalCover();
});
</script>

<style lang="scss" scoped>
.player-cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70%;
  max-width: 50vh;
  height: auto;
  aspect-ratio: 1 / 1;
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.3s;
  .cover-img {
    width: 100%;
    height: 100%;
    z-index: 1;
    box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
    transition: opacity 0.1s ease-in-out;
  }
  .dynamic-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 32px;
    overflow: hidden;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.8s ease-in-out;
    backface-visibility: hidden;
    transform: translateZ(0);
    &.loaded {
      opacity: 1;
    }
  }
  &.record {
    position: relative;
    max-width: 46vh;
    margin-bottom: 4%;
    .pointer {
      position: absolute;
      width: 30%;
      left: 46%;
      top: -22%;
      z-index: 2;
      transition: transform 0.3s;
      &.classic {
        transform: rotate(-20deg);
        transform-origin: 10% 10%;
      }
      &.straight {
        transform: rotate(-15deg) scaleX(-1);
        transform-origin: 5% 5%;
      }
      &.wooden {
        transform: rotate(-22deg);
        transform-origin: 8% 8%;
        filter: sepia(0.5);
      }
    }
    .cover-img {
      animation: playerCoverRotate 30s linear infinite;
      animation-play-state: paused;
      border-radius: 50%;
      border: 1vh solid #ffffff30;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      :deep(img) {
        border: 1vh solid #ffffff40;
        border-radius: 50%;
        width: 70%;
        height: 70%;
        object-fit: cover;
      }
      .cover-loading {
        position: absolute;
        height: 100%;
        padding-bottom: 0;
        .loading-img {
          top: auto;
          left: auto;
        }
      }
    }
    // 唱片底部纹理
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
    }
    // 经典黑胶
    &.classic-record {
      .cover-img {
        background:
          linear-gradient(black 0%, transparent, black 98%),
          repeating-radial-gradient(
            circle at 50% 50%,
            #333 0px,
            #333 1px,
            #555 1px,
            #555 2px,
            #444 2px,
            #444 3px
          );
        background-clip: content-box;
      }
    }
    // 彩胶
    &.colored-record {
      .cover-img {
        background:
          linear-gradient(
            135deg,
            rgba(var(--main-cover-color), 0.4),
            transparent,
            rgba(var(--main-cover-color), 0.3)
          ),
          repeating-radial-gradient(
            circle at 50% 50%,
            rgba(255, 255, 255, 0.1) 0px,
            rgba(255, 255, 255, 0.1) 1px,
            transparent 1px,
            transparent 3px
          );
        background-clip: content-box;
      }
    }
    // 透明水晶
    &.crystal-record {
      .cover-img {
        background:
          linear-gradient(45deg, rgba(255, 255, 255, 0.15), transparent, rgba(255, 255, 255, 0.1)),
          repeating-radial-gradient(
            circle at 50% 50%,
            rgba(255, 255, 255, 0.08) 0px,
            rgba(255, 255, 255, 0.08) 1px,
            transparent 1px,
            transparent 4px
          );
        background-clip: content-box;
        box-shadow: 0 0 30px rgba(var(--main-cover-color), 0.2);
      }
    }
    // 复古
    &.retro-record {
      .cover-img {
        filter: sepia(0.3) contrast(0.9);
        background: repeating-radial-gradient(
          circle at 50% 50%,
          #8b7355 0px,
          #8b7355 1px,
          #a0895e 1px,
          #a0895e 3px
        );
        background-clip: content-box;
      }
    }
    // 唱片标签
    .record-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 22%;
      height: 22%;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(var(--main-cover-color), 0.15),
        rgba(var(--main-cover-color), 0.05)
      );
      border: 2px solid rgba(var(--main-cover-color), 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      pointer-events: none;
      .label-text {
        font-size: clamp(8px, 1.2vh, 14px);
        font-weight: 700;
        text-align: center;
        line-height: 1.2;
        color: rgba(var(--main-cover-color), 0.7);
        max-width: 85%;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }
  }
  &.cover {
    border-radius: 32px;
    overflow: hidden;
    transform: scale(0.9);
    &.playing {
      transform: scale(1);
    }
  }
  &.playing {
    .pointer {
      transform: rotate(-8deg);
    }
    .cover-img {
      animation-play-state: running;
    }
  }
}
.full-screen {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 60vw;
  z-index: 0;
  mask-image: linear-gradient(to right, #000 var(--gradient-percent), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, #000 var(--gradient-percent), transparent 100%);
  :deep(img) {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}

// 封面切换过渡
.cover-switch-enter-active {
  transition:
    opacity 0.4s var(--ease-out),
    transform 0.4s var(--ease-out);
}
.cover-switch-leave-active {
  transition:
    opacity 0.25s var(--ease-in-out),
    transform 0.25s var(--ease-in-out);
}
.cover-switch-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.cover-switch-leave-to {
  opacity: 0;
  transform: scale(1.08);
}
</style>
