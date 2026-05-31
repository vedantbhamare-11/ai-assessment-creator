// ./src/controllers/assignment.controller.ts
import { Request, Response } from 'express';
import { Assignment } from '../models/Assignment.js';
import { assessmentQueue } from '../config/queue.js';

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, className, dueDate, questionConfigs, additionalInstructions } = req.body;

    // 1. Basic Form Validation (As required by the assignment guidelines)
    if (!subject || !className || !dueDate || !questionConfigs || !Array.isArray(questionConfigs)) {
      res.status(400).json({ error: 'Missing required configuration fields.' });
      return;
    }

    let totalQuestions = 0;
    let totalMarks = 0;

    // Calculate totals and check for negative/empty bounds
    for (const config of questionConfigs) {
      if (!config.type || config.count <= 0 || config.marksPerQuestion <= 0) {
        res.status(400).json({ error: 'Question count and marks must be positive numbers.' });
        return;
      }
      totalQuestions += config.count;
      totalMarks += (config.count * config.marksPerQuestion);
    }

    // 2. Create the placeholder document in MongoDB
    const newAssignment = new Assignment({
      subject,
      className,
      dueDate: new Date(dueDate),
      totalQuestions,
      totalMarks,
      additionalInstructions,
      status: 'pending'
    });

    await newAssignment.save();

    // 3. Push the job to BullMQ for asynchronous AI processing
    const job = await assessmentQueue.add('generatePaper', {
      assignmentId: newAssignment._id,
      subject,
      className,
      questionConfigs,
      additionalInstructions
    });

    // 4. Attach the BullMQ Job ID to our database record for tracking
    newAssignment.jobId = job.id;
    await newAssignment.save();

    // 5. Instantly return success so the client frontend can display a loading screen
    res.status(202).json({
      message: 'Assignment generation started in the background.',
      assignmentId: newAssignment._id,
      jobId: job.id
    });

  } catch (error: any) {
    console.error('❌ Controller Error:', error);
    res.status(500).json({ error: 'Internal Server Error during creation.' });
  }
};