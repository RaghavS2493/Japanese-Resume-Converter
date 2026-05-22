/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  ChevronRight, 
  Languages, 
  Sparkles, 
  Database, 
  Chrome, 
  BookOpen, 
  FileEdit, 
  Printer, 
  Save, 
  Undo, 
  Plus, 
  Trash2, 
  HelpCircle, 
  LogIn, 
  LogOut, 
  RefreshCcw,
  CloudCheck,
  CheckCircle2,
  AlertTriangle,
  Info 
} from "lucide-react";

// Types and Components
import { ShokumukeirekishoData, CompanyInfo, Qualification, SkillCategory, SavedProfile } from "./types";
import { TranslationDictionaryPanel } from "./components/TranslationDictionaryPanel";
import { BrowserExtensionPanel } from "./components/BrowserExtensionPanel";
import { CustomProgressPanel } from "./components/CustomProgressPanel";
import { ShokumukeirekishoPreview } from "./components/ShokumukeirekishoPreview";

// Firebase
import { 
  isFirebaseMock, 
  auth, 
  db, 
  loginWithGoogle, 
  logoutUser, 
  handleFirestoreError,
  OperationType
} from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

// Mammoth (DOCX)
import mammoth from "mammoth";

// Initial Empty Document Template
const defaultNewCV: ShokumukeirekishoData = {
  title: "職務経歴書_システムエンジニア",
  personalInfo: {
    name: "山田 太郎",
    nameEn: "Taro Yamada",
    kana: "ヤマダ タロウ",
    email: "taro.yamada@example.com",
    phone: "+81-90-1234-5678",
    address: "東京都港区芝公園",
    birthDate: "1994年8月15日",
    desiredJob: "シニアソフトウェアエンジニア",
    currentTitle: "ソフトウェアエンジニア"
  },
  jobSummary: "大学卒業後、大手システムインテグレーター、およびITベンチャー企業にて通算8年間にわたりWebアプリケーション開発、クラウド移行インフラ構築等に従事。近年はアジャイル開発チームのテックリードとして、国内外10名規模のエンジニアメンバーをリードし、マイクロサービスアーキテクチャへのリファクタリングを推進。AWS、Kubernetesを駆使したCI/CDパイプライン構築および運用改善により、リリースタイムを40％短縮、システム信頼性向上に寄与しました。",
  competencies: [
    "AWS及びGCPを活用したクラウドネイティブなインフラの設計・構築（Terraform、Kubernetes）",
    "Go、TypeScript、Pythonによる高可用性、高スループットAPIサーバの設計・開発実績",
    "アジャイル・スクラムリーダーとしてのチーム牽引（メンタリング、設計レビュー、プロダクト価値最大化）",
    "ビジネス課題をインフラと設計に落とし込む問題解決能力、システムコスト削減の立案と実行"
  ],
  workHistory: [
    {
      companyName: "株式会社メルカリ (Mercari, Inc.)",
      companyNameEn: "Mercari, Inc.",
      periodStart: "2021年4月",
      periodEnd: "現在",
      employmentType: "正社員",
      businessDescription: "C2Cアプリ『メルカリ』およびFintechサービスの企画・開発・運用・保守・カスタマーサービス",
      employeesCount: "2,000名",
      capital: "100億円",
      jobTitle: "シニアソフトウェアエンジニア / テックリード",
      jobSummaries: [
        "Kubernetes（EKS）移行プロジェクトに参画し、システム間通信の安定化およびマイクロサービスの整備を推進",
        "Terraformによるマルチリージョンに対応したIaC管理ツールの構築を完了させ、手動インフラ構築コストを完全に削減",
        "社内外の英語および日本語を用いて、エンジニア6名からなる開発チームの毎日のアジャイルマネジメントを統括"
      ],
      achievements: [
        "AWSクラウド移行によりトランザクション遅延時間を35%短縮し、アプリ全体の応答速度と信頼性を劇的に向上させた",
        "システムインフラの不要アセットの洗い出し、Dockerキャッシュ最適化により、年間インフラ運用コストの約20%を削減した"
      ],
      technologies: ["Go", "Kubernetes", "AWS (EC2, Aurora, EKS)", "Docker", "Terraform", "GitHub Actions", "gRPC"]
    }
  ],
  qualifications: [
    { name: "AWS 認定ソリューションアーキテクト – プロフェッショナル", date: "2022年10月" },
    { name: "TOEIC Listening & Reading 公認テスト 850点", date: "2020年4月" }
  ],
  skills: [
    { categoryName: "プログラミング言語", skills: ["Go", "TypeScript", "Python", "SQL", "Bash"] },
    { categoryName: "フレームワーク・技術", skills: ["Next.js", "Docker", "Kubernetes", "gRPC", "Terraform", "Git"] },
    { categoryName: "言語スキル", skills: ["日本語 (母国語)", "英語 (ビジネスレベル、TOEIC 850)"] }
  ],
  selfPR: "私の最大の強みは、「技術課題を企業目標とアラインさせ、定量的な成果を創出する力」です。Mercariのテックリード業務においても、技術的負債となっていた旧仕様データベースインフラのAmazon Aurora移行に取り組みました。ビジネス影響を最小限にするため夜間リファクタリングスケジュール等の移行プランを緻密に練り、25％の性能改善に貢献しました。今後はグローバル開発組織のエンジニアマネジメントでの経験、海外メンバーとも活かせる語学力、並びに洗練された設計力を用いて貴社の更なる成長を主導、加速させてまいります。"
};

