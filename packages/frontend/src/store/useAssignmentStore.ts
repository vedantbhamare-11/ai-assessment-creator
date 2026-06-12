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
  
  // 💡 NEW FORM STATE FIELDS FOR STRATEGY PIVOT
  selectedPatternId: string | null;         // Selected reusable saved pattern layout profile
  primaryFile: File | null;                 // $1st priority context: immediate lecture notes/handwriting upload
  secondaryFileId: string | null;           // $2nd priority context: foreign key pointing to persistent textbook vault
  
  questionConfigs: QuestionConfig[];        // Retained for absolute backwards structural fallback safety
  
  // Asynchronous API Tracker State
  assignmentId: string | null;
  jobId: string | null;
  generationStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper: any | null;

  // Actions / State Setters
  setStep: (step: number) => void;
  // Omit state file pointers and object arrays from generic form text inputs mapping loops safely
  updateFormFields: (fields: Partial<Omit<AssignmentState, 'questionConfigs' | 'primaryFile'>>) => void;
  setQuestionConfigs: (configs: QuestionConfig[]) => void;
  setPrimaryFile: (file: File | null) => void; // State setter for temporary primary note uploads
  resetStore: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  currentStep: 1,
  subject: '',
  className: '',
  dueDate: '',
  additionalInstructions: '',
  
  // Initialize Strategy Defaults
  selectedPatternId: null,
  primaryFile: null,
  secondaryFileId: null,
  
  questionConfigs: [
    { type: 'Multiple Choice Questions', count: 5, marksPerQuestion: 1 },
    { type: 'Short Questions', count: 3, marksPerQuestion: 2 }
  ],
  assignmentId: null,
  jobId: null,
  generationStatus: 'idle',
  generatedPaper: null,

  setStep: (step) => set({ currentStep: step }),
  
  updateFormFields: (fields) => set((state) => ({ ...state, ...fields })),
  
  setQuestionConfigs: (configs) => set({ questionConfigs: configs }),

  setPrimaryFile: (file) => set({ primaryFile: file }), 
  
  resetStore: () => set({
    currentStep: 1,
    subject: '',
    className: '',
    dueDate: '',
    additionalInstructions: '',
    
    selectedPatternId: null,
    primaryFile: null,
    secondaryFileId: null,
    
    questionConfigs: [
      { type: 'Multiple Choice Questions', count: 5, marksPerQuestion: 1 },
      { type: 'Short Questions', count: 3, marksPerQuestion: 2 }
    ],
    assignmentId: null,
    jobId: null,
    generationStatus: 'idle',
    generatedPaper: null
  })
}));