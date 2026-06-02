<template>
  <div :style="{ opacity: show ? '0.6' : '0.1' }" class="player-spectrum">
    <canvas ref="canvasRef" :style="{ height: height + 'px' }" class="spectrum-line" />
  </div>
</template>

<script setup lang="ts">
import { usePlayerController } from "@/core/player/PlayerController";

const props = defineProps<{
  show: boolean;
  height?: number;
  radius?: number;
  color?: string;
}>();

const player = usePlayerController();

// canvas
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isKeepDrawing = ref<boolean>(true);

/**
 * 根据频率索引获取颜色
 */
const getBarColor = (index: number, total: number, baseColor: string): string => {
  const ratio = index / total;
  // 从暖色到冷色的渐变
  if (baseColor && baseColor !== "#efefef") {
    return baseColor;
  }
  const r = Math.round(120 + 135 * (1 - ratio));
  const g = Math.round(100 + 155 * (1 - ratio * 0.6));
  const b = Math.round(200 + 55 * ratio);
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * 绘制音乐频谱图
 */
const drawSpectrum = () => {
  const spectrumData = player.getSpectrumData();

  if (!spectrumData) return;
  // 转换为普通数组并处理
  const rawData = Array.from(spectrumData).slice(10);
  if (!isKeepDrawing.value || !canvasRef.value) return;
  // 设置画布宽度，最大为 1600
  canvasRef.value.width = document.body.clientWidth >= 1600 ? 1600 : document.body.clientWidth;
  // 设置画布高度
  canvasRef.value.height = props.height || 80;
  // 获取2D上下文
  const ctx: CanvasRenderingContext2D | null = canvasRef.value.getContext("2d");
  // 画布宽高
  const canvasWidth = canvasRef.value.width;
  const canvasHeight = canvasRef.value.height;
  // 频谱数量
  const numBars = Math.floor(rawData.length / 2.5);
  // 圆角半径
  const cornerRadius = props.radius || 2.5;
  // 柱形宽度
  const barWidth = canvasWidth / numBars / 2;
  if (!ctx) return;

  // 清除画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 先绘制底部辉光（半透明柱形堆叠）
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < numBars; i++) {
    const barHeight = (rawData[i] / 255) * canvasHeight;
    if (barHeight <= 0) continue;
    const x = i * barWidth * 2 + barWidth / 2;
    const y = canvasHeight - barHeight;
    ctx.fillStyle = getBarColor(i, numBars, props.color || "#efefef");
    roundRect(ctx, x, y, barWidth, barHeight, cornerRadius);
  }

  // 再绘制实际柱形（叠加在上层）
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < numBars; i++) {
    const barHeight = (rawData[i] / 255) * canvasHeight;
    if (barHeight <= 0) continue;
    const x1 = i * barWidth + canvasWidth / 2 - 2;
    const x2 = canvasWidth / 2 - (i + 1) * barWidth - 2;
    const y = canvasHeight - barHeight;
    ctx.fillStyle = getBarColor(i, numBars, props.color || "#efefef");
    if (barHeight > 0) {
      roundRect(ctx, x1, y, barWidth - 3, barHeight, cornerRadius);
      roundRect(ctx, x2, y, barWidth - 3, barHeight, cornerRadius);
    }
  }
};

/**
 * 绘制圆角矩形
 * @param {CanvasRenderingContext2D} ctx - 2D上下文
 * @param {number} x - 矩形左上角 x 坐标
 * @param {number} y - 矩形左上角 y 坐标
 * @param {number} width - 矩形宽度
 * @param {number} height - 矩形高度
 * @param {number} radius - 圆角半径
 */
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

// 开始绘制频谱
const { pause: pauseDraw, resume: resumeDraw } = useRafFn(
  () => {
    drawSpectrum();
  },
  { immediate: false },
);

onMounted(() => {
  isKeepDrawing.value = true;
  resumeDraw();
});

onBeforeUnmount(() => {
  isKeepDrawing.value = false;
  pauseDraw();
});
</script>

<style lang="scss" scoped>
.player-spectrum {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  opacity: 0.6;
  z-index: -1;
  pointer-events: none;
  transition: opacity 0.3s;
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 40px;
    background: linear-gradient(
      to top,
      rgba(var(--main-cover-color, 239 239 239), 0.08),
      transparent
    );
    pointer-events: none;
    animation: spectrum-glow 2s ease-in-out infinite;
  }
  mask: linear-gradient(
    90deg,
    hsla(0, 0%, 100%, 0) 0,
    hsla(0, 0%, 100%, 0.6) 10%,
    #fff 15%,
    #fff 85%,
    hsla(0, 0%, 100%, 0.6) 90%,
    hsla(0, 0%, 100%, 0)
  );
  -webkit-mask: linear-gradient(
    90deg,
    hsla(0, 0%, 100%, 0) 0,
    hsla(0, 0%, 100%, 0.6) 10%,
    #fff 15%,
    #fff 85%,
    hsla(0, 0%, 100%, 0.6) 90%,
    hsla(0, 0%, 100%, 0)
  );
  .spectrum-line {
    mask: linear-gradient(
      90deg,
      hsla(0, 0%, 100%, 0) 0,
      hsla(0, 0%, 100%, 0.6) 5%,
      #fff 10%,
      #fff 90%,
      hsla(0, 0%, 100%, 0.6) 95%,
      hsla(0, 0%, 100%, 0)
    );
    -webkit-mask: linear-gradient(
      90deg,
      hsla(0, 0%, 100%, 0) 0,
      hsla(0, 0%, 100%, 0.6) 5%,
      #fff 10%,
      #fff 90%,
      hsla(0, 0%, 100%, 0.6) 95%,
      hsla(0, 0%, 100%, 0)
    );
  }
}
</style>
