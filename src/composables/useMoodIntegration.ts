import { useSettingStore } from "@/stores";
import { useMoodAtmosphere, type MoodType } from "./useMoodAtmosphere";

let lastMood: MoodType | null = null;
const MOOD_SWITCH_COOLDOWN = 5000; // 5秒内不重复切换
let lastSwitchTime = 0;

/**
 * 将情绪氛围联动集成到播放器更新循环
 */
export const useMoodIntegration = () => {
  const settingStore = useSettingStore();
  const { updateMood } = useMoodAtmosphere();

  /** 更新氛围（应在每帧或节拍中调用） */
  const tickMood = () => {
    if (!settingStore.moodAtmosphere) return;
    if (!settingStore.showSpectrums) return;

    const now = Date.now();
    if (now - lastSwitchTime < MOOD_SWITCH_COOLDOWN) return;

    const mood = updateMood();
    if (mood === lastMood) return;
    lastMood = mood;
    lastSwitchTime = now;

    // 应用情绪对应的主题色
    applyMoodTheme(mood);
  };

  return { tickMood };
};

/** 情绪-主题色映射 */
const moodThemeMap: Record<MoodType, string> = {
  calm: "blue",
  cheerful: "orange",
  passionate: "red",
  melancholic: "indigo",
  psychedelic: "purple",
};

/** 应用情绪主题 */
const applyMoodTheme = (mood: MoodType) => {
  const settingStore = useSettingStore();
  const colorType = moodThemeMap[mood];
  if (colorType) {
    settingStore.themeColorType = colorType as any;
  }
};
