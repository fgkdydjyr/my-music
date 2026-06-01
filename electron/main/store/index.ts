import { app } from "electron";
import Store from "electron-store";
import { join } from "path";
import { storeLog } from "../logger";
import { defaultAMLLDbServer } from "../utils/config";

storeLog.info("🌱 Store init");

export interface StoreType {
  /** 窗口 */
  window: {
    /** 窗口宽度 */
    width: number;
    /** 窗口高度 */
    height: number;
    /** 窗口位置 x */
    x?: number;
    /** 窗口位置 y */
    y?: number;
    /** 是否最大化 */
    maximized?: boolean;
    /** 是否启用无边框窗口 */
    useBorderless?: boolean;
    /** 缩放系数 (0.5 - 2.0) */
    zoomFactor?: number;
  };
  /** 代理 */
  proxy: string;
  /** amll-db-server */
  amllDbServer: string;
  /** 缓存地址 */
  cachePath: string;
  /** 缓存大小限制 (GB) */
  cacheLimit: number;
  /** websocket */
  websocket: {
    /** 是否启用 */
    enabled: boolean;
    /** 端口 */
    port: number;
  };
  /** 下载线程数 */
  downloadThreadCount?: number;
  /** 启用HTTP2下载 */
  enableDownloadHttp2?: boolean;
  /** macOS 专属设置 */
  macos: {
    /** 状态栏歌词 */
    statusBarLyric: {
      /** 是否启用 */
      enabled: boolean;
    };
  };
  /** 更新通道 */
  updateChannel?: "stable" | "nightly";
}

/**
 * 使用 Store
 * @returns Store<StoreType>
 */
export const useStore = () => {
  return new Store<StoreType>({
    defaults: {
      window: {
        width: 1280,
        height: 800,
        useBorderless: true,
      },
      macos: {
        statusBarLyric: {
          enabled: false,
        },
      },
      proxy: "",
      amllDbServer: defaultAMLLDbServer,
      cachePath: join(app.getPath("userData"), "DataCache"),
      cacheLimit: 10, // 默认 10GB
      // websocket
      websocket: {
        enabled: false,
        port: 25885,
      },
      downloadThreadCount: 8,
      enableDownloadHttp2: true,
      updateChannel: "stable",
    },
  });
};
