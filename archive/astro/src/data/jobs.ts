/**
 * 招聘岗位数据集中管理
 * 仅保留函数与类型，实际数据存放在根目录 data/jobs.ts 便于维护
 */

import { jobsData } from '../../data/jobs';
import type { Job } from '../../data/jobs';

export type { Job };
export { jobsData };

/**
 * 获取所有招聘职位（简化列表）
 */
export function getAllJobs(): Job[] {
  return Object.values(jobsData);
}

/**
 * 根据职位 ID 获取详细信息
 */
export function getJobById(id: string): Job | undefined {
  return jobsData[id];
}

/**
 * 按部门筛选职位
 */
export function getJobsByDepartment(department: string): Job[] {
  return Object.values(jobsData).filter((job) => job.department === department);
}

/**
 * 获取所有职位部门（去重）
 */
export function getAllDepartments(): string[] {
  const departments = new Set<string>();
  Object.values(jobsData).forEach((job) => {
    if (job.department) {
      departments.add(job.department);
    }
  });
  return Array.from(departments);
}

/**
 * 按职位类型筛选
 */
export function getJobsByType(type: string): Job[] {
  return Object.values(jobsData).filter((job) => job.type === type);
}

/**
 * 获取所有职位 ID
 */
export function getAllJobIds(): string[] {
  return Object.keys(jobsData);
}

// 向后兼容：保留 jobs 导出
export const jobs: Job[] = getAllJobs();

export default jobsData;
