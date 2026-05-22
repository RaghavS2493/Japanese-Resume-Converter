/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const extensionCode = {
  manifest: `{
  "manifest_version": 3,
  "name": "Shokumukeirekisho Quick Scan",
  "version": "1.1.0",
  "description": "Instantly grab LinkedIn profiles or PDF text and convert them into Japanese Shokumukeirekisho.",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["https://*.linkedin.com/in/*"],
      "js": ["content.js"]
    }
  ],
  "host_permissions": [
    "https://*.linkedin.com/*"
  ]
}`,

  popupHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 320px;
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 16px;
      background: #fdfdfd;
      color: #1f2937;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .title {
      font-size: 16px;
      font-weight: 600;
      color: #18181b;
    }
    .button {
      display: block;
      width: 100%;
      background: #0f172a;
      color: white;
      text-align: center;
      padding: 10px;
      border-radius: 6px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    .button:hover {
      background: #1e293b;
    }
    .tip {
      font-size: 11px;
      color: #6b7280;
      margin-top: 10px;
      line-height: 1.4;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">職務経歴書 Quick Scan</div>
  </div>
  <button id="scan-btn" class="button">Scan & Convert to Shokumukeirekisho</button>
  <p class="tip">Click scan on an active LinkedIn profile or resume document to auto-import it into the converter.</p>
  <script src="popup.js"></script>
</body>
</html>`,

  popupJs: `document.getElementById('scan-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Scrape general profile content
      const name = document.querySelector('h1')?.textContent?.trim() || 'Candidate Name';
      const main = document.querySelector('main')?.textContent || document.body.innerText;
      
      // Look for main elements like experiences, bio
      const bodyText = main.replace(/\\s+/g, ' ').substring(0, 15000); // 15K char limit
      
      return { name, bodyText };
    }
  }, (results) => {
    if (results && results[0] && results[0].result) {
      const { name, bodyText } = results[0].result;
      
      // Open our Shokumukeirekisho Web App, passing the scraped data in URL params safely
      const appUrl = "https://ais-dev-cmmihfq5ybjmemi6zb6lxy-215646341112.asia-east1.run.app"; // Dev Server
      const url = new URL(appUrl);
      url.searchParams.set("name", name);
      url.searchParams.set("scraped", bodyText);
      
      chrome.tabs.create({ url: url.toString() });
    }
  });
});`,

  contentJs: `// Content Script automatically active on LinkedIn profiles to inject secondary scans if needed
console.log("Shokumukeirekisho scanner extension loaded.");
`
};
