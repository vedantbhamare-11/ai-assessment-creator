"use JSX";
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface SectionInput {
  sectionLetter: string;
  sectionType: string;
  instruction: string;
  questionCount: number;
  marksPerQuestion: number;
  aiGuidelines: string;
}

export default function CustomPatternsPage() {
  const router = useRouter();
  const [patternName, setPatternName] = useState('');
  const [subjectDefault, setSubjectDefault] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize with a standard Section A template to assist teachers intuitively
  const [sections, setSections] = useState<SectionInput[]>([
    {
      sectionLetter: 'A',
      sectionType: 'Multiple Choice Questions',
      instruction: 'Attempt all questions. Choose the correct option from the choices given below.',
      questionCount: 5,
      marksPerQuestion: 1,
      aiGuidelines: 'Ensure each question has exactly 4 options labeled A), B), C), and D).'
    }
  ]);

  const handleAddSection = () => {
    const nextLetter = String.fromCharCode(65 + sections.length); // 65 is ASCII 'A'
    setSections([
      ...sections,
      {
        sectionLetter: nextLetter,
        sectionType: '',
        instruction: '',
        questionCount: 3,
        marksPerQuestion: 2,
        aiGuidelines: ''
      }
    ]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length === 1) return; 
    const filtered = sections.filter((_, i) => i !== index);
    const reindexed = filtered.map((sec, i) => ({
      ...sec,
      sectionLetter: String.fromCharCode(65 + i)
    }));
    setSections(reindexed);
  };

  const handleFieldChange = (index: number, field: keyof SectionInput, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleSavePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patternName.trim()) {
      alert("Please provide a recognizable name for this custom pattern profile.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('http://localhost:5001/api/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patternName: patternName.trim(),
          subjectDefault: subjectDefault.trim() || undefined,
          sections
        })
      });

      if (!response.ok) throw new Error("Failed to preserve configuration model.");
      
      alert("Custom Paper Pattern saved successfully!");
      router.push('/create'); 
    } catch (err) {
      console.error(err);
      alert("Could not save pattern configuration profile. Ensure backend service is running on port 5001.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live totalizer aggregation metrics
  const totalQuestions = sections.reduce((sum, sec) => sum + (Number(sec.questionCount) || 0), 0);
  const totalMarks = sections.reduce((sum, sec) => sum + ((Number(sec.questionCount) || 0) * (Number(sec.marksPerQuestion) || 0)), 0);

  return (
    <div className="w-full min-h-screen bg-slate-50 py-8 px-6 sm:px-10 lg:px-12">
      <form onSubmit={handleSavePattern} className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Action Header Banner */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-9 w-9 border border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-400 rounded-xl flex items-center justify-center transition-all"
            >
              <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-600" /> Blueprint Pattern Customizer
              </h1>
              <p className="text-sm text-slate-600 font-semibold mt-0.5">
                Build bespoke exam structures, map marking boundaries, and supply AI guidelines.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Pattern Profile
              </>
            )}
          </button>
        </div>

        {/* Card 1: Core Template Meta Inputs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Pattern Template Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Class 10 CBSE Mid-Term Science Pattern"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-slate-300 focus:border-indigo-600 text-slate-900 placeholder:text-slate-400 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Default Subject Binding <span className="text-slate-500 font-medium lowercase">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g., Science, Mathematics"
              value={subjectDefault}
              onChange={(e) => setSubjectDefault(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-slate-300 focus:border-indigo-600 text-slate-900 placeholder:text-slate-400 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        </div>

        {/* Summary Metric Data Banner Grid strip */}
        <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-sm flex items-center justify-between text-sm font-bold tracking-wide">
          <div className="flex gap-6">
            <div>Sections: <span className="text-indigo-400 font-black">{sections.length}</span></div>
            <div>Total Questions: <span className="text-indigo-400 font-black">{totalQuestions}</span></div>
          </div>
          <div>Total Evaluation Weight: <span className="text-emerald-400 text-base font-black">{totalMarks} Marks</span></div>
        </div>

        {/* Dynamic Section Item Multi-Repeater Canvas Loop */}
        <div className="space-y-5">
          {sections.map((section, index) => (
            <div 
              key={section.sectionLetter}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 relative group hover:border-slate-300 transition-all"
            >
              {/* Card Upper Action Indicator Row */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="h-7 px-4 bg-indigo-600 text-white font-black text-xs tracking-wider uppercase rounded-lg flex items-center justify-center shadow-sm">
                  Section {section.sectionLetter}
                </span>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(index)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center transition-all md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2]" />
                  </button>
                )}
              </div>

              {/* Form Numeric and Character Properties Cells Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Question Category Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Case-Based Assertion-Reasoning"
                    value={section.sectionType}
                    onChange={(e) => handleFieldChange(index, 'sectionType', e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-slate-300 focus:border-indigo-600 text-slate-900 placeholder:text-slate-400 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Questions Count</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={section.questionCount}
                    onChange={(e) => handleFieldChange(index, 'questionCount', parseInt(e.target.value) || 0)}
                    className="w-full h-11 px-4 bg-white border border-slate-300 focus:border-indigo-600 text-slate-900 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Marks Per Question</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={section.marksPerQuestion}
                    onChange={(e) => handleFieldChange(index, 'marksPerQuestion', parseInt(e.target.value) || 0)}
                    className="w-full h-11 px-4 bg-white border border-slate-300 focus:border-indigo-600 text-slate-900 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Instruction configuration field label cell */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Explicit Teacher Instruction Text</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Answer all questions. Each question carries specified marks."
                  value={section.instruction}
                  onChange={(e) => handleFieldChange(index, 'instruction', e.target.value)}
                  className="w-full h-11 px-4 bg-white border border-slate-300 focus:border-indigo-600 text-slate-900 placeholder:text-slate-400 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* AI Few-Shot performance grounding template examples */}
              <div className="space-y-2">
                <label className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Grounding Prompt AI Guidelines / Few-Shot Examples
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide an example question layout parameters (e.g., 'Ensure questions use a brief context paragraph setup followed by a statement and a counter-reasoning argument block.')"
                  value={section.aiGuidelines}
                  onChange={(e) => handleFieldChange(index, 'aiGuidelines', e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-300 focus:border-indigo-600 text-slate-900 placeholder:text-slate-400 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
                />
              </div>

            </div>
          ))}
        </div>

        {/* Append button trigger array handler cell component control row */}
        <button
          type="button"
          onClick={handleAddSection}
          className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Append Next Structural Section Block
        </button>

      </form>
    </div>
  );
}