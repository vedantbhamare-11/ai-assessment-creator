"use JSX";
'use client';

import React from 'react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { ClipboardList, Settings, Sparkles, FileText } from 'lucide-react';
import StepOneForm from '@/components/forms/StepOneForm';
import StepTwoForm from '@/components/forms/StepTwoForm';
import StepThreeForm from '@/components/forms/StepThreeForm';
import StepFourPreview from '@/components/preview/StepFourPreview';

export default function CreateAssessmentPage() {
  const currentStep = useAssignmentStore((state) => state.currentStep);

  // Structural array to render the horizontal progress stepper dynamically
  const stepsConfig = [
    { step: 1, label: 'General Info', icon: ClipboardList },
    { step: 2, label: 'Blueprint Configuration', icon: Settings },
    { step: 3, label: 'Review & Run', icon: Sparkles },
    { step: 4, label: 'Document Viewer', icon: FileText },
  ];

  // Helper render loop to switch matching panels cleanly
  const renderActiveStepComponent = () => {
    switch (currentStep) {
      case 1: return <StepOneForm />;
      case 2: return <StepTwoForm />;
      case 3: return <StepThreeForm />;
      case 4: return <StepFourPreview />;
      default: return <StepOneForm />;
    }
  };

  return (
    /* 💡 Added print:bg-white print:py-0 print:px-0 to strip out wrapper styles during printing */
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto print:max-w-full">
        
        {/* Header Layout branding - 💡 Fully White-Labeled */}
        <div className="mb-10 text-center print:hidden">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI Assessment Engine
          </h1>
          <p className="mt-2 text-md text-slate-600">
            Create professional, curriculum-aligned blueprints in seconds.
          </p>
        </div>

        {/* 🗺️ Horizontal Interactive Progress Stepper - 💡 HIDDEN ON PRINT */}
        <div className="mb-10 bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm print:hidden">
          <div className="flex items-center justify-between relative">
            {stepsConfig.map((item, index) => {
              const IconComponent = item.icon;
              const isCompleted = currentStep > item.step;
              const isActive = currentStep === item.step;

              return (
                <div key={item.step} className="flex flex-1 items-center last:flex-none">
                  {/* Individual Step Circle Node */}
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isActive
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span
                      className={`absolute -bottom-7 whitespace-nowrap text-xs font-medium tracking-wide ${
                        isActive ? 'text-indigo-600 font-semibold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Connector line tracking bar bridges */}
                  {index < stepsConfig.length - 1 && (
                    <div className="mx-4 flex-1 h-0.5 bg-slate-100 rounded">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Spacer layout buffer matching text elements positioning labels offset */}
          <div className="h-4" />
        </div>

        {/* 🧱 Active Form Sub-View Presentation Window */}
        <div className="transition-all duration-300 transform print:m-0 print:p-0">
          {renderActiveStepComponent()}
        </div>

      </div>
    </div>
  );
}