/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PersonalInfo {
  name: string;
  nameEn?: string;
  kana?: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  desiredJob?: string;
  currentTitle?: string;
}

export interface CompanyInfo {
  companyName: string;
  companyNameEn?: string;
  periodStart: string;
  periodEnd: string; // "現在" or "Present" or date like "2024年3月"
  employmentType: '正社員' | '契約社員' | '派遣社員' | 'パート・アルバイト' | '業務委託' | 'その他' | string;
  businessDescription: string; // 事業内容 (What the company does)
  employeesCount?: string;  // 従業員数 (e.g., "50名")
  capital?: string;         // 資本金 (e.g., "1,000万円")
  jobTitle: string;         // 役職・職種
  jobSummaries: string[];   // 担当業務 (Duties)
  achievements: string[];   // 主な実績
  technologies: string[];   // 活かした技術・ツール
}

export interface Qualification {
  name: string;
  date: string; // e.g., "2023年10月"
}

export interface SkillCategory {
  categoryName: string; // e.g., "プログラミング言語", "語学力"
  skills: string[];     // Array of skills/tools
}

export interface ShokumukeirekishoData {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;          // e.g., "職務経歴書_システムエンジニア"
  personalInfo: PersonalInfo;
  jobSummary: string;     // 職務要約 (Job Summary)
  competencies: string[]; // 活かせる経験・知識 (Core Competencies)
  workHistory: CompanyInfo[]; // 職務経歴 (Employment history with detail)
  qualifications: Qualification[]; // 資格・免許
  skills: SkillCategory[]; // スキル・テクニカルスキル
  selfPR: string;         // 自己PR (Self PR)
}

export interface SavedProfile {
  id: string;
  userId: string | null; // guest / authenticated
  createdAt: string;
  updatedAt: string;
  name: string;
  originalResumeText: string;
  data: ShokumukeirekishoData;
}

// Multi-language UI Translation dictionary type
export interface Dictionary {
  [key: string]: {
    en: string;
    ja: string;
  };
}
