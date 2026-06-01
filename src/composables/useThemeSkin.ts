import { useSettingStore } from "@/stores";
import { skinPresets, type SkinPreset } from "@/assets/data/skins";

const ACTIVE_SKIN_KEY = "splayer-active-skin";

/**
 * 主题皮肤管理
 */
export const useThemeSkin = () => {
  const settingStore = useSettingStore();

  /** 当前皮肤 ID */
  const activeSkin = useStorage<string>(ACTIVE_SKIN_KEY, "default");

  /** 当前皮肤数据 */
  const currentSkin = computed<SkinPreset>(() => {
    return skinPresets.find((s) => s.key === activeSkin.value) || skinPresets[0];
  });

  /** 应用皮肤设置 */
  const applySkin = (skinKey: string) => {
    const skin = skinPresets.find((s) => s.key === skinKey);
    if (!skin || skin.key === "default") {
      activeSkin.value = "default";
      return;
    }
    activeSkin.value = skinKey;
    // 应用颜色设置
    if (skin.colors.themeMode) settingStore.themeMode = skin.colors.themeMode;
    if (skin.colors.themeColorType) settingStore.themeColorType = skin.colors.themeColorType as any;
    if (skin.colors.themeGlobalColor !== undefined)
      settingStore.themeGlobalColor = skin.colors.themeGlobalColor;
    if (skin.colors.themeVariant) settingStore.themeVariant = skin.colors.themeVariant as any;
    // 应用播放器设置
    if (skin.player.type) settingStore.playerType = skin.player.type;
    if (skin.player.backgroundType) settingStore.playerBackgroundType = skin.player.backgroundType;
    if (skin.player.showSpectrums !== undefined)
      settingStore.showSpectrums = skin.player.showSpectrums;
    if (skin.player.expandAnimation)
      settingStore.playerExpandAnimation = skin.player.expandAnimation;
    if (skin.player.followCoverColor !== undefined)
      settingStore.playerFollowCoverColor = skin.player.followCoverColor;
    // 应用歌词设置
    if (skin.lyric?.position) settingStore.lyricsPosition = skin.lyric.position;
    if (skin.lyric?.blur !== undefined) settingStore.lyricsBlur = skin.lyric.blur;
    if (skin.lyric?.blendMode) settingStore.lyricsBlendMode = skin.lyric.blendMode;
    if (skin.lyric?.transition) settingStore.lyricTransition = skin.lyric.transition;
  };

  /** 重置为默认 */
  const resetSkin = () => {
    activeSkin.value = "default";
  };

  return {
    activeSkin,
    currentSkin,
    applySkin,
    resetSkin,
    skinPresets,
  };
};
