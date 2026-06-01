import type { LyricLine } from "@applemusic-like-lyrics/lyric";

export type Milliseconds = number;

export interface TaskbarConfig {
  mode: "taskbar" | "floating";
  autoMaxWidth: boolean;
  maxWidth: number;
  position: "automatic" | "left" | "right";
  margin: number;
  floatingAlign: "left" | "right";
  floatingAutoWidth: boolean;
  floatingWidth: number;
  floatingHeight: number;
  floatingAlwaysOnTop: boolean;
  enabled: boolean;
  showWhenPaused: boolean;
  showCover: boolean;
  themeMode: "light" | "dark" | "auto";
  fontFamily: string;
  fontWeight: number;
  fontScale: number;
  animationMode: "slide-blur" | "left-sm";
  singleLineMode: boolean;
  showWordLyrics: boolean;
  showTranslation: boolean;
  lineHeight: number;
  mainScale: number;
  subScale: number;
}

export interface TrackData {
  title: string;
  artist: string;
  cover: string;
}

export interface PlaybackState {
  isPlaying: boolean;
}

export interface LyricData {
  lines: LyricLine[];
  type: "line" | "word";
}

export interface ThemeColorData {
  light: string;
  dark: string;
}

export type SyncTickPayload = [Milliseconds, Milliseconds, Milliseconds];

export type SyncStatePayload =
  | {
      type: "full-hydration";
      data: {
        track: TrackData;
        playback: PlaybackState & { tick: SyncTickPayload };
        lyrics: LyricData;
        config: TaskbarConfig;
        lyricLoading: boolean;
        themeColor: ThemeColorData | null;
      };
    }
  | {
      type: "track-change";
      data: TrackData;
    }
  | {
      type: "playback-state";
      data: PlaybackState;
    }
  | {
      type: "lyrics-loaded";
      data: LyricData;
    }
  | {
      type: "config-update";
      data: Partial<TaskbarConfig>;
    }
  | {
      type: "theme-color";
      data: ThemeColorData | null;
    }
  | {
      type: "system-theme";
      data: { isDark: boolean };
    };

export const DEFAULT_TASKBAR_CONFIG: TaskbarConfig = {
  mode: "taskbar",
  autoMaxWidth: true,
  maxWidth: 400,
  position: "automatic",
  margin: 10,
  floatingAlign: "right",
  floatingAutoWidth: true,
  floatingWidth: 300,
  floatingHeight: 48,
  floatingAlwaysOnTop: false,
  enabled: false,
  showWhenPaused: true,
  showCover: true,
  themeMode: "auto",
  fontFamily: "system-ui",
  fontWeight: 400,
  fontScale: 1.0,
  animationMode: "slide-blur",
  singleLineMode: false,
  showWordLyrics: true,
  showTranslation: true,
  lineHeight: 1.1,
  mainScale: 1.0,
  subScale: 0.8,
};

export const TASKBAR_IPC_CHANNELS = {
  UPDATE_CONFIG: "taskbar:update-config",
  GET_OPTION: "taskbar:get-option",
  SET_OPTION: "taskbar:set-option",
  SYNC_STATE: "taskbar:sync-state",
  SYNC_TICK: "taskbar:sync-tick",
  REQUEST_DATA: "taskbar:request-data",
} as const;
