// ./src/routes/assignment.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { Assignment } from '../models/Assignment.js';
import { assessmentQueue } from '../config/queue.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Intercept files safely in system memory buffers

router.post('/', upload.single('referenceFile'), async (req, res) => {
  try {
    // 💡 Parse incoming multipart string payload to JSON object
    const bodyData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    
    const { subject, className, dueDate, additionalInstructions, questionConfigs } = bodyData;

    // Defensive array guard for parsing form-data fields safely
    const configsArray = Array.isArray(questionConfigs) ? questionConfigs : [];

    // Calculate metadata blueprints totals summaries
    const totalQuestions = configsArray.reduce((acc: number, curr: any) => acc + parseInt(curr.count || 0), 0);
    const totalMarks = configsArray.reduce((acc: number, curr: any) => acc + (parseInt(curr.count || 0) * parseInt(curr.marksPerQuestion || 0)), 0);

    // Persist baseline configuration state inside MongoDB
    const assignment = new Assignment({
      subject,
      className,
      dueDate: new Date(dueDate),
      totalQuestions,
      totalMarks,
      additionalInstructions,
      status: 'pending',
      sections: [],
      answerKey: [],
      referenceFileMimeType: req.file?.mimetype || undefined
    });

    await assignment.save();

    // 💡 CRITICAL FIX: Convert raw binary Buffer to a stable Base64 string.
    // This stops BullMQ serialization from converting your file data into an empty object inside Redis!
    let fileBase64: string | undefined = undefined;
    if (req.file && req.file.buffer) {
      fileBase64 = req.file.buffer.toString('base64');
    }

    // Push task into Redis using your matching 'assessmentQueue' instance
    const job = await assessmentQueue.add('assessmentGeneration', {
      assignmentId: assignment._id,
      subject,
      className,
      questionConfigs: configsArray,
      additionalInstructions,
      // 💡 Pass as a serialized-safe string block rather than an active system buffer stream
      fileBuffer: fileBase64, 
      fileMimeType: req.file?.mimetype || undefined
    });

    res.status(202).json({
      message: "Assignment generation started in the background with file grounding data targets.",
      assignmentId: assignment._id,
      jobId: job.id
    });

  } catch (error: any) {
    console.error("Endpoint crash error details:", error);
    res.status(500).json({ error: "Failed to initialize creation workflow background layers." });
  }
});
router.get('/', async (req, res) => {
  try {
    console.log("🔍 Library index request received. Fetching records from MongoDB...");
    
    const historyList = await Assignment.find()
      .sort({ createdAt: -1 })
      .select('-__v'); // Safely strips out Mongoose version tracks

    console.log(`✅ Successfully extracted ${historyList.length} total assignment metadata entries.`);
    res.json(historyList);
  } catch (error: any) {
    console.error('❌ MongoDB database read operation crashed:', error);
    res.status(500).json({ error: 'Failed to retrieve stored assessments repository data layers.' });
  }
});
// Simple validation route to pull generated papers
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching assignment data layer' });
  }
});

// 🗑️ DELETE /api/assignments/:id - Removes a document permanently from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Received deletion request for Assignment ID: ${id}`);

    const deletedAssignment = await Assignment.findByIdAndDelete(id);

    if (!deletedAssignment) {
      return res.status(404).json({ error: 'Assignment record not found.' });
    }

    console.log(`✅ Assignment ${id} successfully scrubbed from database.`);
    res.json({ message: 'Assignment permanently deleted successfully.' });
  } catch (error: any) {
    console.error('❌ MongoDB database delete operation crashed:', error);
    res.status(500).json({ error: 'Failed to delete assignment record from the database.' });
  }
});
export default router;