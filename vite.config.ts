import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import spaHead from 'vite-plugin-spa-head'

export default defineConfig({
  plugins: [
    react(),
    spaHead({
      title: '2048 | 在线游玩',
      description: '经典2048数字合并游戏，无需下载，即开即玩。通过键盘方向键移动方块，合并相同数字，挑战2048高分！',
      keywords: ['2048', '数字游戏', '益智游戏', '在线游戏', '合并游戏'],
      canonical: 'https://jixiejidiguan.top/',
      og: true,
      twitter: true,
    }),
  ],
})