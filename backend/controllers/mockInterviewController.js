import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateQuestions = async (req, res) => {
  try {
    const { domain, type, experienceLevel = "beginner" } = req.body;

    if (!domain || !type) {
      return res.status(400).json({ message: "Domain and type are required" });
    }

    const prompt = `You are an expert technical interviewer. Generate exactly 5 interview questions for a ${experienceLevel} level candidate in the domain of "${domain}". The interview type is "${type}". 
    Format the output as a clean JSON array of strings, with no markdown code blocks or extra text. Just the JSON array.
    Example: ["Question 1?", "Question 2?", ...]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let textResponse = response.text;
    
    // Clean up potential markdown formatting
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (textResponse.startsWith('```')) {
      textResponse = textResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const questions = JSON.parse(textResponse.trim());

    res.status(200).json({ questions });
  } catch (error) {
    console.error("GENERATE QUESTIONS ERROR:", error);
    res.status(500).json({ message: "Failed to generate questions. Ensure GEMINI_API_KEY is set." });
  }
};

export const evaluateAnswers = async (req, res) => {
  try {
    const { domain, type, qnaList } = req.body;

    if (!qnaList || !Array.isArray(qnaList) || qnaList.length === 0) {
      return res.status(400).json({ message: "Provide a list of questions and answers (qnaList)" });
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate for a "${domain}" role (${type} interview).
    Review the following questions and the candidate's answers.
    ${JSON.stringify(qnaList, null, 2)}
    
    Provide an evaluation. Format your response strictly as a JSON object with the following keys:
    - score: A number out of 100 representing the overall performance.
    - feedback: A paragraph summarizing their overall performance.
    - tips: An array of strings containing actionable communication and technical improvement tips.
    - detailedAnalysis: An array of objects, each containing: "question", "answer", and "feedback" (specific feedback for that answer).
    
    Do not include markdown formatting like \`\`\`json. Return only the valid JSON string.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let textResponse = response.text;
    
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (textResponse.startsWith('```')) {
      textResponse = textResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const evaluation = JSON.parse(textResponse.trim());

    res.status(200).json({ evaluation });
  } catch (error) {
    console.error("EVALUATE ANSWERS ERROR:", error);
    res.status(500).json({ message: "Failed to evaluate answers. Ensure GEMINI_API_KEY is set." });
  }
};
