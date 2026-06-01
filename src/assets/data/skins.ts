// 播放器主题皮肤预设
export interface SkinPreset {
  key: string;
  name: string;
  description: string;
  icon: string; // SVG 图标名
  colors: {
    themeMode?: "light" | "dark" | "auto";
    themeColorType?: string;
    themeGlobalColor?: boolean;
    themeVariant?: string;
  };
  player: {
    type?: "cover" | "record" | "fullscreen";
    backgroundType?: "none" | "animation" | "blur" | "color";
    showSpectrums?: boolean;
    expandAnimation?: "up" | "flow";
    followCoverColor?: boolean;
  };
  lyric?: {
    position?: "flex-start" | "center" | "flex-end";
    blur?: boolean;
    blendMode?: "screen" | "plus-lighter";
    transition?: "slide" | "fade";
  };
}

export const skinPresets: SkinPreset[] = [
  {
    key: "default",
    name: "默认",
    description: "跟随当前设置",
    icon: "Palette",
    colors: {},
    player: {},
  },
  {
    key: "night-flux",
    name: "暗夜流光",
    description: "深色 + 蓝紫渐变 + 流体动画 + 频谱",
    icon: "DarkMode",
    colors: {
      themeMode: "dark",
      themeColorType: "purple",
      themeGlobalColor: true,
      themeVariant: "tertiary",
    },
    player: {
      type: "fullscreen",
      backgroundType: "animation",
      showSpectrums: true,
      expandAnimation: "flow",
      followCoverColor: false,
    },
    lyric: { position: "center", blur: false, blendMode: "plus-lighter", transition: "fade" },
  },
  {
    key: "retro-vinyl",
    name: "复古留声机",
    description: "暖棕 + 唱片模式 + 纯色背景",
    icon: "Album",
    colors: {
      themeMode: "dark",
      themeColorType: "amber",
      themeGlobalColor: true,
      themeVariant: "secondary",
    },
    player: {
      type: "record",
      backgroundType: "color",
      showSpectrums: false,
      expandAnimation: "up",
      followCoverColor: false,
    },
    lyric: { position: "flex-start", blur: true, blendMode: "screen", transition: "slide" },
  },
  {
    key: "pure-light",
    name: "极简白昼",
    description: "浅色 + 青绿 + 封面模糊 + 干净清爽",
    icon: "LightTheme",
    colors: {
      themeMode: "light",
      themeColorType: "teal",
      themeGlobalColor: false,
      themeVariant: "primary",
    },
    player: {
      type: "cover",
      backgroundType: "blur",
      showSpectrums: false,
      expandAnimation: "up",
      followCoverColor: true,
    },
    lyric: { position: "flex-start", blur: false, blendMode: "screen", transition: "slide" },
  },
  {
    key: "neon-city",
    name: "霓虹都市",
    description: "深色 + 粉紫霓虹 + 频谱发光",
    icon: "AutoAwesome",
    colors: {
      themeMode: "dark",
      themeColorType: "pink",
      themeGlobalColor: true,
      themeVariant: "tertiary",
    },
    player: {
      type: "fullscreen",
      backgroundType: "color",
      showSpectrums: true,
      expandAnimation: "flow",
      followCoverColor: false,
    },
    lyric: { position: "center", blur: false, blendMode: "plus-lighter", transition: "fade" },
  },
  {
    key: "ink-wash",
    name: "墨韵",
    description: "深色 + 青灰 + 封面模糊 + 淡雅沉静",
    icon: "InkPen",
    colors: {
      themeMode: "dark",
      themeColorType: "blueGrey",
      themeGlobalColor: true,
      themeVariant: "neutral",
    },
    player: {
      type: "cover",
      backgroundType: "blur",
      showSpectrums: false,
      expandAnimation: "up",
      followCoverColor: true,
    },
    lyric: { position: "center", blur: true, blendMode: "screen", transition: "slide" },
  },
];
