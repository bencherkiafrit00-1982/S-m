import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidFiles';
import { 
  Folder, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Archive, 
  Terminal, 
  CheckCircle, 
  ExternalLink,
  Smartphone,
  Layers,
  Cpu
} from 'lucide-react';
import JSZip from 'jszip';

export const AndroidCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[5]); // Default to SimulationEngine.kt or CircuitModel.kt
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.path.split('/').pop() || selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add project files
      ANDROID_PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.code);
      });

      // Add README.md with clear instructions
      const readme = `# SimuRelay - Electromechanical Relay Logic Simulator for Android
تطبيق أندرويد مبني بلغة Kotlin و Jetpack Compose لمحاكاة دوائر التحكم الكهربائية الكهروميكانيكية.

## متطلبات التشغيل:
- Android Studio Jellyfish / Koala أو أحدث
- JDK 17 أو JDK 21
- Android SDK Platform 35 (Min SDK 26)

## خطوات التشغيل:
1. فك ضغط هذا المجلد.
2. افتح Android Studio واختر "Open" وحدد هذا المجلد.
3. انتظر انتهاء Gradle Sync.
4. اضغط على زر "Run app" (Shift + F10) لتشغيل التطبيق على المحاكي أو هاتفك.
`;
      zip.file('README.md', readme);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SimuRelay_Android_Studio_Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Banner / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-950 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              مشروع أندرويد ستوديو الكامل (Android Studio Jetpack Compose Project)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            كود Kotlin كامل ونظيف، مقسم وفق معمارية MVVM مع محرك محاكاة رياضي وواجهات Jetpack Compose قابلة للتشغيل المباشر.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition active:scale-95 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>{isZipping ? 'جاري تجميع الملفات...' : 'تنزيل المشروع كاملاً (Android Studio ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Main File Explorer & Code Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Sidebar: File Tree */}
        <div className="lg:col-span-4 bg-slate-950/70 border-r border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
              <span>ملفات المشروع (Project Files)</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                {ANDROID_PROJECT_FILES.length} ملفات
              </span>
            </div>

            <div className="space-y-1">
              {ANDROID_PROJECT_FILES.map(file => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.path}</span>
                    </div>
                    <span className="text-[10px] uppercase font-sans text-slate-500 ml-2">
                      {file.language}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Android Version & Setup Info Box */}
          <div className="mt-6 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>مواصفات بيئة التشغيل:</span>
            </div>
            <ul className="text-[11px] space-y-1 text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-300">Target SDK:</strong> Android 15 (API 35)</li>
              <li><strong className="text-slate-300">Min SDK:</strong> Android 8.0 (API 26)</li>
              <li><strong className="text-slate-300">Compose BOM:</strong> 2024.10.01</li>
              <li><strong className="text-slate-300">Kotlin:</strong> 2.0.21</li>
            </ul>
          </div>
        </div>

        {/* Right Pane: Code Viewer */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950">
          {/* File Header Details */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">{selectedFile.path}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>

              <button
                onClick={handleDownloadSingle}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل الملف</span>
              </button>
            </div>
          </div>

          {/* Description of current file */}
          <div className="px-5 py-2 bg-slate-900/40 border-b border-slate-850 text-xs text-amber-300/80">
            {selectedFile.descriptionAr}
          </div>

          {/* Code Content */}
          <div className="flex-1 p-5 overflow-auto max-h-[560px]">
            <pre className="font-mono text-xs text-slate-300 leading-relaxed tab-size-4">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
