import { normalizeText, analyzeResumeStructure } from "../utils/resumeParser.js";

describe("ATS Resume Parser Utilities", () => {
  test("normalizeText cleans non-standard controls and collapses newlines", () => {
    const raw = "John Doe \u0000\u0007\n\n\n\n\nSoftware Engineer";
    const cleaned = normalizeText(raw);
    expect(cleaned).toContain("John Doe");
    expect(cleaned).toContain("Software Engineer");
    expect(cleaned).not.toContain("\u0000");
  });

  test("analyzeResumeStructure detects sections and contact info", () => {
    const sampleResume = `
      John Doe
      Email: john.doe@example.com | Phone: (555) 123-4567
      
      Education:
      Bachelor of Science in Computer Science

      Experience:
      Software Engineering Intern at TechCorp

      Projects:
      PlaceMentor AI Platform
    `;

    const result = analyzeResumeStructure(sampleResume);
    expect(result.hasEmail).toBe(true);
    expect(result.hasPhone).toBe(true);
    expect(result.sectionsDetected).toContain("Education");
    expect(result.sectionsDetected).toContain("Experience");
    expect(result.sectionsDetected).toContain("Projects");
    expect(result.wordCount).toBeGreaterThan(15);
  });
});
