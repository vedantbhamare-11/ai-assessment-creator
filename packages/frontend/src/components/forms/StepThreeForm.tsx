"use JSX";
'use client';

import React, { useState, useRef } from 'react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { ArrowLeft, Sparkles, Loader2, ListChecks, UploadCloud, FileText, X } from 'lucide-react';

export default function StepThreeForm() {
  const store = useAssignmentStore();
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalQuestions = store.questionConfigs.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalMarks = store.questionConfigs.reduce((acc, curr) => acc + ((curr.count || 0) * (curr.marksPerQuestion || 0)), 0);

  // Poll status checker loop to pull asynchronous updates
  const pollGenerationStatus = async (assignmentId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/assignments/${assignmentId}`);
        const data = await res.json();

        if (data.status === 'completed') {
          clearInterval(interval);
          store.updateFormFields({ 
            generationStatus: 'completed',
            generatedPaper: data
          });
          store.setStep(4);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          store.updateFormFields({ generationStatus: 'failed' });
          setLoadingMessage('AI structure processing failed. Try running again.');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  // 💡 Submits a multipart FormData payload instead of a traditional raw JSON string
  const triggerGeneration = async () => {
    try {
      store.updateFormFields({ generationStatus: 'pending' });
      setLoadingMessage('Uploading source documents and building background threads...');

      const formData = new FormData();
      
      // Pack your baseline text field configurations inside a data block key entry string
      const payloadMetadata = {
        subject: store.subject,
        className: store.className,
        dueDate: store.dueDate,
        additionalInstructions: store.additionalInstructions,
        questionConfigs: store.questionConfigs
      };
      
      formData.append('data', JSON.stringify(payloadMetadata));

      // Append your tracking resource file binary stream layer if attached by teacher
      if (store.referenceFile) {
        formData.append('referenceFile', store.referenceFile);
      }

      const response = await fetch('http://localhost:5001/api/assignments', {
        method: 'POST',
        body: formData // 💡 Automatically sets content-type header context maps to multipart/form-data
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server rejected creation sequence.');
      }

      store.updateFormFields({
        assignmentId: result.assignmentId,
        jobId: result.jobId,
        generationStatus: 'processing'
      });

      setLoadingMessage('Gemini Engine is reviewing uploaded context notes material arrays...');
      pollGenerationStatus(result.assignmentId);

    } catch (err: any) {
      console.error(err);
      store.updateFormFields({ generationStatus: 'failed' });
      setLoadingMessage(err.message || 'Network connection pipeline failure.');
    }
  };

  // Document file selection interceptor
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      store.setReferenceFile(e.target.files[0]);
    }
  };

  if (store.generationStatus === 'pending' || store.generationStatus === 'processing') {
    return (
      <div className="bg-white border border-slate-200 p-12 rounded-xl text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <h3 className="text-lg font-bold text-slate-900">Grounding AI & Building Sheets</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          {loadingMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Contextual Reference & Grounding</h3>
        <p className="text-sm text-slate-500">Provide optional reference source materials or notes to guide question generation.</p>
      </div>

      {store.generationStatus === 'failed' && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-lg">
          ❌ {loadingMessage}
        </div>
      )}

      {/* 📎 💡 Premium Upload Area */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <UploadCloud className="h-4 w-4 text-indigo-500" /> Grounding Material (Textbook Chapter / Notes PDF)
        </label>
        
        {!store.referenceFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/10 rounded-xl p-8 text-center cursor-pointer transition-all space-y-2 group"
          >
            <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-indigo-500 mx-auto transition-colors" />
            <p className="text-sm font-bold text-slate-600 group-hover:text-slate-800">Click to select source reference file</p>
            <p className="text-xs text-slate-400 font-medium">Supports PDF, TXT or Markdown up to 10MB</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.txt,.md" 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 max-w-[250px] sm:max-w-md truncate">{store.referenceFile.name}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase">{(store.referenceFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to Ground</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => store.setReferenceFile(null)}
              className="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 rounded-lg transition-colors shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 📝 Additional Topic Focus Instructions */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ListChecks className="h-4 w-4 text-indigo-500" /> Extra Instructions Prompt Focus
        </label>
        <textarea
          rows={3}
          placeholder="e.g., Target sections covered in chapter 3 labs. Ensure challenging items feature high analytical synthesis questions."
          value={store.additionalInstructions}
          onChange={(e) => store.updateFormFields({ additionalInstructions: e.target.value })}
          className="w-full p-4 border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
        />
      </div>

      {/* Footer Controls */}
      <div className="pt-5 border-t border-slate-100 flex justify-between items-center">
        <button
          type="button"
          onClick={() => store.setStep(2)}
          className="h-11 px-5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <button
          type="button"
          onClick={triggerGeneration}
          className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Sparkles className="h-4 w-4" /> Generate Assessment Paper
        </button>
      </div>
    </div>
  );
}