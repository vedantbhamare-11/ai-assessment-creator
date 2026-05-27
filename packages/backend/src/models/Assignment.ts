import { Schema, model, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
}

export interface IAnswerItem {
  questionNumber: number;
  answerText: string;
}

export interface IAssignment extends Document {
  schoolName: string;
  subject: string;
  className: string;
  dueDate: Date;
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileUrl?: string; 
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  aiIntroGreeting?: string; 
  sections: {
    sectionLetter: string; 
    sectionType: string;   
    instruction: string;   
    questions: IQuestion[];
  }[];
  answerKey: IAnswerItem[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
  marks: { type: Number, required: true }
});

const AnswerItemSchema = new Schema<IAnswerItem>({
  questionNumber: { type: Number, required: true },
  answerText: { type: String, required: true }
});

const AssignmentSchema = new Schema<IAssignment>({
  schoolName: { type: String, default: 'Delhi Public School, Sector-4, Bokaro' },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  dueDate: { type: Date, required: true },
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  additionalInstructions: { type: String },
  fileUrl: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  jobId: { type: String },
  aiIntroGreeting: { type: String },
  sections: [{
    sectionLetter: { type: String, required: true },
    sectionType: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: [QuestionSchema]
  }],
  answerKey: [AnswerItemSchema]
}, { timestamps: true });

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);