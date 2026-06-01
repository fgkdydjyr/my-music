import { useSettingStore } from "@/stores";
import type { PlayModePayload, RepeatModeType, ShuffleModeType } from "@/types/shared/play-mode";
import { isElectron } from "@/utils/env";
import type { DiscordConfigPayload, MetadataParam, PlaybackStatus, RepeatMode } from "@emi";
import { throttle } from "lodash-es";

/**
 * 封装安全的 IPC 发送方法
 * 仅在 Electron 环境下执行，避免在 Web 浏览器环境报错
 * @param channel IPC 频道名称
 * @param args 传递给主进程的参数
 */
const sendIpc = (channel: string, ...args: any[]) => {
  if (isElectron) {
    window.electron.ipcRenderer.send(channel, ...args);
  }
};

/**
 * 发送播放状态
 * @param isPlaying 是否播放
 */
export const sendPlayStatus = (isPlaying: boolean) => sendIpc("play-status-change", isPlaying);

/**
 * 发送歌曲信息
 * @param title 歌曲标题
 * @param name 歌曲名称
 * @param artist 歌手
 * @param album 专辑
 */
export const sendSongChange = (title: string, name: string, artist: string, album: string) => {
  if (!isElectron) return;
  sendIpc("play-song-change", { title, name, artist, album });
};

/**
 * 发送 Socket 实时进度
 */
export const sendSocketProgress: (currentTime: number, duration: number) => void = throttle(
  (currentTime: number, duration: number) => sendIpc("set-progress", { currentTime, duration }),
  500,
);

/**
 * 发送喜欢状态
 * @param isLiked 是否喜欢
 */
export const sendLikeStatus = (isLiked: boolean) => sendIpc("like-status-change", isLiked);

/**
 * 发送播放模式给托盘
 * @param repeatMode 循环模式 ('off' | 'list' | 'one')
 * @param shuffleMode 随机/心动模式 ('off' | 'on' | 'heartbeat')
 */
export const sendPlayMode = (repeatMode: RepeatModeType, shuffleMode: ShuffleModeType) => {
  if (isElectron) {
    const payload: PlayModePayload = { repeatMode, shuffleMode };
    sendIpc("play-mode-change", payload);
  }
};

///////////////////////////////////////////
//
// 媒体控件
//
///////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type EmiModule = typeof import("@emi"); // 用于 JSDoc

/**
 * @description 通过外部媒体集成模块更新媒体控件和 Discord RPC 的元数据
 * @note 仅在 Electron 上有效
 * @param payload - 参见 {@link MetadataParam}
 * @see {@link EmiModule.updateMetadata 外部媒体集成模块的 `updateMetadata` 方法}
 */
export const sendMediaMetadata = (payload: MetadataParam) =>
  sendIpc("media-update-metadata", payload);

/**
 * @description 通过外部媒体集成模块更新媒体控件和 Discord RPC 的播放状态
 * @note 仅在 Electron 上有效
 * @param status - 参见 {@link PlaybackStatus}
 * @see {@link EmiModule.updatePlayState 外部媒体集成模块的 `updatePlayState` 方法}
 */
export const sendMediaPlayState = (status: PlaybackStatus) =>
  sendIpc("media-update-play-state", { status });

/**
 * @description 通过外部媒体集成模块更新媒体控件的播放速率
 * @note 仅在 Electron 上有效
 * @param rate - 播放速率，1.0 表示正常速度
 * @see {@link EmiModule.updatePlaybackRate 外部媒体集成模块的 `updatePlaybackRate` 方法}
 */
export const sendMediaPlaybackRate = (rate: number) =>
  sendIpc("media-update-playback-rate", { rate });

/**
 * @description 通过外部媒体集成模块更新媒体控件的音量
 * @note 仅在 Electron 上有效
 * @param volume - 音量，范围是 0.0（静音）到 1.0（最大音量）
 * @see {@link EmiModule.updateVolume 外部媒体集成模块的 `updateVolume` 方法}
 */
export const sendMediaVolume = (volume: number) => sendIpc("media-update-volume", { volume });

/**
 * @description 通过外部媒体集成模块更新媒体控件和 Discord RPC 的播放状态
 * @note 仅在 Electron 上有效
 * @param currentTime - 当前的播放进度，单位是毫秒
 * @param totalTime - 总时长，单位是毫秒
 * @param seeked - 是否为 seek 操作触发的更新
 * @see {@link EmiModule.updateTimeline 外部媒体集成模块的 `updateTimeline` 方法}
 */
export const sendMediaTimeline = (currentTime: number, totalTime: number, seeked?: boolean) =>
  sendIpc("media-update-timeline", { currentTime, totalTime, seeked });

/**
 * @description 通过外部媒体集成模块更新媒体控件的播放模式。不会更新 Discord RPC 的播放状态
 * @note 仅在 Electron 上有效
 * @param isShuffling - 当前是否是随机播放模式
 * @param repeatMode - 当前的循环播放模式，参见 {@link RepeatMode}
 * @see {@link EmiModule.updatePlayMode 外部媒体集成模块的 `updatePlayMode` 方法}
 */
export const sendMediaPlayMode = (isShuffling: boolean, repeatMode: RepeatMode) =>
  sendIpc("media-update-play-mode", { isShuffling, repeatMode });

///////////////////////////////////////////
//
// Discord RPC
//
///////////////////////////////////////////

/**
 * @description 启用 Discord RPC
 * @note 仅在 Electron 上有效
 * @see {@link EmiModule.enableDiscordRpc 外部媒体集成模块的 `enableDiscordRpc` 方法}
 */
export const enableDiscordRpc = () => {
  if (!isElectron) return;
  sendIpc("discord-enable");
  // 立即发送当前配置，确保外部媒体集成模块使用正确的设置
  const settingStore = useSettingStore();
  sendIpc("discord-update-config", {
    showWhenPaused: settingStore.discordRpc.showWhenPaused,
    displayMode: settingStore.discordRpc.displayMode,
  });
};

/**
 * @description 禁用 Discord RPC
 * @note 仅在 Electron 上有效
 * @see {@link EmiModule.disableDiscordRpc 外部媒体集成模块的 `disableDiscordRpc` 方法}
 */
export const disableDiscordRpc = () => sendIpc("discord-disable");

/**
 * @description 更新 Discord RPC 配置
 * @note 仅在 Electron 上有效
 * @param config 配置信息，参见 {@link DiscordConfigPayload}
 * @see {@link EmiModule.updateDiscordConfig 外部媒体集成模块的 `updateDiscordConfig` 方法}
 */
export const updateDiscordConfig = (config: DiscordConfigPayload) => {
  const { showWhenPaused, displayMode } = config;
  sendIpc("discord-update-config", {
    showWhenPaused,
    displayMode: displayMode,
  });
};

export const sendMacStatusBarProgress = (data: {
  currentTime: number;
  duration: number;
  offset: number;
}) => sendIpc("mac-statusbar:progress", data);
