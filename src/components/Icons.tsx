// 统一的 SVG 图标组件
// 确保在所有设备上显示一致

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// 飞船图标 - 开始界面主图标
export function SpaceshipIcon({ size = 80, color = '#00d4ff', className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 飞船主体 */}
      <path
        d="M50 5L60 40H75L50 95L25 40H40L50 5Z"
        fill={color}
        filter="url(#glow)"
      />
      {/* 飞船窗口 */}
      <circle cx="50" cy="35" r="8" fill="#1a1f3a" />
      <circle cx="50" cy="35" r="5" fill="#00d4ff" opacity="0.8" />
      {/* 尾焰 */}
      <path
        d="M40 70L50 95L60 70"
        fill="url(#flame)"
