import { Worker, Job } from 'bullmq';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Assignment } from '../models/Assignment.js';
import { connection } from '../config/queue.js'; 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const assessmentResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    aiIntroGreeting: {
      type: Type.STRING,
      description: "A friendly conversational greeting introducing the question paper.",
    },
    sections: {
      type: Type.ARRAY,
      description: "An array containing separate exam sections grouped by question format configurations.",
      items: {
        type: Type.OBJECT,
        properties: {
          sectionLetter: { type: Type.STRING, description: "e.g., 'A', 'B', 'C'" },
          sectionType: { type: Type.STRING, description: "e.g., 'Multiple Choice Questions'" },
          instruction: { type: Type.STRING, description: "Instructions for this section." },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "The core question statement." },
                difficulty: { type: Type.STRING, enum: ["Easy", "Moderate", "Challenging"] },
                marks: { type: Type.INTEGER },
                options: {
                  type: Type.ARRAY,
                  description: "Provide exactly 4 distinct choices if multiple choice format, otherwise leave empty.",
                  items: { type: Type.STRING },
                },
              },
              required: ["text", "difficulty", "marks"],
            },
          },
        },
        required: ["sectionLetter", "sectionType", "instruction", "questions"],
      },
    },
    answerKey: {
      type: Type.ARRAY,
      description: "A comprehensive answer grid mapping complete solutions.",
      items: {
        type: Type.OBJECT,
        properties: {
          questionNumber: { type: Type.INTEGER },
          answerText: { type: Type.STRING, description: "Detailed step-by-step resolution." },
        },
        required: ["questionNumber", "answerText"],
      },
    },
  },
  required: ["aiIntroGreeting", "sections", "answerKey"],
};

export const initAssessmentWorker = () => {
  const assessmentWorker = new Worker(
    'assessmentGeneration', 
    async (job: Job) => {
      const { 
        assignmentId, 
        subject, 
        className, 
        additionalInstructions, 
        blueprintSections, 
        primaryContext, 
        secondaryContext,
        primaryContextBase64,
        primaryContextMimeType
      } = job.data;

      try {
        console.log(`👷 Worker processing job ${job.id} for Assignment ID: ${assignmentId}`);

        await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });

        const stringifiedSectionsRule = blueprintSections.map((sec: any) => (
          `- Section [${sec.sectionLetter}]: Type [${sec.sectionType}], Target [${sec.questionCount} Questions], Marks per item [${sec.marksPerQuestion}m]. Guidelines: ${sec.aiGuidelines || 'Follow system core balance.'}`
        )).join('\n');

        const systemInstruction = `
          You are an expert curriculum design engine built to create balanced academic assessments.
          
          Your output must strictly follow this structural configuration outline:
          ${stringifiedSectionsRule}

          Target Grade Level: ${className}
          Subject Field: ${subject}

          CONTEXTUAL GROUNDING ARCHITECTURE RULES:
          1. PRIMARY LAYER ($1st Priority): You MUST extract all your test questions, physics problems, definitions, and conceptual rules exclusively out of the custom uploaded note data or media buffer provided.
          --- BEGIN TEXT LAYER ---
          ${primaryContext || 'No readable plain text metadata layers.'}
          --- END TEXT LAYER ---

          2. SECONDARY LAYER ($2nd Priority): Use this textbook reference for auxiliary theme formatting if linked.
          --- BEGIN SECONDARY VAULT ---
          ${secondaryContext || 'No textbook linked.'}
          --- END SECONDARY VAULT ---

          3. ADDITIONAL WORKSPACE CRITERIA:
          ${additionalInstructions || 'Standard balanced evaluation grid.'}
        `;

        console.log(`🤖 Communicating with Gemini Engine pipelines...`);

        // 🚀 MULTI-PART PAYLOAD INITIALIZATION: Combines image assets + string text structures natively
        const contentsPayloadArray: any[] = [];

        if (primaryContextBase64 && primaryContextMimeType) {
          console.log("📎 Injecting visual handwritten document base64 inline stream straight to Gemini vision matrix...");
          contentsPayloadArray.push({
            inlineData: {
              data: primaryContextBase64,
              mimeType: primaryContextMimeType
            }
          });
        }

        const generationPrompt = `
          Generate a fully populated, comprehensive exam paper matching the target subject field "${subject}" and grade level "${className}".
          
          CRITICAL GROUNDING DIRECTIVE:
          You MUST design all test questions exclusively from the custom educational material, diagrams, and written notebook text provided in your system instructions and attached file context parts. Do not generate generic questions or use facts outside of the text segments.
          
          Execute the generation loop and return the completed structured assessment object in raw JSON format matching your responseSchema configuration parameters layout.
        `;

        contentsPayloadArray.push({ text: generationPrompt });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contentsPayloadArray,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: assessmentResponseSchema, 
            temperature: 0.15 
          }
        });

        const rawResponseText = response.text || '{}';
        const parsedPayload = JSON.parse(rawResponseText);

        console.log("📦 Deep validating raw payload arrays format blocks alignment data...");

        // Map normalization fields safely to align with Mongoose definitions
        const finalizedSections = (parsedPayload.sections || []).map((sec: any) => ({
          sectionLetter: sec.sectionLetter || 'A',
          sectionType: sec.sectionType || 'General',
          instruction: sec.instruction || 'Answer all questions carefully.',
          questions: (sec.questions || []).map((q: any) => ({
            text: q.text || 'Sample Question Text Block Placeholder',
            difficulty: q.difficulty || 'Moderate',
            marks: Number(q.marks || 1),
            options: Array.isArray(q.options) ? q.options.map(String) : []
          }))
        }));

        const finalizedAnswers = (parsedPayload.answerKey || []).map((ans: any, idx: number) => ({
          questionNumber: Number(ans.questionNumber || (idx + 1)),
          answerText: String(ans.answerText || '')
        }));

        // Write the normalized arrays back to MongoDB
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: 'completed',
          aiIntroGreeting: parsedPayload.aiIntroGreeting || 'Here is your generated paper.',
          sections: finalizedSections,
          answerKey: finalizedAnswers
        });

        console.log(`✅ Job ${job.id} finalized cleanly! Mongoose properties written.`);
        return parsedPayload;

      } catch (workerErr: any) {
        const errString = String(workerErr?.message || JSON.stringify(workerErr));
        if (errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED")) {
          console.warn(`⚠️ Gemini API Quota Exhausted for job ${job.id}. Initiating automatic workspace backoff retry routine...`);
          throw workerErr;
        }

        console.error(`❌ Background Worker ${job.id} collapsed:`, workerErr);
        await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: 'failed' });
        throw workerErr;
      }
    },
    { 
      connection: connection as any,
      concurrency: 1,
      settings: {
        backoffStrategy: () => 25000
      }
    }
  );

  console.log('👷 Background Assessment Worker thread listening for incoming tasks...');
};