/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Printer, Download, Eye, HelpCircle } from "lucide-react";
import { ShokumukeirekishoData } from "../types";

interface PreviewProps {
  data: ShokumukeirekishoData;
  isJapanese: boolean;
}

export function ShokumukeirekishoPreview({ data, isJapanese }: PreviewProps) {
  const printDoc = () => {
    window.print();
  };

  const getFormatDate = () => {
    const today = new Date();
    return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  };

  const downloadExportedDoc = () => {
    const printableContent = document.getElementById("printable-area")?.innerHTML;
    if (!printableContent) return;

    // Define beautiful, comprehensive styling mapped from our index.css theme
    const styleBlock = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=JetBrains+Mono:wght@400;500&display=swap');
      
      * {
        box-sizing: border-box;
      }
      body {
        background-color: #FDFCFB;
        color: #1A1A1A;
        font-family: "Plus Jakarta Sans", "Inter", sans-serif;
        margin: 0;
        padding: 40px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
      }
      
      .download-instructions {
        width: 100%;
        max-width: 210mm;
        background-color: #FCFAF7;
        border: 1px solid #D1B894;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 24px;
        font-size: 13px;
        line-height: 1.6;
        color: #666;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      
      .download-instructions strong {
        color: #1A1A1A;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      #printable-area {
        width: 100%;
        max-width: 210mm;
        min-height: 297mm;
        background: #FFFFFF;
        padding: 20mm;
        border: 1px solid #E5E5E5;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        font-family: "Playfair Display", Georgia, serif;
        text-align: left;
        color: #1A1A1A;
      }

      /* Tailwind utility mappings for high rendering accuracy */
      .font-sans { font-family: "Plus Jakarta Sans", "Inter", sans-serif; }
      .font-mono { font-family: "JetBrains Mono", monospace; }
      .font-serif { font-family: "Playfair Display", Georgia, serif; }
      
      .bg-\\[\\#F9F9F9\\] { background-color: #F9F9F9; }
      .bg-\\[\\#FCFAF7\\] { background-color: #FCFAF7; }
      .bg-\\[\\#FCFAF7\\]\\/55 { background-color: rgba(252, 250, 247, 0.55); }
      
      .border-editorial-border { border-color: #E5E5E5; }
      .border-editorial-text { border-color: #1A1A1A; }
      .border-b-2 { border-bottom: 2px solid #1A1A1A; }
      .border-b { border-bottom: 1px solid #E5E5E5; }
      .border-l-4 { border-left: 4px solid #1A1A1A; }
      .border-t { border-top: 1px solid #E5E5E5; }
      .border-dashed { border-style: dashed; }
      .border-\\[\\#F5F5F5\\] { border-color: #F5F5F5; }
      
      .text-editorial-text { color: #1A1A1A; }
      .text-brand-gold { color: #D1B894; }
      .text-\\[\\#666\\] { color: #666; }
      .text-\\[\\#888\\] { color: #888; }
      
      .pb-3 { padding-bottom: 12px; }
      .pb-6 { padding-bottom: 24px; }
      .pt-1 { padding-top: 4px; }
      .pt-2\\.5 { padding-top: 10px; }
      .py-1\\.5 { padding-top: 6px; padding-bottom: 6px; }
      .py-2 { padding-top: 8px; padding-bottom: 8px; }
      .px-3 { padding-left: 12px; padding-right: 12px; }
      
      .mb-2 { margin-bottom: 8px; }
      .mb-3 { margin-bottom: 12px; }
      .mb-4 { margin-bottom: 16px; }
      .mb-6 { margin-bottom: 24px; }
      .mb-8 { margin-bottom: 32px; }
      
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-justify { text-align: justify; }
      
      .text-xl { font-size: 20px; }
      .text-sm { font-size: 14px; }
      .text-xs { font-size: 12px; }
      .text-\\[10px\\] { font-size: 10px; }
      .text-\\[11px\\] { font-size: 11px; }
      
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-medium { font-weight: 500; }
      
      .tracking-widest { letter-spacing: 0.15em; }
      .tracking-wider { letter-spacing: 0.08em; }
      .tracking-wide { letter-spacing: 0.04em; }
      
      .leading-relaxed { line-height: 1.625; }
      .leading-loose { line-height: 2; }
      .leading-tight { line-height: 1.25; }
      
      .list-disc { list-style-type: disc; }
      .pl-4 { padding-left: 16px; }
      .pl-5 { padding-left: 20px; }
      .pl-32 { padding-left: 128px; }
      .w-28 { width: 112px; }
      .w-32 { width: 128px; }
      .underline { text-decoration: underline; }
      .ml-1 { margin-left: 4px; }
      .ml-2 { margin-left: 8px; }
      .indent-4 { text-indent: 16px; }
      .whitespace-pre-wrap { white-space: pre-wrap; }
      
      .flex { display: flex; }
      .flex-wrap { flex-wrap: wrap; }
      .justify-between { justify-content: space-between; }
      .items-baseline { align-items: baseline; }
      .grid { display: grid; }
      .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .gap-3 { gap: 12px; }
      
      @media print {
        body {
          background: white !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .download-instructions {
          display: none !important;
        }
        #printable-area {
          border: none !important;
          box-shadow: none !important;
          padding: 20mm !important;
          width: 210mm !important;
          min-height: 297mm !important;
          display: block !important;
        }
        @page {
          size: A4 portrait;
          margin: 0;
        }
      }
    `;

    const instructionsTextHtml = isJapanese 
      ? `<strong>PDFエクスポート手順:</strong> このスタンドアロン文書は、AI StudioのiFrame制限をすべてバイパスして高解像度A4ベクターPDFを作成するためにエクスポートされました。<br/>1. ブラウザにこの印刷画面が自動的に立ち上がらない場合は、キーボードの <strong>Ctrl + P</strong>（Macは <strong>Cmd + P</strong>）を押してください。<br/>2. 送信先に<strong>『PDFに保存』</strong>を選択し、<strong>レイアウトを『ポートレート（縦）』、背景のグラフィックを『ON』</strong>にして保存を完了させてください。`
      : `<strong>PDF Export Instructions:</strong> This standalone document is structured to bypass all AI Studio security iframe constraints to render a flawless, high-contrast vector PDF layout.<br/>1. If your system print dialog does not initiate automatically, press <strong>Ctrl + P</strong> (or <strong>Cmd + P</strong> on macOS).<br/>2. Set destination to <strong>'Save as PDF'</strong>, set layout to <strong>'Portrait'</strong>, and enable <strong>'Background graphics'</strong> to output a perfect ATS-selectable file.`;

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${data.personalInfo.name || "Resume"}_職務経歴書</title>
    <style>${styleBlock}</style>
  </head>
  <body>
    <div class="download-instructions text-sans">
      ${instructionsTextHtml}
    </div>
    <div id="printable-area">
      ${printableContent}
    </div>
    <script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          window.print();
        }, 500);
      });
    </script>
  </body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${data.personalInfo.name ? data.personalInfo.name.replace(/\\s+/g, '_') : "Resume"}_職務経歴書.html`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-editorial-bg rounded-sm border border-editorial-border p-8 flex flex-col items-center shadow-xs">
      {/* Printable Preview Controllers */}
      <div className="w-full flex flex-wrap justify-between items-center gap-4 border-b border-editorial-border pb-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-brand-gold animate-pulse"></span>
          <h3 className="font-serif font-bold text-sm text-editorial-text tracking-widest uppercase flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#888]" />
            {isJapanese ? "A4 職務経歴書 印刷プレビュー" : "A4 Professional CV Print Sheet"}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={downloadExportedDoc}
            className="bg-brand-gold hover:bg-neutral-800 hover:text-white text-editorial-text text-[10px] px-6 py-2.5 uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer transition-colors"
            title={isJapanese ? "iFrameの制限をバイパスして、A4の完璧なベクターPDFとして保存します" : "Export offline-friendly standalone A4 document to easily save as PDF with zero sandbox borders."}
          >
            <Download className="w-4 h-4" />
            {isJapanese ? "PDFとしてエクスポート (推奨)" : "Download PDF (Vector)"}
          </button>

          <button
            type="button"
            onClick={printDoc}
            className="bg-editorial-text hover:bg-neutral-850 text-white text-[10px] px-6 py-2.5 uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            {isJapanese ? "ブラウザで印刷・保存 (A4)" : "Print & Save A4"}
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#FCFAF7] border border-brand-gold/50 rounded-sm text-[11px] text-[#666] leading-relaxed w-full mb-6 text-left flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
        <div>
          <strong className="text-editorial-text uppercase tracking-wider">{isJapanese ? "PDF保存のベストプラクティス：" : "Pro Tip for Vector PDF Export:"}</strong>{" "}
          {isJapanese 
            ? "印刷ボタンをクリックするとブラウザの印刷画面が開きます。送信先を『PDFに保存』にし、背景グラフィックを有効に設定して保存してください。"
            : "Click 'Print & Save PDF'. In the system print dialog, change your destination printer to 'Save as PDF' to export a clean, ATS-selectable professional vector layout."}
        </div>
      </div>

      {/* A4 Sheet Mock Canvas */}
      <div 
        id="printable-area" 
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-editorial-text p-[20mm] border border-editorial-border font-serif shadow-2xl text-left overflow-x-auto selection:bg-neutral-100"
        style={{ color: "#1A1A1A" }}
      >
        {/* Date (Right aligned) */}
        <div className="text-right text-[10px] mb-2 font-sans text-[#666] tracking-wider uppercase">{getFormatDate()} 現在</div>
        <div className="text-right text-xs mb-6 font-sans">
          氏名：<span className="text-sm font-bold tracking-widest text-editorial-text">{data.personalInfo.name}</span>
          {data.personalInfo.kana && <span className="text-[10px] text-[#888] block">（{data.personalInfo.kana}）</span>}
        </div>

        {/* Big Layout Title */}
        <h1 className="text-center text-xl font-serif font-bold tracking-widest border-b-[2px] border-editorial-text pb-3 mb-6 uppercase">
          {data.title || "職 務 経 歴 書"}
        </h1>

        {/* Desired Position info */}
        {data.personalInfo.desiredJob && (
          <div className="mb-6 font-sans text-xs border-b border-editorial-border pb-3">
            <span className="font-bold text-[#666] uppercase tracking-wider">【希望職種 / Target Profile】</span> <span className="font-bold text-editorial-text ml-2">{data.personalInfo.desiredJob}</span>
          </div>
        )}

        {/* Section: Job Summary */}
        <div className="mb-6">
          <h2 className="bg-[#F9F9F9] px-3 py-1.5 text-[11px] font-sans font-bold border-l-4 border-editorial-text mb-3 tracking-widest">
            【職務要約 / Executive Summary】
          </h2>
          <p className="text-xs leading-loose text-justify text-editorial-text indent-4">
            {data.jobSummary}
          </p>
        </div>

        {/* Section: Core Competencies */}
        {data.competencies && data.competencies.length > 0 && (
          <div className="mb-6">
            <h2 className="bg-[#F9F9F9] px-3 py-1.5 text-[11px] font-sans font-bold border-l-4 border-editorial-text mb-3 tracking-widest">
              【活かせる経験・知識・技術 / Key Expertise】
            </h2>
            <ul className="list-disc pl-5 text-xs space-y-2 leading-relaxed text-editorial-text">
              {data.competencies.map((comp, idx) => (
                <li key={idx}>{comp}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Section: Detailed Experience */}
        <div className="mb-6" id="preview-work-history">
          <h2 className="bg-[#F9F9F9] px-3 py-1.5 text-[11px] font-sans font-bold border-l-4 border-editorial-text mb-4 tracking-widest">
            【職務経歴 / Experience Summary】
          </h2>

          <div className="space-y-8">
            {data.workHistory && data.workHistory.map((history, idx) => (
              <div key={idx} className="border-b border-dashed border-editorial-border pb-6 last:border-0 last:pb-0">
                
                {/* Company Name & Period info */}
                <div className="flex flex-wrap justify-between items-baseline mb-3 bg-[#FCFAF7] p-2.5 rounded-none border border-editorial-border">
                  <div className="space-y-1">
                    <h3 className="text-xs font-serif font-bold text-editorial-text leading-tight tracking-wide">
                      {history.companyName}
                    </h3>
                    {history.companyNameEn && history.companyNameEn !== history.companyName && (
                      <p className="text-[10px] text-[#666] font-sans tracking-wide">{history.companyNameEn}</p>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-[#888] shrink-0 font-sans tracking-widest">
                    {history.periodStart} 〜 {history.periodEnd}
                  </div>
                </div>

                {/* Company Matrix info */}
                <div className="grid grid-cols-3 gap-3 text-[10px] text-[#666] font-sans mb-3 border-b border-editorial-border pb-3">
                  <div><strong>事業内容:</strong> {history.businessDescription || "未記入"}</div>
                  <div><strong>雇用形態:</strong> {history.employmentType || "正社員"}</div>
                  <div>
                    {history.employeesCount && <span><strong>従業員数:</strong> {history.employeesCount}</span>}
                    {history.employeesCount && history.capital && <span className="mx-1">/</span>}
                    {history.capital && <span><strong>資本金:</strong> {history.capital}</span>}
                  </div>
                </div>

                {/* Job Title */}
                <div className="mb-3 text-xs font-sans">
                  <span className="font-semibold text-[#666]">■ 職種・役職 / Title:</span> <span className="font-bold underline text-editorial-text ml-1">{history.jobTitle}</span>
                </div>

                {/* Duties */}
                {history.jobSummaries && history.jobSummaries.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] shrink-0 font-bold text-brand-gold uppercase tracking-wider mb-2">【主な担当業務 / Core Responsibilities】</p>
                    <ul className="list-disc pl-5 text-xs space-y-1.5 text-editorial-text leading-relaxed">
                      {history.jobSummaries.map((sumStr, sIdx) => (
                        <li key={sIdx}>{sumStr}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Achievements */}
                {history.achievements && history.achievements.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-brand-gold uppercase tracking-wider mb-2">【主な実績 / Key Accomplishments】</p>
                    <ul className="list-disc pl-5 text-xs space-y-1.5 text-editorial-text font-medium leading-relaxed">
                      {history.achievements.map((ach, aIdx) => (
                        <li key={aIdx} className="bg-[#FCFAF7]/55">{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Techs */}
                {history.technologies && history.technologies.length > 0 && (
                  <div className="text-[10px] text-[#666] font-sans border-t border-dashed border-editorial-border pt-2.5">
                    <strong>活かした技術・ツール / Technical Stack:</strong> {history.technologies.join(", ")}
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

        {/* Section: Qualifications */}
        {data.qualifications && data.qualifications.length > 0 && (
          <div className="mb-6">
            <h2 className="bg-[#F9F9F9] px-3 py-1.5 text-[11px] font-sans font-bold border-l-4 border-editorial-text mb-3 tracking-widest">
              【資格・免許 / Certifications】
            </h2>
            <table className="w-full text-xs">
              <tbody>
                {data.qualifications.map((qual, idx) => (
                  <tr key={idx} className="border-b border-[#F5F5F5] last:border-0">
                    <td className="py-2 font-mono text-[#666] w-28">{qual.date}</td>
                    <td className="py-2 font-semibold text-editorial-text">{qual.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section: Specific Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6" id="preview-specific-skills">
            <h2 className="bg-[#F9F9F9] px-3 py-1.5 text-[11px] font-sans font-bold border-l-4 border-editorial-text mb-3 tracking-widest">
              【スキル・カテゴリ / Technical & Professional Skills】
            </h2>
            <div className="space-y-4 pt-1">
              {data.skills.map((skillCat, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-bold text-[#666] inline-block w-28 shrink-0">{skillCat.categoryName}：</span>
                  <span className="text-editorial-text">{skillCat.skills.join("、 ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Self PR */}
        <div className="mb-4">
          <h2 className="bg-[#F9F9F9] px-3 py-1.5 text-[11px] font-sans font-bold border-l-4 border-editorial-text mb-3 tracking-widest">
            【自己PR / Professional Statement】
          </h2>
          <p className="text-xs leading-loose text-justify text-editorial-text whitespace-pre-wrap leading-relaxed">
            {data.selfPR}
          </p>
        </div>

      </div>
    </div>
  );
}
