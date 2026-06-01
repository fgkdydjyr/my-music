export type RecordStyle = "classic" | "colored" | "crystal" | "retro";
export type TonearmStyle = "classic" | "straight" | "wooden";

/**
 * 黑胶唱片样式管理
 */
export const useVinylRecord = () => {
  /** 唱片样式 */
  const recordStyle = useStorage<RecordStyle>("splayer-record-style", "classic");
  /** 唱针样式 */
  const tonearmStyle = useStorage<TonearmStyle>("splayer-tonearm-style", "classic");
  /** 是否显示唱片标签 */
  const showRecordLabel = useStorage<boolean>("splayer-record-label", true);

  /** 唱片样式列表 */
  const recordStyleOptions = [
    { label: "经典黑胶", value: "classic" as RecordStyle },
    { label: "彩胶", value: "colored" as RecordStyle },
    { label: "透明水晶", value: "crystal" as RecordStyle },
    { label: "复古", value: "retro" as RecordStyle },
  ];

  /** 唱针样式列表 */
  const tonearmOptions = [
    { label: "经典 S 型", value: "classic" as TonearmStyle },
    { label: "直线型", value: "straight" as TonearmStyle },
    { label: "木制", value: "wooden" as TonearmStyle },
  ];

  return {
    recordStyle,
    tonearmStyle,
    showRecordLabel,
    recordStyleOptions,
    tonearmOptions,
  };
};
