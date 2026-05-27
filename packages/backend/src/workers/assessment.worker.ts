import { Worker, Job } from 'bullmq';
import { connection } from '../config/queue.js';
import { Assignment } from '../models/Assignment.js';
import { generatePaperWithGemini } from './aiGenerator.js';

// Enclose the worker inside a named export function to ensure explicit initialization on boot
export const initAssessmentWorker = () => {
  const assessmentWorker = new Worker(
    'assessmentGeneration',
    async (job: Job) => {
      console.log(`👷 Worker picked up job ${job.id}: Connecting to Gemini Engine...`);
      
      try {
        const { assignmentId, subject, className, questionConfigs, additionalInstructions } = job.data;

        // 1. Mark tracker progress status to 'processing'
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });

        // 2. Pass parameters straight into the Gemini execution handler
        const aiGeneratedPaper = await generatePaperWithGemini({
          subject,
          className,
          questionConfigs,
          additionalInstructions
        });

        // 3. Persist the verified structural JSON right back into MongoDB
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: 'completed',
          aiIntroGreeting: aiGeneratedPaper.aiIntroGreeting,
          sections: aiGeneratedPaper.sections,
          answerKey: aiGeneratedPaper.answerKey
        });

        console.log(`✅ AI Assessment Generation Complete for Assignment Record ID: ${assignmentId}`);
      } catch (error) {
        console.error(`❌ Worker AI Execution Crash on Job ${job.id}:`, error);
        
        // Ensure database state mirrors the failure state
        await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: 'failed' });
        
        throw error; // Re-throw so BullMQ can handle exponential backoff retries
      }
    },
    { connection: connection as any }
  );

  console.log('👷 Background Assessment Worker thread listening for incoming tasks...');
};