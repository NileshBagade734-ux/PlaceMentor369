import { GoogleGenAI } from '@google/genai';

export const analyzeResume = async (resumeText) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }

  // Initialize the Google Gen AI SDK
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const prompt = `
      You are an expert technical recruiter and AI Career Assistant.
      I will provide you with the raw text extracted from a student's resume.
      Your task is to analyze it and extract the following information in strict JSON format.
      Do not include any markdown formatting like \`\`\`json or \`\`\`. Just return the raw JSON string.
      
      Extract the following fields:
      - "firstName": The student's First Name. If not found, return an empty string.
      - "lastName": The student's Last Name or Surname. If not found, return an empty string.
      - "roll": The student's college Roll Number, Student ID, Enrollment Number, Alphanumeric ID, or Registration Number (e.g., 24CSB0B36, 22-CSE-102). Actively search the entire resume for any unique alphanumeric student identifier, enrollment code, or college registration ID. If not found, return an empty string.
      - "college": The student's college or university. If not found, return an empty string.
      - "branch": The student's degree, major, or branch (e.g., Computer Science, Mechanical). If not found, return an empty string.
      - "cgpa": The student's CGPA or GPA as a number (e.g. 8.5 or 3.8). Extract only the numerical decimal value. If written as a percentage (e.g. 85%), convert it to a 10-point scale (e.g. 8.5). If not found or not specified, return 0.
      - "skills": An array of technical skills mentioned (e.g., ["JavaScript", "React", "Python"]).
      - "aiReadinessScore": A number from 0 to 100 indicating how "placement-ready" the resume looks based on standard industry expectations for entry-level tech roles.
      - "aiRoadmap": An array of 3 to 5 actionable steps the student can take to improve their skills and resume (e.g., ["Build a full-stack project using React and Node.js", "Contribute to open-source projects"]).

      Resume Text:
      """
      ${resumeText}
      """
    `;

    let response;
    let retries = 5;
    let delay = 2000;

    for (let i = 0; i < retries; i++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });
        break; // Success!
      } catch (err) {
        const errMsg = err.message || String(err);
        console.warn(`⚠️ Gemini API Attempt ${i + 1} failed: ${errMsg}`);
        
        let sleepDuration = delay * Math.pow(2, i);
        
        // Intelligent Quota Recovery: parse Google's exact retryDelay if provided
        try {
          const jsonStart = errMsg.indexOf("{");
          if (jsonStart !== -1) {
            const errorDetails = JSON.parse(errMsg.slice(jsonStart));
            if (errorDetails?.error?.details) {
              const retryInfo = errorDetails.error.details.find(d => 
                d["@type"] && d["@type"].includes("RetryInfo")
              );
              if (retryInfo?.retryDelay) {
                const match = retryInfo.retryDelay.match(/([\d\.]+)/);
                if (match) {
                  const parsedDelay = Math.ceil(parseFloat(match[1]) * 1000) + 1500; // Add 1.5s safety buffer
                  console.log(`[Gemini API] Quota hit. Sleeping for ${parsedDelay / 1000}s to let limits clear...`);
                  sleepDuration = parsedDelay;
                }
              }
            }
          }
        } catch (e) {
          // ignore parsing failures
        }

        if (i === retries - 1) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, sleepDuration));
      }
    }
    
    let textOutput = response.text;
    
    // Clean up any potential markdown formatting
    textOutput = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // Robust extraction of JSON block to prevent SyntaxError
    const firstBrace = textOutput.indexOf('{');
    const lastBrace = textOutput.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        textOutput = textOutput.substring(firstBrace, lastBrace + 1);
    }
    
    const parsedData = JSON.parse(textOutput);
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    const errMsg = error.message || String(error);
    const isOverloaded = errMsg.includes("503") || errMsg.toLowerCase().includes("overloaded");
    const isRateLimited = errMsg.includes("429") || errMsg.toLowerCase().includes("rate");
    
    if (isOverloaded) {
      throw new Error("Google Gemini AI is temporarily overloaded due to high traffic. Please wait 5-10 seconds and try again!");
    } else if (isRateLimited) {
      throw new Error("Gemini API Free Rate Limit reached. Please wait 10-15 seconds and try again!");
    }
    throw new Error("Failed to analyze resume with AI: " + errMsg);
  }
};
