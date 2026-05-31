import { create } from 'zustand';

export interface QuestionConfig {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface AssignmentState {
  // Navigation Step Tracker
  currentStep: number;
  
  // Form State Values
  subject: string;
  className: string;
  dueDate: string;
  additionalInstructions: string;
  questionConfigs: QuestionConfig[];
  
  // 💡 Tracking field for uploaded context grounding reference files
  referenceFile: File | null; 
  
  // Asynchronous API Tracker State
  assignmentId: string | null;
  jobId: string | null;
  generationStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper: any | null;

  // Actions / State Setters
  setStep: (step: number) => void;
  // Omit both complex objects from generic text field update mappings safely
  updateFormFields: (fields: Partial<Omit<AssignmentState, 'questionConfigs' | 'referenceFile'>>) => void;
  setQuestionConfigs: (configs: QuestionConfig[]) => void;
  setReferenceFile: (file: File | null) => void; // 💡 Action state modifier setter
  resetStore: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  currentStep: 1,
  subject: '',
  className: '',
  dueDate: '',
  additionalInstructions: '',
  questionConfigs: [
    { type: 'Multiple Choice Questions', count: 5, marksPerQuestion: 1 },
    { type: 'Short Questions', count: 3, marksPerQuestion: 2 }
  ],
  referenceFile: null, // 💡 Initialized default state
  assignmentId: null,
  jobId: null,
  generationStatus: 'idle',
  generatedPaper: null,

  setStep: (step) => set({ currentStep: step }),
  
  updateFormFields: (fields) => set((state) => ({ ...state, ...fields })),
  
  setQuestionConfigs: (configs) => set({ questionConfigs: configs }),

  setReferenceFile: (file) => set({ referenceFile: file }), // 💡 Active store setter assignment
  
  resetStore: () => set({
    currentStep: 1,
    subject: '',
    className: '',
    dueDate: '',
    additionalInstructions: '',
    questionConfigs: [
      { type: 'Multiple Choice Questions', count: 5, marksPerQuestion: 1 },
      { type: 'Short Questions', count: 3, marksPerQuestion: 2 }
    ],
    referenceFile: null, // 💡 Wipes the file configuration cleanly on reset loops
    assignmentId: null,
    jobId: null,
    generationStatus: 'idle',
    generatedPaper: null
  })
}));