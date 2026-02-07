// 批量UI改造脚本
// 自动将《列车求生》的UI文本替换为《星航荒宇》的文本

const fs = require('fs');
const path = require('path');

// 文本替换规则
const REPLACEMENTS = [
  // 核心概念
  { from: /列车/g, to: '航船' },
  { from: /列车长/g, to: '航船员' },
  { from: /列车币/g, to: '联邦信用点' },
  { from: /站台/g, to: '星球' },
  { from: /荒原/g, to: '星际空间' },
  { from: /求生者/g, to: '拓荒队员' },
  { from: /幸存者/g, to: '联邦拓荒队员' },
  
  // 资源物品
  { from: /木材/g, to: '基础合金' },
  { from: /金属/g, to: '星核碎片' },
  { from: /食物/g, to: '能量块' },
  { from: /水/g, to: '冷却液' },
  { from: /燃料/g, to: '能量电池' },
  
  // 状态属性
  { from: /饥饿/g, to: '能量储备' },
  { from: /口渴/g, to: '冷却液水平' },
  { from: /精神/g, to: '神能' },
  
  // 系统功能
  { from: /列车升级/g, to: '航船改装' },
  { from: /列车状态/g, to: '航船状态' },
  { from: /站台探索/g, to: '星球探索' },
  { from: /荒原行驶/g, to: '星际跃迁' },
  { from: /神明遗迹/g, to: '神域探索' },
  
  // 敌人
  { from: /怪物/g, to: '虚空生物' },
  { from: /野兽/g, to: '虚空野兽' },
  
  // 动作
  { from: /修理列车/g, to: '维修航船' },
  { from: /升级列车/g, to: '改装航船' },
  { from: /出发探索/g, to: '启动跃迁' },
  { from: /返回列车/g, to: '返回航船' },
  
  // 地点类型
  { from: /普通站台/g, to: '常规星球' },
  { from: /神话站台/g, to: '神域星球' },
  { from: /安全区/g, to: '联邦辖区' },
  
  // 界面标题
  { from: /选择探索地点/g, to: '选择目标星球' },
  { from: /行驶中/g, to: '跃迁中' },
  { from: /收集物资/g, to: '采集资源' },
  { from: /到达/g, to: '跃迁至' },
  { from: /到达目的地/g, to: '跃迁完成' },
  { from: /狩猎怪物/g, to: '狩猎虚空生物' },
  { from: /挑战BOSS/g, to: '挑战虚空首领' },
  { from: /BOSS已刷新/g, to: '首领已刷新' },
  { from: /已通关/g, to: '已探索' },
  { from: /耐久度/g, to: '虚空防护' },
  { from: /速度/g, to: '跃迁速度' },
  { from: /容量/g, to: '货舱容量' },
];

// 图标替换规则
const ICON_REPLACEMENTS = [
  { from: /🚂/g, to: '🚀' },
  { from: /🚃/g, to: '🛸' },
  { from: /🚉/g, to: '🪐' },
  { from: /🌾/g, to: '⭐' },
  { from: /🪵/g, to: '🔩' },
  { from: /⛓️/g, to: '💎' },
  { from: /🍞/g, to: '🔋' },
  { from: /💧/g, to: '❄️' },
  { from: /👹/g, to: '👾' },
  { from: /🐺/g, to: '👽' },
];

// 颜色替换规则
const COLOR_REPLACEMENTS = [
  { from: /#fbbf24/g, to: '#00d4ff' },
  { from: /#d97706/g, to: '#0099cc' },
  { from: /#92400e/g, to: '#1a1f3a' },
  { from: /#78350f/g, to: '#0a0e27' },
  { from: /#1a1a1a/g, to: '#0a0e27' },
  { from: /#2d2d2d/g, to: '#1a1f3a' },
  { from: /#4b5563/g, to: '#2a3050' },
];

// 样式替换规则
const STYLE_REPLACEMENTS = [
  // 背景色
  { from: /backgroundColor: ['"]#1a1a1a['"]/g, to: "background: 'linear-gradient(180deg, rgba(26, 31, 58, 0.95) 0%, rgba(10, 14, 39, 0.95) 100%)'" },
  { from: /backgroundColor: ['"]#2d2d2d['"]/g, to: "background: 'rgba(26, 31, 58, 0.8)'" },
  
  // 边框色
  { from: /border: ['"]1px solid #4b5563['"]/g, to: "border: '1px solid rgba(0, 212, 255, 0.3)'" },
  { from: /borderBottom: ['"]1px solid #4b5563['"]/g, to: "borderBottom: '1px solid rgba(0, 212, 255, 0.3)'" },
  
  // 文字色
  { from: /color: ['"]#9ca3af['"]/g, to: "color: '#a1a1aa'" },
  { from: /color: ['"]#fbbf24['"]/g, to: "color: '#00d4ff'" },
];

function transformFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 应用文本替换
  REPLACEMENTS.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });
  
  // 应用图标替换
  ICON_REPLACEMENTS.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });
  
  // 应用颜色替换
  COLOR_REPLACEMENTS.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });
  
  // 应用样式替换
  STYLE_REPLACEMENTS.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已改造: ${path.basename(filePath)}`);
    return true;
  }
  
  console.log(`⏭️  跳过: ${path.basename(filePath)} (无需修改)`);
  return false;
}

// 主函数
function main() {
  const screensDir = path.join(__dirname, '..', 'src', 'screens');
  const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));
  
  console.log('《星航荒宇》UI批量改造脚本');
  console.log('========================\n');
  
  let successCount = 0;
  let skipCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(screensDir, file);
    const modified = transformFile(filePath);
    if (modified) {
      successCount++;
    } else {
      skipCount++;
    }
  });
  
  console.log('\n========================');
  console.log(`改造完成: ${successCount} 个文件`);
  console.log(`跳过: ${skipCount} 个文件`);
  console.log('总计:', files.length, '个文件');
}

main();
