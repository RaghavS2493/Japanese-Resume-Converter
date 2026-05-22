/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Copy, Check, Info, BookOpen, Shuffle } from "lucide-react";
import { hrDictionary, standardPhrases } from "../dictionary";

interface DictionaryPanelProps {
  isJapanese: boolean; // Language UI state
}

export function TranslationDictionaryPanel({ isJapanese }: DictionaryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Filter dictionary based on raw search or translation match
  const filteredKeys = Object.keys(hrDictionary).filter((key) => {
    const item = hrDictionary[key];
    const query = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(query) ||
      item.en.toLowerCase().includes(query) ||
      item.ja.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-700">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-slate-900">
            {isJapanese ? "オフラインビジネス辞書" : "Offline Business HR Dictionary"}
          </h2>
          <p className="text-xs text-slate-500">
            {isJapanese 
              ? "職務経歴書に最適な標準表現と英日対訳をオフラインで参照可能" 
              : "Standard HR translation references and copyable active verbs for Shokumukeirekisho"}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-5" id="dict-search-container">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          id="dictionary-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isJapanese ? "単語や英語の表現を検索 (e.g., spearhead, manage)..." : "Search terms or English phrases (e.g., spearhead, manage)..."}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:bg-white transition-all"
        />
      </div>

      {/* Dictionary Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2" id="dict-listings-grid">
        {filteredKeys.length > 0 ? (
          filteredKeys.map((key) => {
            const item = hrDictionary[key];
            const isCopied = copiedKey === key;
            return (
              <div
                key={key}
                className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-semibold bg-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded capitalize">
                      {key.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 font-sans leading-relaxed">
                    {item.en}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed font-sans">
                    {item.ja}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(item.ja, key)}
                  className="p-1 px-1.5 rounded-sm bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors shrink-0 group-hover:opacity-100"
                  title="Copy Translation"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-6 text-slate-400 text-xs">
            {isJapanese ? "見つかりませんでした。" : "No matching business terms."}
          </div>
        )}
      </div>

      {/* Sentence Builders */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-2 mb-3 text-slate-700">
          <Shuffle className="w-4 h-4" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isJapanese ? "英文書から日本語への表現変換例" : "Standard Professional Phrase Transformations"}
          </h4>
        </div>
        <div className="space-y-3">
          {standardPhrases.map((phrase, idx) => {
            const isPhraseCopied = copiedKey === `phr-${idx}`;
            return (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between gap-3 group">
                <div className="space-y-1 text-left">
                  <div className="text-xs text-slate-500 italic">" {phrase.en} "</div>
                  <div className="text-xs font-semibold text-slate-700">→ {phrase.ja}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(phrase.ja, `phr-${idx}`)}
                  className="p-1 rounded-sm bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors shrink-0"
                >
                  {isPhraseCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
