import express from 'express';
import { generateQuestions, evaluateAnswers } from '../controllers/interviewController.js';

const router = express.Router();

router.post('/generate-questions', generateQuestions);
router.post('/evaluate', evaluateAnswers);

export default router;
