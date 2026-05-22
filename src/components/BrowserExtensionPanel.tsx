/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Chrome, Copy, Check, Sparkles, Terminal, Cpu, FileJson, Layers } from "lucide-react";
import { extensionCode } from "../extension-files";

interface BrowserExtensionPanelProps {
  isJapanese: boolean;
  onSimulateImport: (scrapedText: string, profileName: string) => void;
}

export function BrowserExtensionPanel({ isJapanese, onSimulateImport }: BrowserExtensionPanelProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'manifest' | 'popupHtml' | 'popupJs'>('info');
  const [simulatedScrapeSuccess, setSimulatedScrapeSuccess] = useState(false);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  const handleSimulateScrape = () => {
    const mockProfileText = `
Johnathan Doe
Senior Cloud Solutions Architect at Mercari, Tokyo, Japan
Email: johnathan.doe.tech@example.com
Phone: +81-80-1234-5678

Summary:
Results-driven Solutions Architect with 8+ years of global experience designing and spearheading containerized microservice architectures. Strong background in AWS migrations, Kubernetes, CI/CD pipeline scalability, and leading multi-functional DevOps engineers.

Work Experience:
Lead Cloud Engineer | Mercari, Inc. (Tokyo, Japan)
April 2021 – Present
- Spearheaded AWS database migration to Amazon Aurora, reducing transaction latencies by 35%.
- Designed and maintained infrastructure using Terraform across 12 product squads.
- Led a team of 6 DevOps specialists, fostering transition toward automated Kubernetes deployments.
- Slashed pipeline build errors by 40% through extensive container optimization and Docker caching.

Senior Software Engineer | Rakuten Mobile (Tokyo, Japan)
September 2018 – March 2021
- Developed scalable billing system microservices in Go and TypeScript.
- Supervised technical agile standups and worked with overseas development divisions.
- Optimised PostgreSQL queries, avoiding performance degradation during high-traffic sales.

Qualifications:
- AWS Certified Solutions Architect – Professional (AWS SAP) - 2022
- Certified Kubernetes Administrator (CKA) - 2021
- JLPT N2 (Japanese Language Proficiency Test) - 2020

Skills:
- Backend: Go, Node.js, TypeScript, Python, PostgreSQL
- Cloud: AWS (EC2, Aurora, EKS, RDS), GCP, Kubernetes, Terraform, Docker, CI/CD, Github Actions
`;
    onSimulateImport(mockProfileText, "Johnathan Doe (Scraped via Extension)");
    setSimulatedScrapeSuccess(true);
    setTimeout(() => setSimulatedScrapeSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
        <div className="p-2 bg-slate-50 rounded-lg text-amber-600">
          <Chrome className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-slate-900">
            {isJapanese ? "ブラウザ拡張機能の統合" : "Optional Browser Extension Setup"}
          </h2>
          <p className="text-xs text-slate-500">
            {isJapanese 
              ? "LinkedInやウェブ履歴書からテキストを一クリックで抽出し、システムに転送します。" 
              : "Instantly grab details from LinkedIn profiles/resumes and import them directly into the translator."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="browser-extension-grid">
        {/* Left Side: Setup Onboarding */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              {isJapanese ? "1分でローカルに導入可能" : "Get It Up in Under a Minute"}
            </h3>
            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside pl-1" id="extension-install-steps">
              <li>
                {isJapanese
                  ? "お手元の作業フォルダに「shokumukeirekisho-scanner」という空のフォルダーを作成します。"
                  : "Create an empty folder named 'shokumukeirekisho-scanner' on your desktop."}
              </li>
              <li>
                {isJapanese
                  ? "右側のタブからソースコードをコピーし、それぞれファイル名通りにフォルダー内に保存します。"
                  : "Copy each tab's source code on the right and save them in the folder using the specified file names."}
              </li>
              <li>
                {isJapanese
                  ? "Chromeブラウザで chrome://extensions を開き、右上の「デベロッパー モード」を有効にします。"
                  : "Open chrome://extensions in your Chrome browser and enable 'Developer Mode' (top right)."}
              </li>
              <li>
                {isJapanese
                  ? "「パッケージ化されていない拡張機能を読み込む」ボタンを押し、作成したフォルダを指定すれば完了です！"
                  : "Click 'Load unpacked' and select your extension folder to activate the scanner!"}
              </li>
            </ol>
          </div>

          {/* Interactive Extension Simulator */}
          <div className="border border-slate-100 rounded-xl p-5 bg-gradient-to-br from-indigo-50/50 to-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                {isJapanese ? "ライブ拡張機能シミュレーター" : "Live Scanner Extension Simulator"}
              </h4>
              <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                PROTOTYPE ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              {isJapanese
                ? "ブラウザに拡張機能を導入した際の動作を、以下のモックLinkedInプロフィールを用いて体験できます。"
                : "Experience the real-time extraction flow right here. This simulates clicking the Chrome extension button on Johnathan's LinkedIn page."}
            </p>

            {/* LinkedIn Mock Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs relative overflow-hidden text-left">
              <div className="h-2 bg-indigo-600 absolute top-0 left-0 right-0"></div>
              <div className="flex items-start gap-3 mt-1.5">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold shrink-0 text-sm">
                  JD
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-slate-900">Johnathan Doe</h5>
                  <p className="text-xs text-indigo-600 font-medium">Senior Solutions Architect @ Mercari, Inc. Tokyo</p>
                  <p className="text-[10px] text-slate-400">Tokyo, Japan | Information Technology & Services</p>
                </div>
              </div>

              {/* simulated browser extension trigger button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between" id="simulator-action-strip">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  LinkedIn Active Tab
                </div>
                <button
                  type="button"
                  onClick={handleSimulateScrape}
                  className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-3.5 py-1.5 rounded-md shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Chrome className="w-3.5 h-3.5 text-indigo-300" />
                  {isJapanese ? "拡張機能でプロフィールをスキャン" : "Scan Profile with Extension"}
                </button>
              </div>
            </div>

            {simulatedScrapeSuccess && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs text-center flex items-center justify-center gap-1.5 animate-bounce">
                <Check className="w-4 h-4 text-emerald-600" />
                <strong>{isJapanese ? "シミュレーション成功！" : "Simulation successful!"}</strong>
                {isJapanese ? "英語の履歴書がインポートされました。上部の「AI翻訳」タブで確認してください。" : "CV loaded into the translator. Switch to the 'AI Translate' view to run translation."}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tabbed Code Blocks */}
        <div className="lg:col-span-5 flex flex-col h-112 border border-slate-200 rounded-xl overflow-hidden font-mono text-xs">
          {/* Tabs header */}
          <div className="bg-slate-900 p-2 text-slate-400 flex items-center gap-1 overflow-x-auto border-b border-slate-800">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${activeTab === 'info' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'}`}
            >
              Readme
            </button>
            <button
              onClick={() => setActiveTab('manifest')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${activeTab === 'manifest' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'}`}
            >
              <FileJson className="w-3 h-3 text-indigo-400" /> manifest.json
            </button>
            <button
              onClick={() => setActiveTab('popupHtml')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${activeTab === 'popupHtml' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'}`}
            >
              <Terminal className="w-3 h-3 text-emerald-400" /> popup.html
            </button>
            <button
              onClick={() => setActiveTab('popupJs')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${activeTab === 'popupJs' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'}`}
            >
              <Cpu className="w-3 h-3 text-amber-400" /> popup.js
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="bg-slate-950 p-4 text-slate-300 flex-1 overflow-y-auto text-left relative group">
            {activeTab === 'info' && (
              <div className="space-y-3 font-sans text-sm p-1 leading-relaxed">
                <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <Chrome className="w-4 h-4 text-indigo-400" />
                  {isJapanese ? "拡張コード概要" : "Extension Code Architecture"}
                </h4>
                <p className="text-xs text-slate-400">
                  {isJapanese 
                    ? "このブラウザ拡張機能は、ワンクリックで現在開いているページのメインDOMをクロールし、テキストコンテンツをインテリジェントに抽出して、安全なクエリパラメーターを用いて本アプリにルーティングします。" 
                    : "This tool queries active tabs, parses resume structures from the active DOM content, and deep-links it safely to the CV Builder with pre-loaded profiles."}
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-xs text-slate-300">
                  <div className="font-semibold text-indigo-300">File Structure:</div>
                  <pre className="font-mono text-[11px] text-slate-400 leading-tight">
{`shokumukeirekisho-scanner/
├── manifest.json
├── popup.html
└── popup.js`}
                  </pre>
                </div>
                <p className="text-xs text-amber-400 bg-amber-950/30 border border-amber-900/40 p-2.5 rounded-lg flex gap-1.5">
                  <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  {isJapanese 
                    ? "ローカルで本番のアプリケーションURL（自前でホストされる場合）にアクセスするようPopup.jsを自由に書き換え可能です。"
                    : "You can customize popup.js destination endpoints to matches your deployed production domain easily."}
                </p>
              </div>
            )}

            {activeTab !== 'info' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const codeBlock = activeTab === 'manifest' 
                      ? extensionCode.manifest 
                      : activeTab === 'popupHtml' 
                      ? extensionCode.popupHtml 
                      : extensionCode.popupJs;
                    handleCopy(codeBlock, activeTab);
                  }}
                  className="absolute right-3 top-3 bg-slate-800 text-slate-300 hover:bg-slate-700 p-1.5 rounded border border-slate-700 transition"
                  title="Copy Code"
                >
                  {copiedSection === activeTab ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <pre className="leading-5 text-[11px] font-mono whitespace-pre overflow-x-auto">
                  {activeTab === 'manifest' && extensionCode.manifest}
                  {activeTab === 'popupHtml' && extensionCode.popupHtml}
                  {activeTab === 'popupJs' && extensionCode.popupJs}
                </pre>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
