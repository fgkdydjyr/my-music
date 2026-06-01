<template>
  <Provider>
    <router-view />
    <LyricArtMode :visible="statusStore.showLyricArt" @close="statusStore.showLyricArt = false" />
  </Provider>
</template>

<script setup lang="ts">
import { useStatusStore } from "@/stores";

const statusStore = useStatusStore();

// 快捷键 Ctrl+L 打开歌词艺术模式
onKeyStroke("l", (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    statusStore.showLyricArt = !statusStore.showLyricArt;
  }
});
</script>
