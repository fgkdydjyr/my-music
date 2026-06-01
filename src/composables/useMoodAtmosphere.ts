import { usePlayerController } from "@/core/player/PlayerController";

export type MoodType = "calm" | "cheerful" | "passionate" | "melancholic" | "psychedelic";

interface MoodConfig {
  label: string;
  themeColorType: string;
  backgroundFlowSpeed: number;
  spectrumStyle: string;
  lyricBlendMode: "screen" | "plus-lighter";
}

export const moodConfigs: Record<MoodType, MoodConfig> = {
  calm: {
    label: "平静",
    themeColorType: "blue",
    backgroundFlowSpeed: 1.5,
    spectrumStyle: "soft",
    lyricBlendMode: "plus-lighter",
  },
  cheerful: {
    label: "欢快",
    themeColorType: "orange",
    backgroundFlowSpeed: 5,
    spectrumStyle: "bouncy",
    lyricBlendMode: "screen",
  },
  passionate: {
    label: "激昂",
    themeColorType: "red",
    backgroundFlowSpeed: 8,
    spectrumStyle: "intense",
    lyricBlendMode: "screen",
  },
  melancholic: {
    label: "忧郁",
    themeColorType: "indigo",
    backgroundFlowSpeed: 1,
    spectrumStyle: "dim",
    lyricBlendMode: "plus-lighter",
  },
  psychedelic: {
    label: "迷幻",
    themeColorType: "purple",
    backgroundFlowSpeed: 6,
    spectrumStyle: "colorful",
    lyricBlendMode: "plus-lighter",
  },
};

const SMOOTHING = 0.3;
let smoothedEnergy = 0;
let smoothedBass = 0;
let currentMood: MoodType = "calm";

/**
 * 根据音频特征分析情绪
 */
export const useMoodAtmosphere = () => {
  const player = usePlayerController();

  /** 分析当前歌曲情绪 */
  const analyzeMood = (): MoodType => {
    const data = player.getSpectrumData();
    if (!data) return currentMood;

    const arr = Array.from(data);
    // 低频能量 (bass)
    const bassAvg = arr.slice(0, 5).reduce((a, b) => a + b, 0) / 5 / 255;
    // 中频能量
    const midAvg = arr.slice(5, 20).reduce((a, b) => a + b, 0) / 15 / 255;
    // 高频能量
    const highAvg = arr.slice(20).reduce((a, b) => a + b, 0) / (arr.length - 20) / 255;

    // 平滑处理
    smoothedBass = smoothedBass * (1 - SMOOTHING) + bassAvg * SMOOTHING;
    smoothedEnergy =
      smoothedEnergy * (1 - SMOOTHING) + ((bassAvg + midAvg + highAvg) / 3) * SMOOTHING;

    const energy = smoothedEnergy;
    const bass = smoothedBass;

    if (bass > 0.6 && energy > 0.5) return "passionate";
    if (energy > 0.4 && bass > 0.3) return "cheerful";
    if (bass > 0.5 && energy > 0.35) return "psychedelic";
    if (energy < 0.2 && bass < 0.15) return "melancholic";
    return "calm";
  };

  /** 获取当前情绪 */
  const getCurrentMood = () => currentMood;

  /** 更新情绪分析 */
  const updateMood = () => {
    currentMood = analyzeMood();
    return currentMood;
  };

  return {
    analyzeMood,
    getCurrentMood,
    updateMood,
    moodConfigs,
  };
};