export default function App() {
  // Locale state
  const [isJapaneseUI, setIsJapaneseUI] = useState<boolean>(true);

  // User auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Main navigation tabs
  // "translate" | "editor" | "preview" | "extension" | "dictionary" | "drafts"
  const [activeTab, setActiveTab] = useState<string>("translate");

  // Input States for Conversion
  const [resumeText, setResumeText] = useState<string>("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [targetJob, setTargetJob] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Career");
  const [translationTone, setTranslationTone] = useState("Professional & Polite");

  // Conversion / AI Process State
  const [isTranslating, setIsTranslating] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Active Shokumukeirekisho State (Currently being previewed or edited)
  const [cvData, setCvData] = useState<ShokumukeirekishoData>(defaultNewCV);

  // Save drafts locally or in cloud
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profileNameInput, setProfileNameInput] = useState("");

  // Delete Confirmation custom modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // AI Tweaks Dialog state
  const [tweakTarget, setTweakTarget] = useState<{ section: string; value: string; parentIdx?: number; subIdx?: number } | null>(null);
  const [tweakInstruction, setTweakInstruction] = useState("");
  const [isTweaking, setIsTweaking] = useState(false);

  // UI state for Offline notification
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Keep track of connection changes for offline mode
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen for Firebase authorization state changes
  useEffect(() => {
    if (isFirebaseMock || !auth) {
      setIsLoadingAuth(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync / Load profiles when logged in
  useEffect(() => {
    loadProfiles();
  }, [currentUser]);

  // Check if Chrome extension params exist in URL on query mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get("name");
    const scrapedParam = urlParams.get("scraped");
    if (scrapedParam) {
      setResumeText(scrapedParam);
      if (nameParam) {
        setFileName(`${nameParam} (LinkedIn Scraped)`);
      }
      setActiveTab("translate");
    }
  }, []);

  // Fetch profiles list from Firestore or localStorage fallback
  const loadProfiles = async () => {
    if (!isFirebaseMock && db && currentUser) {
      const profilesPath = "profiles";
      try {
        const q = query(
          collection(db, profilesPath),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const docsList: SavedProfile[] = [];
        querySnapshot.forEach((docSnapshot) => {
          docsList.push(docSnapshot.data() as SavedProfile);
        });
        setSavedProfiles(docsList);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, profilesPath);
      }
    } else {
      // Local recovery
      const local = localStorage.getItem("shokumu_profiles");
      if (local) {
        setSavedProfiles(JSON.parse(local));
      } else {
        // Hydrate default backup
        const defaultProfile: SavedProfile = {
          id: "default-draft",
          userId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          name: "デフォルト（システムエンジニア例）",
          originalResumeText: "Sample CV text",
          data: defaultNewCV
        };
        setSavedProfiles([defaultProfile]);
        localStorage.setItem("shokumu_profiles", JSON.stringify([defaultProfile]));
      }
    }
  };

  // Drag and Drop files handling
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileInput(e.dataTransfer.files[0]);
    }
  };

  const processFileInput = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setConversionError(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    
    // Parse docx files client side completely offline
    if (ext === "docx") {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          if (result.value.trim() === "") {
            throw new Error("Extracted text was empty. Please check the Word document format.");
          }
          setResumeText(result.value);
          setFileBase64(null);
          setFileMimeType(null);
        } catch (err: any) {
          console.error("Mammoth DOCX translation failed:", err);
          setConversionError(
            isJapaneseUI 
              ? "Word文書（.docx）の文字抽出に失敗しました。ファイルが破損していないかご確認ください。" 
              : "Failed to extract text from Word Document. Ensure it is not password protected."
          );
        }
      };
    } 
    // Parse pdf files standard text extraction and base64 parsing for Gemini
    else if (ext === "pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const base64 = (reader.result as string).split(",")[1];
          setFileBase64(base64);
          setFileMimeType("application/pdf");
          // Clear standard text areas so server knows we pass direct PDF parameters
          setResumeText("");
        }
      };
      reader.readAsDataURL(file);
    } else {
      setConversionError(
        isJapaneseUI 
          ? "PDF、またはWord（.docx）ファイルのみアップロードが可能です。" 
          : "Only PDF or Word (.docx) formats are supported dynamically."
      );
    }
  };

  const handleManualImportScrape = (text: string, titleName: string) => {
    setResumeText(text);
    setFileName(titleName);
    setFileBase64(null);
    setFileMimeType(null);
    setActiveTab("translate");
  };

  // Invoke full-stack translation converter endpoint
  const triggerTranslation = async () => {
    // If offline, alert and offer manual fallback editing
    if (!isOnline) {
      setConversionError(
        isJapaneseUI 
          ? "オフラインのためAI翻訳はご利用いただけません。ネットに接続するか、オフライン辞書・手動入力をご活用ください。"
          : "Offline mode. AI Translation is unavailable. Connect to the internet or edit manually."
      );
      return;
    }

    setConversionError(null);
    setIsTranslating(true);
    setActiveTab("translate");

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: resumeText,
          fileBase64,
          fileMimeType,
          targetJob,
          experienceLevel,
          tone: translationTone
        })
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to translate CV text with Gemini.");
      }

      const generatedCV: ShokumukeirekishoData = resJson.data;
      setCvData(generatedCV);
      setActiveTab("editor"); // Redirect to Manual Editor so they can inspect/tweak and print
    } catch (err: any) {
      console.error(err);
      setConversionError(err.message || "An unexpected error occurred during AI processing.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Section tweaks endpoint trigger
  const triggerTweakSection = async () => {
    if (!tweakTarget || !tweakInstruction.trim()) return;
    setIsTweaking(true);

    try {
      const response = await fetch("/api/tweak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionName: tweakTarget.section,
          currentText: tweakTarget.value,
          instruction: tweakInstruction
        })
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to revise section text.");
      }

      const revisedText = resJson.tweakedText;

      // Update appropriate section in cvData state dynamically
      const newCV = { ...cvData };
      if (tweakTarget.section === "jobSummary") {
        newCV.jobSummary = revisedText;
      } else if (tweakTarget.section === "selfPR") {
        newCV.selfPR = revisedText;
      } else if (tweakTarget.section === "companySummary" && tweakTarget.parentIdx !== undefined) {
        const item = newCV.workHistory[tweakTarget.parentIdx].jobSummaries;
        if (tweakTarget.subIdx !== undefined) {
          item[tweakTarget.subIdx] = revisedText;
        }
      } else if (tweakTarget.section === "companyAchievement" && tweakTarget.parentIdx !== undefined) {
        const item = newCV.workHistory[tweakTarget.parentIdx].achievements;
        if (tweakTarget.subIdx !== undefined) {
          item[tweakTarget.subIdx] = revisedText;
        }
      }

      setCvData(newCV);
      setTweakTarget(null);
      setTweakInstruction("");
    } catch (err: any) {
      showToast(err.message || "Could not polish section.", "error");
    } finally {
      setIsTweaking(false);
    }
  };

  // Profiles Draft CRUD Ops
  const handleSaveProfile = async () => {
    const draftName = profileNameInput.trim() || cvData.personalInfo.name || "新しい履歴書";
    const profileId = activeProfileId || `profile-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newProfile: SavedProfile = {
      id: profileId,
      userId: currentUser?.uid || null,
      createdAt: timestamp,
      updatedAt: timestamp,
      name: draftName,
      originalResumeText: resumeText || "Pasted / Word Text Resume",
      data: cvData
    };

    if (!isFirebaseMock && db && currentUser) {
      const collectionPath = `profiles`;
      const fullDocPath = `${collectionPath}/${profileId}`;
      try {
        await setDoc(doc(db, collectionPath, profileId), newProfile);
        setActiveProfileId(profileId);
        loadProfiles();
        showToast(isJapaneseUI ? "クラウドに正常に保存されました！" : "Successfully synced to secure cloud storage!", "success");
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, fullDocPath);
      }
    } else {
      // Offline Local Storage save
      const localList = [...savedProfiles];
      const matchIdx = localList.findIndex(p => p.id === profileId);
      if (matchIdx >= 0) {
        localList[matchIdx] = newProfile;
      } else {
        localList.push(newProfile);
      }
      setSavedProfiles(localList);
      localStorage.setItem("shokumu_profiles", JSON.stringify(localList));
      setActiveProfileId(profileId);
      showToast(isJapaneseUI ? "ブラウザ（ローカル）に保存されました！" : "Successfully saved locally in the browser storage!", "success");
    }
  };

  const handleLoadProfile = (profile: SavedProfile) => {
    setCvData(profile.data);
    setResumeText(profile.originalResumeText);
    setProfileNameInput(profile.name);
    setActiveProfileId(profile.id);
    setActiveTab("editor");
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!isFirebaseMock && db && currentUser) {
      const fullPath = `profiles/${profileId}`;
      try {
        await deleteDoc(doc(db, "profiles", profileId));
        if (activeProfileId === profileId) {
          setActiveProfileId(null);
        }
        loadProfiles();
        showToast(isJapaneseUI ? "下書きが正常に削除されました" : "Draft successfully deleted", "info");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, fullPath);
      }
    } else {
      const localList = savedProfiles.filter(p => p.id !== profileId);
      setSavedProfiles(localList);
      localStorage.setItem("shokumu_profiles", JSON.stringify(localList));
      if (activeProfileId === profileId) {
        setActiveProfileId(null);
      }
      showToast(isJapaneseUI ? "下書きが正常に削除されました" : "Draft successfully deleted", "info");
    }
  };

  const startNewDraft = () => {
    setCvData(defaultNewCV);
    setResumeText("");
    setProfileNameInput("");
    setFileName(null);
    setFileBase64(null);
    setFileMimeType(null);
    setActiveProfileId(null);
    setActiveTab("editor");
  };

  // Interactive UI Helper for adding items dynamically in Editor
  const updatePersonalInfo = (field: string, val: string) => {
    const updated = { ...cvData.personalInfo, [field]: val };
    setCvData({ ...cvData, personalInfo: updated });
  };

  const updateCompanyField = (idx: number, field: keyof CompanyInfo, val: any) => {
    const nextList = [...cvData.workHistory];
    nextList[idx] = { ...nextList[idx], [field]: val };
    setCvData({ ...cvData, workHistory: nextList });
  };

  return (
    <div className="bg-editorial-bg min-h-screen text-editorial-text font-sans pb-16 antialiased" id="main-applet-root">
      
      {/* Dynamic Offline / Connection Status Banner */}
      {!isOnline && (
        <div className="bg-brand-gold text-editorial-text text-xs px-4 py-2 text-center flex items-center justify-center gap-1.5 font-bold tracking-wider uppercase animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{isJapaneseUI ? "オフラインモード：基本的なデータ入力、編集、PDFプレビュー・印刷は可能です。AI翻訳、保存にはインターネット接続が必要です。" : "Offline Mode: Draft editing, business dictionary, and A4 PDF printing are accessible offline. AI translator requires connection."}</span>
        </div>
      )}

      {/* Top Standard Navigation Header */}
      <header className="bg-editorial-bg border-b border-editorial-border py-6 sticky top-0 z-40" id="applet-nav-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-12">
            <div className="text-left">
              <h1 className="text-2xl font-serif font-bold tracking-tighter uppercase text-editorial-text">
                Kiseki <span className="font-normal text-brand-gold">AI</span>
              </h1>
              <span className="text-[9px] text-[#888] tracking-[0.2em] font-bold uppercase block mt-1">
                {isJapaneseUI ? "プロフェッショナル和訳ツール" : "Global CV Transposer"}
              </span>
            </div>
          </div>

          {/* Quick global Controls Bar */}
          <div className="flex items-center gap-6">
            
            {/* Bilingual Translation Switcher Toggle */}
            <div className="flex bg-[#F0F0F0] rounded-full p-1 border border-editorial-border">
              <button
                type="button"
                onClick={() => setIsJapaneseUI(false)}
                className={`px-4 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${!isJapaneseUI ? "bg-white text-editorial-text shadow-sm" : "text-[#888] hover:text-editorial-text"}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setIsJapaneseUI(true)}
                className={`px-4 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${isJapaneseUI ? "bg-white text-editorial-text shadow-sm" : "text-[#888] hover:text-editorial-text"}`}
              >
                JP
              </button>
            </div>

            {/* Cloud Storage Auth module */}
            <div className="h-6 w-px bg-editorial-border"></div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-brand-gold leading-none">Cloud Active</p>
                  <p className="text-[11px] font-semibold text-editorial-text leading-snug">{currentUser.email}</p>
                </div>
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-editorial-border shrink-0 referrerPolicy='no-referrer'" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-editorial-text text-editorial-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={logoutUser}
                  className="p-1.5 border border-editorial-border rounded-sm hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={isFirebaseMock}
                className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-4 py-2 border transition-all cursor-pointer ${
                  isFirebaseMock 
                    ? "bg-editorial-mute text-neutral-400 border-editorial-border cursor-not-allowed" 
                    : "bg-editorial-text hover:bg-neutral-850 text-editorial-white border-editorial-text"
                }`}
                title={isFirebaseMock ? "Database integration pending user setup" : "Sync data to Google accounts cloud storage"}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isJapaneseUI ? "クラウドに接続" : "Connect Cloud"}</span>
                {isFirebaseMock && <span className="text-[8px] tracking-normal font-mono uppercase bg-brand-gold text-editorial-text px-1 py-0.2 rounded">Setup</span>}
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Sub Navigation Section Selector */}
        <div className="flex border-b border-editorial-border gap-6 overflow-x-auto pb-px scrollbar-none mb-8" id="applet-sub-tabs">
          <button
            onClick={() => setActiveTab("translate")}
            className={`pb-3 pt-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "translate" 
                ? "border-editorial-text text-editorial-text" 
                : "border-transparent text-[#888] hover:text-editorial-text hover:border-brand-gold"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            {isJapaneseUI ? "1. 読込 & 翻訳" : "1. Import & Translate"}
          </button>
          
          <button
            onClick={() => setActiveTab("editor")}
            className={`pb-3 pt-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "editor" 
                ? "border-editorial-text text-editorial-text" 
                : "border-transparent text-[#888] hover:text-editorial-text hover:border-brand-gold"
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            {isJapaneseUI ? "2. 編集" : "2. Edit"}
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`pb-3 pt-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "preview" 
                ? "border-editorial-text text-editorial-text" 
                : "border-transparent text-[#888] hover:text-editorial-text hover:border-brand-gold"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            {isJapaneseUI ? "3. A4印刷 & 共有" : "3. Share & Print"}
          </button>

          <button
            onClick={() => setActiveTab("extension")}
            className={`pb-3 pt-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "extension" 
                ? "border-editorial-text text-editorial-text" 
                : "border-transparent text-[#888] hover:text-editorial-text hover:border-brand-gold"
            }`}
          >
            <Chrome className="w-3.5 h-3.5" />
            {isJapaneseUI ? "拡張機能の連携" : "Scan Extension"}
          </button>

          <button
            onClick={() => setActiveTab("dictionary")}
            className={`pb-3 pt-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "dictionary" 
                ? "border-editorial-text text-editorial-text" 
                : "border-transparent text-[#888] hover:text-editorial-text hover:border-brand-gold"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {isJapaneseUI ? "専門辞書" : "Glossary"}
          </button>

          <button
            onClick={() => setActiveTab("drafts")}
            className={`pb-3 pt-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap relative cursor-pointer ${
              activeTab === "drafts" 
                ? "border-editorial-text text-editorial-text" 
                : "border-transparent text-[#888] hover:text-editorial-text hover:border-brand-gold"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            {isJapaneseUI ? "保存済み" : "Saved"}
            {savedProfiles.length > 0 && (
              <span className="ml-1.5 bg-[#1A1A1A] text-white py-0.5 px-2 rounded-full text-[9px] font-bold">
                {savedProfiles.length}
              </span>
            )}
          </button>
        </div>

        {/* ===================================== START TAB: TRANSLATE ===================================== */}
        {activeTab === "translate" && (
          <div className="space-y-6" id="tab-translate-content">
            
            {/* Show Progress Animation overlay */}
            {isTranslating ? (
              <div className="py-12 flex justify-center items-center">
                <CustomProgressPanel isJapanese={isJapaneseUI} isActive={isTranslating} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                
                {/* Left Side Input Block */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* File Upload zone */}
                  <div className="bg-white rounded-xl shadow-xs border border-gray-150 p-6">
                    <h3 className="font-semibold text-sm text-slate-800 mb-3 uppercase tracking-wider">
                      {isJapaneseUI ? "1. 英語のCV/レジュメ（PDFまたはWord）の読込" : "1. Fetch English CV/Resume (PDF or DOCX)"}
                    </h3>

                    {/* Drag and Drop Zone */}
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50/90 rounded-xl p-8 text-center transition-all cursor-pointer relative"
                      id="upload-dropzone"
                    >
                      <input 
                        type="file"
                        id="cv-file-uploader"
                        accept=".pdf,.docx"
                        onChange={(e) => e.target.files && processFileInput(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-xs mb-1">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          {isJapaneseUI ? "PDFかWordファイルをここにドラッグ＆ドロップ" : "Drag & Drop PDF or DOCX resume here"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {isJapaneseUI ? "PDFファイルはGeminiがマルチモーダル解析を実行します" : "PDFs will be parsed natively by Gemini's AI extractor"}
                        </p>
                        <button type="button" className="mt-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg shadow-sm transition-transform pointer-events-none">
                          {isJapaneseUI ? "フォルダーから読み込む" : "Browse Files"}
                        </button>
                      </div>
                    </div>

                    {fileName && (
                      <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2 text-indigo-900 font-medium">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span className="truncate max-w-sm">{fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFileName(null);
                            setResumeText("");
                            setFileBase64(null);
                            setFileMimeType(null);
                          }}
                          className="hover:bg-indigo-100 text-indigo-500 rounded p-1 text-xs font-semibold transition-colors"
                        >
                          {isJapaneseUI ? "削除" : "Remove"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Plain Text input as Fallback */}
                  <div className="bg-white rounded-xl shadow-xs border border-gray-150 p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-sm text-slate-800 uppercase tracking-wider">
                        {isJapaneseUI ? "または：英文履歴書テキストを直接ペースト" : "Or: Direct Paste English CV Text"}
                      </h3>
                      {resumeText.length > 0 && (
                        <span className="text-xs font-mono text-slate-400">
                          {resumeText.length} chars
                        </span>
                      )}
                    </div>

                    <textarea
                      id="resume-pasted-textarea"
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        setFileBase64(null);
                        setFileMimeType(null);
                        if (!fileName) setFileName("テキストペースト履歴書");
                      }}
                      placeholder="Paste plain text from your LinkedIn, PDF, or document here..."
                      className="w-full h-80 p-3.5 text-sm font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all"
                    ></textarea>
                  </div>

                </div>

                {/* Right Side Control Parameters Panel */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-xl shadow-xs border border-gray-150 p-6 space-y-5">
                    <h3 className="font-semibold text-sm text-slate-900 uppercase border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-600" />
                      {isJapaneseUI ? "2. AI翻訳パラメーター設定" : "2. Configure Translation Target"}
                    </h3>

                    {/* Target Job Position */}
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="target-job-input" className="block text-xs font-bold text-slate-700">
                        {isJapaneseUI ? "希望（志望）職種 (Japan Target Job Title)" : "Target Job Title in Japan"}
                      </label>
                      <input
                        type="text"
                        id="target-job-input"
                        value={targetJob}
                        onChange={(e) => setTargetJob(e.target.value)}
                        placeholder="e.g. シニアソフトウェアエンジニア, PM"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                      />
                      <p className="text-[10px] text-slate-400 leading-normal">
                        {isJapaneseUI 
                          ? "希望職種に合わせて活かせる用語を自動的にAIがアジャストします。" 
                          : "Terminologies and self-PR will adjust to target this specific role."}
                      </p>
                    </div>

                    {/* Experience level */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-bold text-slate-700">
                        {isJapaneseUI ? "現在の職階水準 (Position Level)" : "Current Professional Seniority"}
                      </label>
                      <div className="grid grid-cols-3 gap-2" id=" seniority-selector-grid">
                        {[
                          { id: "Junior", ja: "若手 (2-3y)", en: "Junior" },
                          { id: "Mid-Career", ja: "中堅(3-8y)", en: "Mid-Level" },
                          { id: "Senior/Lead", ja: "指導/管理級", en: "Executive/Lead" }
                        ].map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setExperienceLevel(level.id)}
                            className={`px-2 py-2 border rounded-md text-[11px] font-semibold transition-all ${
                              experienceLevel === level.id 
                                ? "bg-slate-900 border-slate-950 text-white font-bold" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {isJapaneseUI ? level.ja : level.en}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Translation Tone */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-bold text-slate-700 font-sans">
                        {isJapaneseUI ? "自己PR・職務要約の文体トーン" : "Tone of Narrative Summary & Self-PR"}
                      </label>
                      <select
                        id="translation-tone-select"
                        value={translationTone}
                        onChange={(e) => setTranslationTone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-slate-400 focus:outline-hidden font-bold"
                      >
                        <option value="Professional & Polite (丁寧・謙虚)">
                          {isJapaneseUI ? "謙虚・礼儀正しい敬語（です・ます）" : "Humble & Polite Corporate (推奨)"}
                        </option>
                        <option value="Confident & Strong Leader (強力なリーダーシップ)">
                          {isJapaneseUI ? "リーダーシップ・強気アピール（です・ます）" : "Strong Leader & Confident (推薦)"}
                        </option>
                      </select>
                    </div>

                    {/* Error Display */}
                    {conversionError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 font-medium">
                        {conversionError}
                      </div>
                    )}

                    {/* Main Translate Button */}
                    <button
                      type="button"
                      onClick={triggerTranslation}
                      disabled={isTranslating || (!resumeText.trim() && !fileBase64)}
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        (!resumeText.trim() && !fileBase64) 
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                          : "bg-slate-900 hover:bg-slate-850 text-white cursor-pointer hover:shadow-md hover:-translate-y-px active:translate-y-0"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
                      {isJapaneseUI ? "最高の職務経歴書へ変換する" : "Translate & Generate Resume"}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ===================================== START TAB: MANUAL EDITOR ===================================== */}
        {activeTab === "editor" && (
          <div className="space-y-6 text-left" id="tab-editor-content">
            <div className="bg-white rounded-xl shadow-xs border border-gray-150 p-6">
              
              {/* Manual Editor Header with save commands */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
                <div className="space-y-1">
                  <h2 className="font-semibold text-lg text-slate-900 flex items-center gap-1.5">
                    {isJapaneseUI ? "2. 職務経歴書マニュアル修正" : "2. Fine-grained Manual Editor"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isJapaneseUI 
                      ? "AIが作成した日本語を確認し必要に応じて直接編集できます。『AI添削・リライト』ボタンで部分調整も可能です。" 
                      : "Directly customize spelling, parameters, and bullet lists. Click 'AI Polish' underneath narratives for instant enhancements."}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={startNewDraft}
                    className="p-1 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isJapaneseUI ? "新規案件" : "New Blank Sheet"}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      id="save-draft-nickname-input"
                      value={profileNameInput}
                      onChange={(e) => setProfileNameInput(e.target.value)}
                      placeholder={isJapaneseUI ? "下書きの別名を設定..." : "Draft nickname..."}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium w-44"
                    />
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-300" />
                      {isJapaneseUI ? "下書きを保存" : "Save Draft"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Grid Form Inputs */}
              <div className="space-y-8" id="manual-editor-form">
                
                {/* 1. DOCUMENT TITLE */}
                <div className="space-y-1.5 w-full">
                  <label htmlFor="shokumu-title-input" className="block text-xs font-bold text-slate-700 tracking-wider">
                    【文書タイトル】 (e.g., 職務経歴書_システムエンジニア)
                  </label>
                  <input
                    type="text"
                    id="shokumu-title-input"
                    value={cvData.title}
                    onChange={(e) => setCvData({ ...cvData, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-bold bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* 2. PERSONAL INFO */}
                <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 space-y-4">
                  <h4 className="text-sm font-bold border-l-4 border-slate-700 px-2 text-slate-900 mb-1 leading-none">
                    個人プロフィール・連絡先
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">氏名 (Japanese / Main Name)</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.name}
                        onChange={(e) => updatePersonalInfo("name", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">ふりがな・カタカナ (Kana Pin-yin)</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.kana || ""}
                        onChange={(e) => updatePersonalInfo("kana", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">英語氏名 (Original English Name)</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.nameEn || ""}
                        onChange={(e) => updatePersonalInfo("nameEn", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">希望職種 (Target Occupation)</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.desiredJob || ""}
                        onChange={(e) => updatePersonalInfo("desiredJob", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                      <input
                        type="email"
                        value={cvData.personalInfo.email}
                        onChange={(e) => updatePersonalInfo("email", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">生年月日 (Birthdate)</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.birthDate || ""}
                        onChange={(e) => updatePersonalInfo("birthDate", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. JOB SUMMARY EDITOR & AI TWEAKS */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="job-summary-editor-text" className="block text-xs font-bold text-slate-700 tracking-wider">
                      【職務要約】 (Job Summary Career Overview - Keigo style)
                    </label>
                    <button
                      type="button"
                      onClick={() => setTweakTarget({ section: "jobSummary", value: cvData.jobSummary })}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 p-1 px-2.5 rounded-full transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      {isJapaneseUI ? "AI添削・リライト" : "Polish Section with AI"}
                    </button>
                  </div>
                  <textarea
                    id="job-summary-editor-text"
                    value={cvData.jobSummary}
                    onChange={(e) => setCvData({ ...cvData, jobSummary: e.target.value })}
                    className="w-full h-32 p-3 text-sm leading-relaxed border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  ></textarea>
                </div>

                {/* 4. CORE COMPETENCIES LIST */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 tracking-wider">
                      【活かせる経験・知識・技術】 (Core Specialties & Capabilities)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCvData({ ...cvData, competencies: [...cvData.competencies, "新しいスキル要約要素"] })}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isJapaneseUI ? "要素を追加" : "Add Specialty Bullet"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {cvData.competencies && cvData.competencies.map((comp, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={comp}
                          onChange={(e) => {
                            const list = [...cvData.competencies];
                            list[idx] = e.target.value;
                            setCvData({ ...cvData, competencies: list });
                          }}
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => setCvData({ ...cvData, competencies: cvData.competencies.filter((_, cIdx) => cIdx !== idx) })}
                          className="p-1 px-1.5 border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-red-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. DETAILED WORK HISTORY */}
                <div className="space-y-4" id="workhistory-editor-section">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 border-l-4 border-slate-700 px-2 leading-none">
                      【職務経歴】 勤務企業詳細および担当業務・実績
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCvData({
                        ...cvData,
                        workHistory: [
                          ...cvData.workHistory,
                          {
                            companyName: "新しい会社名",
                            periodStart: "YYYY年MM月",
                            periodEnd: "現在",
                            employmentType: "正社員",
                            businessDescription: "ITサービス開発・運用",
                            jobTitle: "ソフトウェアエンジニア",
                            jobSummaries: ["主要業務内容を入力します"],
                            achievements: ["主要実績、数値を入力します"],
                            technologies: []
                          }
                        ]
                      })}
                      className="text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-300" />
                      {isJapaneseUI ? "職歴（企業）を追加" : "Add Company Record"}
                    </button>
                  </div>

                  {cvData.workHistory && cvData.workHistory.map((history, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50/20 space-y-4 text-left">
                      <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3" id={`workhistory-card-header-${idx}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">会社名 (Company Name)</label>
                            <input
                              type="text"
                              value={history.companyName}
                              onChange={(e) => updateCompanyField(idx, "companyName", e.target.value)}
                              className="w-full px-3 py-1 text-xs border border-slate-200 rounded font-bold"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400">開始日時 (Start Date)</label>
                              <input
                                type="text"
                                value={history.periodStart}
                                onChange={(e) => updateCompanyField(idx, "periodStart", e.target.value)}
                                className="w-full px-3 py-1 text-xs border border-slate-200 rounded font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400">終了日時 (End Date/現在)</label>
                              <input
                                type="text"
                                value={history.periodEnd}
                                onChange={(e) => updateCompanyField(idx, "periodEnd", e.target.value)}
                                className="w-full px-3 py-1 text-xs border border-slate-200 rounded font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCvData({ ...cvData, workHistory: cvData.workHistory.filter((_, hIdx) => hIdx !== idx) })}
                          className="p-1 px-1.5 border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-700 rounded transition-colors shrink-0"
                          title="Remove Company Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Additional Business metadata row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">職務・役職 (Role/Title)</label>
                          <input
                            type="text"
                            value={history.jobTitle}
                            onChange={(e) => updateCompanyField(idx, "jobTitle", e.target.value)}
                            className="w-full px-3 py-1 text-xs border border-slate-200 rounded font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">雇用形態 (Employment Type)</label>
                          <input
                            type="text"
                            value={history.employmentType}
                            onChange={(e) => updateCompanyField(idx, "employmentType", e.target.value)}
                            className="w-full px-3 py-1 text-xs border border-slate-200 rounded"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">事業内容 (Business Segment description)</label>
                          <input
                            type="text"
                            value={history.businessDescription}
                            onChange={(e) => updateCompanyField(idx, "businessDescription", e.target.value)}
                            className="w-full px-3 py-1 text-xs border border-slate-200 rounded"
                          />
                        </div>
                      </div>

                      {/* Detailed Duties / Summaries list */}
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center bg-slate-100/50 p-2 rounded-lg">
                          <span className="text-xs font-bold text-slate-700">【担当業務】 (Responsibilities)</span>
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...history.jobSummaries, "新しい担当業務要素"];
                              updateCompanyField(idx, "jobSummaries", list);
                            }}
                            className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 border border-slate-200 bg-white px-2 py-0.5 rounded"
                          >
                            <Plus className="w-3 h-3" />
                            {isJapaneseUI ? "業務を追加" : "Add Duty"}
                          </button>
                        </div>
                        <div className="space-y-1.5 pl-3">
                          {history.jobSummaries.map((summary, sIdx) => (
                            <div key={sIdx} className="flex gap-2 items-center">
                              <span className="text-xs text-slate-400">•</span>
                              <input
                                type="text"
                                value={summary}
                                onChange={(e) => {
                                  const list = [...history.jobSummaries];
                                  list[sIdx] = e.target.value;
                                  updateCompanyField(idx, "jobSummaries", list);
                                }}
                                className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setTweakTarget({ section: "companySummary", value: summary, parentIdx: idx, subIdx: sIdx });
                                }}
                                className="hover:text-indigo-600 text-slate-400 rounded shrink-0 p-1 bg-slate-50"
                                title="AI Polish"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = history.jobSummaries.filter((_, sd) => sd !== sIdx);
                                  updateCompanyField(idx, "jobSummaries", list);
                                }}
                                className="hover:text-red-700 text-slate-400 rounded shrink-0 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Achievements list inline edit */}
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center bg-slate-100/50 p-2 rounded-lg">
                          <span className="text-xs font-bold text-slate-700">【主な実績と数値成果】 (Quantifiable Achievements)</span>
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...history.achievements, "実績数値を強調した成果を入力します"];
                              updateCompanyField(idx, "achievements", list);
                            }}
                            className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 border border-slate-200 bg-white px-2 py-0.5 rounded"
                          >
                            <Plus className="w-3 h-3" />
                            {isJapaneseUI ? "実績を追加" : "Add Achievement"}
                          </button>
                        </div>
                        <div className="space-y-1.5 pl-3">
                          {history.achievements && history.achievements.map((achieve, aIdx) => (
                            <div key={aIdx} className="flex gap-2 items-center">
                              <span className="text-xs text-emerald-500">✔</span>
                              <input
                                type="text"
                                value={achieve}
                                onChange={(e) => {
                                  const list = [...history.achievements];
                                  list[aIdx] = e.target.value;
                                  updateCompanyField(idx, "achievements", list);
                                }}
                                className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded font-medium text-slate-900 bg-slate-50/20"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setTweakTarget({ section: "companyAchievement", value: achieve, parentIdx: idx, subIdx: aIdx });
                                }}
                                className="hover:text-indigo-600 text-slate-400 rounded shrink-0 p-1 bg-slate-50"
                                title="AI Polish"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = history.achievements.filter((_, ad) => ad !== aIdx);
                                  updateCompanyField(idx, "achievements", list);
                                }}
                                className="hover:text-red-700 text-slate-400 rounded shrink-0 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* 6. QUALIFICATIONS */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 tracking-wider">
                      【資格・免許】 (Certifications & Credentials)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCvData({ ...cvData, qualifications: [...cvData.qualifications, { name: "資格名 / 技術検定等", date: "YYYY年MM月" }] })}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isJapaneseUI ? "資格を追加" : "Add Qualification"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {cvData.qualifications && cvData.qualifications.map((qual, idx) => (
                      <div key={idx} className="flex gap-3">
                        <input
                          type="text"
                          value={qual.date}
                          placeholder="取得日付 (e.g., 2022年4月)"
                          onChange={(e) => {
                            const list = [...cvData.qualifications];
                            list[idx] = { ...list[idx], date: e.target.value };
                            setCvData({ ...cvData, qualifications: list });
                          }}
                          className="w-36 px-3 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
                        />
                        <input
                          type="text"
                          value={qual.name}
                          placeholder="資格表記"
                          onChange={(e) => {
                            const list = [...cvData.qualifications];
                            list[idx] = { ...list[idx], name: e.target.value };
                            setCvData({ ...cvData, qualifications: list });
                          }}
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => setCvData({ ...cvData, qualifications: cvData.qualifications.filter((_, qd) => qd !== idx) })}
                          className="p-1 px-1.5 border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-red-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. SKILL CATEGORIES INLINE EDITOR */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 tracking-wider">
                      【スキル・カテゴリ別習熟技術】 (Technical Competency Categories)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCvData({ ...cvData, skills: [...cvData.skills, { categoryName: "新しいカテゴリ名", skills: ["例1", "例2"] }] })}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isJapaneseUI ? "カテゴリを追加" : "Add Skill Category"}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {cvData.skills && cvData.skills.map((skillCat, idx) => (
                      <div key={idx} className="p-4 bg-slate-50/40 rounded-lg border border-slate-100 flex gap-4 items-start">
                        <div className="w-44 text-left space-y-1 shrink-0">
                          <label className="text-[10px] uppercase font-bold text-slate-400">カテゴリ名 (Name)</label>
                          <input
                            type="text"
                            value={skillCat.categoryName}
                            onChange={(e) => {
                              const list = [...cvData.skills];
                              list[idx] = { ...list[idx], categoryName: e.target.value };
                              setCvData({ ...cvData, skills: list });
                            }}
                            className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded bg-white font-semibold"
                          />
                        </div>

                        <div className="flex-1 text-left space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">登録技術一覧 (Comma separated tags)</label>
                          <input
                            type="text"
                            value={skillCat.skills.join(", ")}
                            onChange={(e) => {
                              const list = [...cvData.skills];
                              list[idx] = { ...list[idx], skills: e.target.value.split(",").map(s => s.trim()) };
                              setCvData({ ...cvData, skills: list });
                            }}
                            className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded bg-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setCvData({ ...cvData, skills: cvData.skills.filter((_, skd) => skd !== idx) })}
                          className="mt-5 p-1 px-1.5 border border-slate-200 hover:bg-slate-100 text-slate-450 hover:text-red-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. SELF PR & AI TWEAKS */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="self-pr-editor text" className="block text-xs font-bold text-slate-700 tracking-wider">
                      【自己PR】 (Self-PR Narrative highlight - Keigo style)
                    </label>
                    <button
                      type="button"
                      onClick={() => setTweakTarget({ section: "selfPR", value: cvData.selfPR })}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 p-1 px-2.5 rounded-full transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      {isJapaneseUI ? "AI自己PR添削・最適化" : "Optimize with AI PR Writer"}
                    </button>
                  </div>
                  <textarea
                    id="self-pr-editor text"
                    value={cvData.selfPR}
                    onChange={(e) => setCvData({ ...cvData, selfPR: e.target.value })}
                    className="w-full h-40 p-3 text-sm leading-relaxed border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-900"
                  ></textarea>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ===================================== START TAB: PREVIEW SHEET ===================================== */}
        {activeTab === "preview" && (
          <div className="space-y-6" id="tab-preview-content">
            <ShokumukeirekishoPreview data={cvData} isJapanese={isJapaneseUI} />
          </div>
        )}

        {/* ===================================== START TAB: BROWSER EXTENSION ===================================== */}
        {activeTab === "extension" && (
          <div className="space-y-6" id="tab-extension-content">
            <BrowserExtensionPanel isJapanese={isJapaneseUI} onSimulateImport={handleManualImportScrape} />
          </div>
        )}

        {/* ===================================== START TAB: BILINGUAL DICTIONARY ===================================== */}
        {activeTab === "dictionary" && (
          <div className="space-y-6" id="tab-dictionary-content">
            <TranslationDictionaryPanel isJapanese={isJapaneseUI} />
          </div>
        )}

        {/* ===================================== START TAB: SAVED ARCHIVE LISTS ===================================== */}
        {activeTab === "drafts" && (
          <div className="space-y-6 text-left" id="tab-drafts-content">
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
              <div className="border-b border-gray-100 pb-4 mb-5 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h2 className="font-semibold text-lg text-slate-900">
                    {isJapaneseUI ? "保存された職務経歴書ドラフト" : "My Saved Shokumukeirekisho Profiles"}
                  </h2>
                  <p className="text-xs text-slate-505">
                    {isJapaneseUI 
                      ? "クラウド（認証時）またはブラウザローカルストレージに安全に保管された案件リストです。" 
                      : "Secure cloud drafts connected to your account and local backup drafts retrieved dynamically."}
                  </p>
                </div>
                
                {currentUser && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                    <CloudCheck className="w-4 h-4" />
                    CLOUDSYNC ENABLED
                  </div>
                )}
              </div>

              {/* Profiles layout grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="drafts-listing-grid">
                {savedProfiles.length > 0 ? (
                  savedProfiles.map((p) => (
                    <div 
                      key={p.id}
                      className={`rounded-xl border hover:shadow-xs transition-shadow p-5 relative overflow-hidden flex flex-col justify-between ${
                        activeProfileId === p.id 
                          ? "bg-indigo-50/20 border-indigo-200" 
                          : "bg-white border-slate-200"
                      }`}
                    >
                      {activeProfileId === p.id && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-[9px] text-white px-2.5 py-0.5 rounded-bl font-mono font-bold">
                          ACTIVE WORKING ITEM
                        </div>
                      )}

                      <div className="space-y-2 text-left">
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{p.name}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {p.id.substring(0, 16)}... <br />
                          {isJapaneseUI ? "最終更新:" : "Modified:"} {new Date(p.updatedAt).toLocaleDateString()}
                        </p>
                        
                        <div className="py-2 border-t border-b border-slate-100/80 my-2 space-y-1">
                          <p className="text-xs text-slate-700"><strong>{isJapaneseUI ? "氏名:" : "Name:"}</strong> {p.data.personalInfo.name}</p>
                          <p className="text-xs text-slate-650 truncate"><strong>{isJapaneseUI ? "希望職:" : "Role:"}</strong> {p.data.personalInfo.desiredJob || "未記載"}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4" id={`drafts-action-strip-${p.id}`}>
                        <button
                          type="button"
                          onClick={() => handleLoadProfile(p)}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          {isJapaneseUI ? "インポート" : "Load Draft"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmation(p.id)}
                          className="px-2 py-1.5 border border-slate-200 bg-white hover:bg-red-50 text-slate-450 hover:text-red-700 rounded-lg transition-colors shrink-0 cursor-pointer"
                          title="Delete Draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12 text-slate-400 text-xs text-sans space-y-2">
                    <p>{isJapaneseUI ? "下書きはまだ保存されていません。" : "No saved profiles found."}</p>
                    <button
                      onClick={startNewDraft}
                      className="text-xs font-bold text-indigo-600 underline"
                    >
                      {isJapaneseUI ? "最初の履歴書をインポートする" : "Start your first draft by importing a CV"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* AI polish micro-tweak side drawer dialog popover */}
      {tweakTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-left space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                {isJapaneseUI ? "AI和訳・文脈の自動補正リライト" : "AI Context-Aware Tweak Specialist"}
              </h3>
              <button 
                onClick={() => setTweakTarget(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {isJapaneseUI ? "編集中の日本語原文" : "Current Japanese draft text"}
                </label>
                <div className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed max-h-36 overflow-y-auto border border-slate-200 text-slate-700 italic">
                  "{tweakTarget.value}"
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tweak-instruction-textarea" className="block text-xs font-bold text-slate-700">
                  {isJapaneseUI ? "どのような添削を行いますか？" : "How would you like AI to refine this?"}
                </label>
                <textarea
                  id="tweak-instruction-textarea"
                  rows={3}
                  value={tweakInstruction}
                  onChange={(e) => setTweakInstruction(e.target.value)}
                  placeholder={
                    isJapaneseUI
                      ? "e.g., 'より丁寧で謙虚な日本語に直して', 'アジャイルスクラムでの技術リード能力を強調して', '数値実績部分を前面に出して説明を修正して'"
                      : "e.g., 'Make it more professional and humble', 'Highlight AWS container scalability', 'Clarify team sizes handled'"
                  }
                  className="w-full p-2.5 text-xs border border-slate-250 rounded-lg focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end" id="tweak-dialog-actions">
                <button
                  type="button"
                  onClick={() => setTweakTarget(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  {isJapaneseUI ? "キャンセル" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={triggerTweakSection}
                  disabled={isTweaking || !tweakInstruction.trim()}
                  className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                    !tweakInstruction.trim() 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                  }`}
                >
                  {isTweaking ? (
                    <>
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                      {isJapaneseUI ? "リライト中..." : "Polishing..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                      {isJapaneseUI ? "書き換える" : "Polish Text"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-slate-900 text-white rounded-lg shadow-2xl p-4 border border-editorial-border/30 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <span className="flex h-2 w-2 rounded-full bg-brand-gold mt-1.5 animate-ping"></span>
            <div className="flex-1">
              <p className="text-xs font-serif tracking-wide leading-relaxed">{toastMessage.text}</p>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-[#888] hover:text-white text-xs font-bold leading-none cursor-pointer"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[90]">
          <div className="bg-[#FAF8F5] text-editorial-text rounded-sm max-w-md w-full p-6 shadow-2xl border border-[#D1B894]/40 text-left space-y-4 animate-in fade-in zoom-in-95">
            <div className="border-b border-[#D1B894]/30 pb-3">
              <h3 className="font-serif font-bold text-sm text-editorial-text tracking-widest uppercase flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600"></span>
                {isJapaneseUI ? "下書きの削除確認" : "Delete Confirmation"}
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-neutral-600">
              {isJapaneseUI 
                ? "この操作は取り消せません。本当に選択した下書き（プロファイル）を削除してもよろしいですか？"
                : "This action is irreversible. Are you sure you want to permanently delete this profile draft?"}
            </p>
            <div className="flex gap-2 justify-end font-sans" id="delete-dialog-actions">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-editorial-border rounded-none text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                {isJapaneseUI ? "キャンセル" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteProfile(deleteConfirmation);
                  setDeleteConfirmation(null);
                }}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-none text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
              >
                {isJapaneseUI ? "削除する" : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
