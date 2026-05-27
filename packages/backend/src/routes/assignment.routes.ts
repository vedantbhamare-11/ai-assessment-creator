import { Router } from 'express';
import { createAssignment } from '../controllers/assignment.controller.js';
import { Assignment } from '../models/Assignment.js'; // 💡 Import model directly for simple query fetch

const router = Router();

// Endpoint matching our creation pipeline
router.post('/', createAssignment);

// 💡 New simple validation route to pull generated papers
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

export default router;