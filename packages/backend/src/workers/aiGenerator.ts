import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Google Gen AI SDK with your API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define the explicit JSON response schema requirement for Gemini
const assessmentResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    aiIntroGreeting: {
      type: Type.STRING,
      description: "A friendly, polite conversational greeting introducing the question paper. e.g., 'Certainly! Here is your customized Question Paper...'"
    },
    sections: {
      type: Type.ARRAY,
      description: "An array containing separate exam sections grouped by question format configurations.",
      items: {
        type: Type.OBJECT,
        properties: {
          sectionLetter: { type: Type.STRING, description: "e.g., 'A', 'B', 'C'" },
          sectionType: { type: Type.STRING, description: "e.g., 'Multiple Choice Questions', 'Short Answer Questions'" },
          instruction: { type: Type.STRING, description: "Instructions for this section, e.g., 'Attempt all questions. Each question carries 2 marks.'" },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "The actual core text statement or question question." },
                difficulty: { 
                  type: Type.STRING, 
                  enum: ["Easy", "Moderate", "Challenging"],
                  description: "Balanced distribution classification."
                },
                marks: { type: Type.INTEGER, description: "Allocated scoring mark matching config specifications." }
              },
              required: ["text", "difficulty", "marks"]
            }
          }
        },
        required: ["sectionLetter", "sectionType", "instruction", "questions"]
      }
    },
    answerKey: {
      type: Type.ARRAY,
      description: "A comprehensive answer grid mapping complete solutions corresponding to every section question sequentially.",
      items: {
        type: Type.OBJECT,
        properties: {
          questionNumber: { type: Type.INTEGER },
          answerText: { type: Type.STRING, description: "Detailed structural step-by-step resolution or marking criteria scheme." }
        },
        required: ["questionNumber", "answerText"]
      }
    }
  },
  required: ["aiIntroGreeting", "sections", "answerKey"]
};

interface IJobInput {
  subject: string;
  className: string;
  additionalInstructions?: string;
  questionConfigs: { type: string; count: number; marksPerQuestion: number }[];
}

export const generatePaperWithGemini = async (data: IJobInput) => {
  // Format the input structural configurations clearly for the prompt
  const configurationSummary = data.questionConfigs
    .map((c, idx) => `Section ${String.fromCharCode(65 + idx)}: Create ${c.count} ${c.type} allocating ${c.marksPerQuestion} mark(s) each.`)
    .join('\n');

  const systemInstruction = `
    You are an expert, elite academic test designer and exam creator. 
    Your job is to generate highly comprehensive, professional, and curriculum-accurate exam assessment papers based on user requirements.
    
    CRITICAL RULES:
    1. You must distribute question difficulties naturally across [Easy, Moderate, Challenging].
    2. Maintain strict professional educational tone inside the core exam sheets.
    3. You MUST adhere precisely to the exact question type counts and marks provided in the structural parameters.
  `;

  const userPrompt = `
    Create an academic exam paper using these parameters:
    - Subject Field: ${data.subject}
    - Student Grade/Class Target: ${data.className}
    - Blueprint Configuration Specifications:
    ${configurationSummary}
    
    - Additional Topic Focus Instructions: ${data.additionalInstructions || "None provided."}
  `;

  // Request structural generation from Gemini Flash (Optimized for JSON structuring tasks)
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: assessmentResponseSchema,
      temperature: 0.2, // Low variance to keep accuracy to configuration specs tight
    },
  });

  if (!response.text) {
    throw new Error("Gemini engine failed to generate an output block structure.");
  }

  // Parse the guaranteed JSON text structural output
  return JSON.parse(response.text);
};