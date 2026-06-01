"use JSX";
import Link from "next/link";
import { Sparkles, GraduationCap, Server, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-slate-50/50 px-4">
      <main className="w-full max-w-2xl bg-white border border-slate-200/80 p-8 sm:p-12 rounded-2xl shadow-xl space-y-8 text-center sm:text-left">
        
        {/* Branding Row - 💡 Fully White-Labeled */}
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-black tracking-wider text-slate-800 uppercase text-xs">AI System Portal</span>
        </div>

        {/* Hero Copy Text */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Academic Assessment <br className="hidden sm:inline" />
            <span className="text-indigo-600">Generation Workspace</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-md">
            Design professional curriculum blueprints, balanced question papers, and comprehensive marking grids powered by Gemini Flash and BullMQ.
          </p>
        </div>

        {/* 🛠️ System Architecture Checklist Labels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-semibold text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Server className="h-4 w-4 text-emerald-500" /> Express & Redis Task Queues
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Layers className="h-4 w-4 text-emerald-500" /> Structured Schema Validation
          </div>
        </div>

        {/* Primary Action Route Redirection Link */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <Link
            href="/create"
            className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Sparkles className="h-4 w-4" /> Enter Creator Engine
          </Link>
        </div>

      </main>
    </div>
  );
}