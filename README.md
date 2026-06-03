<div align="center">
<img alt="logo" height="100" width="100" src="public/icons/favicon.png" />
<h2>SPlayer</h2>
<p>一个简约的网易云音乐播放器</p>
</div>

## 简介

SPlayer 是一款基于 Vue 3 + Electron 的跨平台音乐播放器，支持网页端和桌面客户端。

## 功能

- 网易云音乐登录（扫码 / 手机号）
- 歌单、专辑、歌手浏览与收藏
- 本地音乐管理（标签编辑、封面修改）
- 桌面歌词、逐字歌词、歌词翻译
- MV 与视频播放
- 音乐频谱、渐入渐出
- 云盘音乐上传与管理
- Subsonic / Navidrome 流媒体服务
- 每日推荐、私人 FM
- Light / Dark 主题切换
- Last.fm Scrobble
- PWA 支持

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI 组件库**：Naive UI
- **桌面端**：Electron
- **后端服务**：Fastify / NeteaseCloudMusicApi Enhanced
- **构建工具**：electron-vite

## 快速开始

```bash
# 安装依赖
pnpm install

# 跳过原生模块构建（如无 Rust 工具链）
$env:SKIP_NATIVE_BUILD = "true"

# 启动开发
pnpm dev

# 构建
pnpm build              # 构建全部
pnpm build:win          # 构建 Windows 客户端
```

## 部署

- **在线演示**：https://music.gegeblog.top
- **Docker**：`docker run -d -p 25884:25884 imsyy/splayer`

## 免责声明

本项目仅供个人学习研究使用，禁止用于商业及非法用途。部分功能使用了网易云音乐的第三方 API 服务。
