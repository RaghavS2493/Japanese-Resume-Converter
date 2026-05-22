/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Check, Loader, Shield, Sparkles, Building2, UserCheck, Languages, CheckCircle } from "lucide-react";

interface ProgressPanelProps {
  isJapanese: boolean;
  isActive: boolean;
  onFinishedSimulation?: () => void;
}

interface Milestone {
  id: number;
  labelEn: string;
  labelJa: string;
  icon: React.ReactNode;
}

export function CustomProgressPanel({ isJapanese, isActive }: ProgressPanelProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const milestones: Milestone[] = [
    {
      id: 0,
      labelEn: "Reading uploaded document structure & text data...",
      labelJa: "履歴書データのアップロードおよび文字解析を実行中...",
      icon: <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
    },
    {
      id: 1,
      labelEn: "Parsing personal biography (Name, Furigana, Contacts)...",
      labelJa: "基本プロフィールの識別および漢字・カタカナ読み推測中...",
      icon: <UserCheck className="w-4 h-4 text-sky-500" />
    },
    {
      id: 2,
      labelEn: "Analyzing employment timeline & matching capital structure...",
      labelJa: "在籍企業の事業区分、雇用形態、従業員・資本実績を分析中...",
      icon: <Building2 className="w-4 h-4 text-emerald-500" />
    },
    {
      id: 3,
      labelEn: "Translating engineering, tech-stack & business action verbs...",
      labelJa: "専門技術用語、所属ポジション、責任実績を日本語HR規格へ翻訳中...",
      icon: <Languages className="w-4 h-4 text-amber-500" />
    },
    {
      id: 4,
      labelEn: "Formulating professional 職務要約 (Job Summary)...",
      labelJa: "職歴全体を要約した、200〜300文字の「職務要約」を作成中...",
      icon: <Sparkles className="w-4 h-4 text-fuchsia-500" />
    },
    {
      id: 5,
      labelEn: "Structuring professional Self-PR & Formatting final layout...",
      labelJa: "実績を強調する「自己PR」および「活かせる経験」の最終フォーマット生成中...",
      icon: <Shield className="w-4 h-4 text-violet-500" />
    }
  ];

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      return;
    }

    // Process simulation mimicking actual server-side multi-pass parsing
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < milestones.length - 1) {
          return prev + 1;
        }
        return prev; // Hold at last step until server responds back
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isActive, milestones.length]);

  if (!isActive) return null;

  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 border border-slate-800 max-w-lg w-full mx-auto" id="progress-loader-panel">
      {/* Top Graphic */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 mb-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full border border-indigo-500/30 animate-ping"></div>
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-sky-500 rounded-full flex items-center justify-center shadow-lg">
            <Loader className="w-7 h-7 text-white animate-spin" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-base tracking-tight text-white flex items-center gap-1.5 justify-center">
            {isJapanese ? "AI Shokumukeirekisho を生成中" : "AI CV Translation in Progress"}
          </h3>
          <p className="text-xs text-slate-400">
            {isJapanese 
              ? "Gemini 3.5 AI があなたの履歴書を最高水準の職務経歴書へ変換し、最適化しています" 
              : "Gemini 3.5 AI is parsing and writing native Japanese Shokumukeirekisho documents..."}
          </p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="relative w-full h-1 bg-slate-800 rounded-full mb-6overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-1000"
          style={{ width: `${((currentStep + 1) / milestones.length) * 100}%` }}
        ></div>
      </div>

      {/* Milestones Checklist */}
      <div className="space-y-3 text-left">
        {milestones.map((milestone, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div 
              key={milestone.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                isCurrent 
                  ? "bg-indigo-950/40 border-indigo-500/40 opacity-100" 
                  : isDone 
                  ? "bg-slate-950/40 border-slate-900/40 opacity-70" 
                  : "bg-transparent border-transparent opacity-35"
              }`}
            >
              <div className="mt-0.5 max-h-5 min-h-5 max-w-5 min-w-5 flex items-center justify-center rounded-full bg-slate-800 shrink-0">
                {isDone ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                ) : isCurrent ? (
                  <Loader className="w-3 h-3 text-indigo-400 animate-spin" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                )}
              </div>
              <div className="space-y-0.5">
                <p className={`text-xs font-semibold ${isCurrent ? "text-indigo-300" : isDone ? "text-slate-300" : "text-slate-500"}`}>
                  {isJapanese ? milestone.labelJa : milestone.labelEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Seal */}
      <div className="mt-6 border-t border-slate-800/80 pt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
        <Shield className="w-3.5 h-3.5 text-slate-600" />
        SECURE END-TO-END DATA ENCRYPTION & KEY CLOUD MANAGEMENT
      </div>
    </div>
  );
}
