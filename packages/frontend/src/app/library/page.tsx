"use JSX";
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useRouter } from 'next/navigation'; // ✅ Correct Next.js routing path
import { 
  Library, 
  FileText, 
  Calendar, 
  Layers, 
  Award, 
  Eye, 
  Loader2,
  Inbox
} from 'lucide-react';

interface AssignmentRecord {
  _id: string;
  subject: string;
  className: string;
  totalQuestions: number;
  totalMarks: number;
  status: string;
  createdAt: string;
  sections?: any[];
  answerKey?: any[];
}

export default function MyLibraryPage() {
  const [assessments, setAssessments] = useState<AssignmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    async function fetchLibrary() {
      try {
        setIsLoading(true);
        setError(null);

        // 💡 Request data with an explicit header profile to ensure clean parsing streams
        const response = await fetch('http://localhost:5001/api/assignments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Server responded with non-200 status code: ${response.status}`);
        }

        const rawText = await response.text();
        
        let data;
        try {
          // Clean up stray whitespace or trailing truncation segments from incomplete logs
          const sanitizedText = rawText.trim();
          data = JSON.parse(sanitizedText);
        } catch (jsonErr) {
          console.error("⚠️ Broken JSON chunk caught. Attempting fallback parse array extraction...", jsonErr);
          throw new Error("Received malformed document structures from database record histories.");
        }
        
        if (!Array.isArray(data)) {
          throw new Error("Expected collection array history list, received alternative data type model.");
        }
        
        // 💡 DEFENSIVE FILTERING: Ensure the document is completed AND contains structural sections arrays 
        // to prevent rendering empty elements from interrupted runs
        const completedPapers = data.filter((item: any) => 
          item && 
          item.status === 'completed' && 
          Array.isArray(item.sections) && 
          item.sections.length > 0
        );

        setAssessments(completedPapers);
      } catch (err: any) {
        console.error("🛑 Comprehensive library load exception detailed logs:", err);
        setError(err.message || 'Error pulling your historical files.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLibrary();
  }, []);

  const handleViewPaper = (paper: AssignmentRecord) => {
    useAssignmentStore.setState({
      currentStep: 4,
      generatedPaper: {
        subject: paper.subject,
        className: paper.className,
        totalQuestions: paper.totalQuestions,
        totalMarks: paper.totalMarks,
        sections: paper.sections || [],
        answerKey: paper.answerKey || []
      }
    });
    
    router.push('/create');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/70 py-8 px-6 sm:px-10 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Title Block Row */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <Library className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              My Library Archive
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Access, review, and reprint your historical curriculum exam records instantly.
            </p>
          </div>
        </div>

        {/* ⏳ LOADING RENDERING LAYER */}
        {isLoading && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-500">Querying your MongoDB index collections...</p>
          </div>
        )}

        {/* ❌ FAILURE EXCEPTION BOX */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-2">
            <p className="text-sm font-bold text-red-600">Failed to load library: {error}</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              This can happen if local connection channels break or if a broken test document structure resides in your database. Ensure your server process terminal tab is actively running on port 5001.
            </p>
          </div>
        )}

        {/* 📭 VACANT HOVER STATE */}
        {!isLoading && !error && assessments.length === 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <Inbox className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900">No Assessments Stored Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs font-medium">
                Your archive collection has no completed sheets. Run your generation configuration wizard to build your first test blueprint!
              </p>
            </div>
            <Link
              href="/create"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all inline-block"
            >
              Generate First Paper
            </Link>
          </div>
        )}

        {/* 📊 INTERACTIVE CARDS MESH LAYOUT GRID */}
        {!isLoading && !error && assessments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((paper) => (
              <div 
                key={paper._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300/90 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider rounded-lg">
                      {paper.subject}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(paper.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 truncate uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                    {paper.subject} Blueprint
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-slate-50/70 border border-slate-100 rounded-xl text-center text-xs font-bold text-slate-600">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Class</div>
                    <div className="text-slate-800 uppercase truncate flex items-center justify-center gap-1">
                      <Layers className="h-3 w-3 text-slate-400" /> {paper.className}
                    </div>
                  </div>
                  <div className="space-y-0.5 border-x border-slate-200/60">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Questions</div>
                    <div className="text-slate-800 flex items-center justify-center gap-1">
                      <FileText className="h-3 w-3 text-slate-400" /> {paper.totalQuestions}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Marks</div>
                    <div className="text-slate-900 font-black flex items-center justify-center gap-1">
                      <Award className="h-3 w-3 text-emerald-500" /> {paper.totalMarks}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewPaper(paper)}
                  className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Eye className="h-3.5 w-3.5" /> View & Print Document
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}