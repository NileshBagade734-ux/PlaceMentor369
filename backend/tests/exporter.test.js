import { convertToCSV, formatApplicantsExport } from "../utils/exporter.js";

describe("Recruiter Exporter Utility", () => {
  test("convertToCSV generates valid CSV string with headers and escaped values", () => {
    const data = [
      { name: 'Alice "Tech"', role: "Developer, Senior", score: 95 },
      { name: "Bob", role: "Manager", score: 88 }
    ];
    const csv = convertToCSV(data, ["name", "role", "score"]);
    expect(csv).toContain("name,role,score");
    expect(csv).toContain('"Alice ""Tech"""');
    expect(csv).toContain('"Developer, Senior"');
  });

  test("formatApplicantsExport produces CSV format object correctly", () => {
    const mockApplicants = [
      {
        _id: "app123",
        student: { name: "Jane Student", branch: "CSE", cgpa: 9.1 },
        job: { title: "Software Engineer", company: "Google" },
        status: "Shortlisted",
        createdAt: "2026-01-15T00:00:00.000Z"
      }
    ];

    const result = formatApplicantsExport(mockApplicants, "csv");
    expect(result.contentType).toBe("text/csv");
    expect(result.data).toContain("Jane Student");
    expect(result.data).toContain("Software Engineer");
  });
});
