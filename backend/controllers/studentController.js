/* ============================
   SKILL GAP ANALYSIS
============================ */

// Determine readiness tier based on match score
function getReadinessTier(score) {
  if (score >= 85)
    return {
      label: "Job Ready",
      color: "green",
      icon: "🟢",
      advice:
        "You're well-prepared for this role. Polish your resume and apply with confidence."
    };

  if (score >= 65)
    return {
      label: "Almost Ready",
      color: "blue",
      icon: "🔵",
      advice:
        "You meet the core requirements. Close the skill gaps below to maximise your chances."
    };

  if (score >= 40)
    return {
      label: "Developing",
      color: "yellow",
      icon: "🟡",
      advice:
        "You have a foundation but need to build more skills. Focus on the top missing skills first."
    };

  return {
    label: "Needs Work",
    color: "red",
    icon: "🔴",
    advice:
      "Significant preparation is needed. Use the learning recommendations to start your journey."
  };
}

export const getSkillGapAnalysis = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const [job, studentProfile] = await Promise.all([
      Job.findById(jobId),
      Student.findOne({ user: req.user.id })
    ]);

    if (!job)
      return res.status(404).json({ message: "Job not found" });

    if (!studentProfile)
      return res
        .status(400)
        .json({ message: "Complete your profile first" });

    const normalize = (s) => String(s || "").trim().toLowerCase();

    const studentSkills = (studentProfile.skills || []).map(normalize);
    const requiredSkills = job.skillsRequired || [];

    const matchedSkills = requiredSkills.filter((skill) =>
      studentSkills.includes(normalize(skill))
    );

    const missingSkills = requiredSkills.filter(
      (skill) => !studentSkills.includes(normalize(skill))
    );

    const totalRequired = requiredSkills.length;

    let skillScore = 0;

    if (totalRequired > 0) {
      skillScore = (matchedSkills.length / totalRequired) * 60;
    } else {
      skillScore = 60;
    }

    const cgpaScore =
      (studentProfile.cgpa || 0) >= (job.cgpa || 0) ? 20 : 10;

    const eligibleBranches = (job.branch || []).map(normalize);

    const branchScore =
      eligibleBranches.length === 0 ||
      eligibleBranches.includes(normalize(studentProfile.branch))
        ? 20
        : 5;

    const matchScore = Math.round(
      skillScore + cgpaScore + branchScore
    );

    const readiness = getReadinessTier(matchScore);

    res.status(200).json({
      matchScore,
      matchedSkills,
      missingSkills,
      readiness
    });
  } catch (err) {
    console.error("SKILL GAP ANALYSIS ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to compute skill gap analysis" });
  }
};

/* ============================
   UPLOAD RESUME & AI PARSE
============================ */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No resume file uploaded" });
    }

    const parser = new PDFParse({
      data: req.file.buffer
    });

    const result = await parser.getText();
    const resumeText = result.text;

    const aiResult = await analyzeResume(resumeText);

    let student = await Student.findOne({
      user: req.user.id
    });

    if (!student) {
      student = new Student({
        user: req.user.id
      });
    }

    if (aiResult.firstName || aiResult.lastName) {
      student.name =
        `${aiResult.firstName || ""} ${aiResult.lastName || ""}`.trim();
    }

    if (aiResult.roll) student.roll = aiResult.roll;
    if (aiResult.college) student.college = aiResult.college;
    if (aiResult.branch) student.branch = aiResult.branch;

    if (
      aiResult.cgpa !== undefined &&
      aiResult.cgpa !== null
    ) {
      student.cgpa = aiResult.cgpa;
    }

    student.resume = `data:application/pdf;base64,${req.file.buffer.toString(
      "base64"
    )}`;

    if (aiResult.skills?.length) {
      const mergedSkills = new Set([
        ...(student.skills || []),
        ...aiResult.skills
      ]);

      student.skills = Array.from(mergedSkills);
    }

    student.aiReadinessScore =
      aiResult.aiReadinessScore || 0;

    student.aiRoadmap =
      aiResult.aiRoadmap || [];

    await student.save();

    res.status(200).json({
      message:
        "Resume parsed and profile updated successfully via AI",
      student: {
        ...student.toObject(),
        firstName: aiResult.firstName || "",
        lastName: aiResult.lastName || ""
      }
    });
  } catch (err) {
    console.error("UPLOAD RESUME ERROR:", err);
    res.status(500).json({
      message:
        err.message || "Failed to process resume"
    });
  }
};