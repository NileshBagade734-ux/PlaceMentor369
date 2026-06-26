import { GoogleGenAI } from '@google/genai';

export const generateInterviewQuestions = async (resumeText, jobDescription) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are an expert technical interviewer.
    I will provide you with a student's resume and a job description.
    Your task is to generate 3 tailored interview questions that test the candidate's fit for this specific job, considering their background.
    
    Return the response in strict JSON format.
    Extract the following fields:
    - "questions": An array of 3 string questions.
    
    Resume Text:
    """
    ${resumeText || "No resume provided. Ask general frontend/backend questions."}
    """

    Job Description:
    """
    ${jobDescription || "No specific job description provided. Ask general software engineering questions."}
    """
  `;

  let response;
  let retries = 3;
  for (let i = 0; i < retries; i++) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      break;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }

  let textOutput = response.text;
  textOutput = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = textOutput.indexOf('{');
  const lastBrace = textOutput.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
      textOutput = textOutput.substring(firstBrace, lastBrace + 1);
  }
  
  return JSON.parse(textOutput);
};

export const evaluateInterviewAnswers = async (questions, answers) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are an expert technical interviewer evaluating a candidate's responses.
    I will provide you with the questions asked and the candidate's answers.
    Your task is to evaluate the answers, give a score out of 10, and provide constructive feedback.
    
    Return the response in strict JSON format.
    Extract the following fields:
    - "score": A number from 0 to 10.
    - "overall": A string with overall feedback.
    - "strengths": An array of strings highlighting strong points.
    - "areasForImprovement": An array of strings highlighting areas to improve.

    Questions:
    ${JSON.stringify(questions)}

    Answers:
    ${JSON.stringify(answers)}
  `;

  let response;
  let retries = 3;
  for (let i = 0; i < retries; i++) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      break;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }

  let textOutput = response.text;
  textOutput = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = textOutput.indexOf('{');
  const lastBrace = textOutput.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
      textOutput = textOutput.substring(firstBrace, lastBrace + 1);
  }
  
  return JSON.parse(textOutput);
};
