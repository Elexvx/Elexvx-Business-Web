/**
 * 管理层数据集中管理
 * 仅保留函数与类型，实际数据存放在根目录 data/leaders.ts 便于维护
 */

import { leadersData } from '../../data/leaders';
import type { Leader } from '../../data/leaders';

export type { Leader };
export { leadersData };

/**
 * 获取所有管理层列表（用于列表页）
 * 返回不包含完整 bio 的简化版本
 */
export function getAllLeaders() {
  return Object.values(leadersData).map((leader) => ({
    id: leader.id,
    name: leader.name,
    position: leader.position,
    image: leader.image,
  }));
}

/**
 * 获取单个管理层信息（用于详情页）
 */
export function getLeaderById(id: string): Leader | null {
  return leadersData[id] || null;
}

/**
 * 获取所有管理层 ID 列表（用于静态路由生成）
 */
export function getAllLeaderIds() {
  return Object.keys(leadersData);
}
