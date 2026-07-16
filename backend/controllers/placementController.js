import Placement from "../models/placement.js";

export const recordPlacement = async (req, res) => {
  try {
    const { company, jobRole, jobType, sector, salary, offerDate, joinDate, outcome } = req.body;

    if (!company || !jobRole || !offerDate) {
      return res.status(400).json({ message: "Company, job role, and offer date are required" });
    }

    const placement = await Placement.create({
      student: req.user._id,
      company,
      jobRole,
      jobType: jobType || "full-time",
      sector: sector || "",
      salary: {
        offered: salary?.offered || 0,
        negotiated: salary?.negotiated || 0,
        final: salary?.final || salary?.offered || 0,
        currency: salary?.currency || "INR"
      },
      offerDate: new Date(offerDate),
      joinDate: joinDate ? new Date(joinDate) : null,
      outcome: outcome || "offer-received",
      statusHistory: [
        {
          status: outcome || "offer-received",
          changedAt: new Date(),
          changedBy: req.user._id
        }
      ]
    });

    res.status(201).json({ success: true, message: "Placement recorded", placement });
  } catch (err) {
    console.error("Record Placement Error:", err);
    res.status(500).json({ message: "Failed to record placement" });
  }
};

export const updatePlacementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome, outcomeNotes, salary } = req.body;

    const placement = await Placement.findById(id);
    if (!placement) {
      return res.status(404).json({ message: "Placement record not found" });
    }

    if (placement.student.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (outcome) {
      placement.outcome = outcome;
      placement.outcomeNotes = outcomeNotes || "";

      placement.statusHistory.push({
        status: outcome,
        changedAt: new Date(),
        changedBy: req.user._id,
        notes: outcomeNotes || ""
      });
    }

    if (salary) {
      placement.salary = {
        offered: salary.offered || placement.salary.offered,
        negotiated: salary.negotiated || placement.salary.negotiated,
        final: salary.final || salary.offered || placement.salary.final,
        currency: salary.currency || "INR"
      };
    }

    await placement.save();
    res.json({ success: true, message: "Placement updated", placement });
  } catch (err) {
    console.error("Update Placement Error:", err);
    res.status(500).json({ message: "Failed to update placement" });
  }
};

export const getStudentPlacements = async (req, res) => {
  try {
    const placements = await Placement.find({ student: req.user._id })
      .sort({ createdAt: -1 });

    res.json(placements);
  } catch (err) {
    console.error("Get Placements Error:", err);
    res.status(500).json({ message: "Failed to fetch placements" });
  }
};

export const getPlacementMetrics = async (req, res) => {
  try {
    const totalStudents = await Placement.distinct("student");
    const totalPlacements = totalStudents.length;

    const outcomes = await Placement.aggregate([
      {
        $group: {
          _id: "$outcome",
          count: { $sum: 1 }
        }
      }
    ]);

    const placedCount = outcomes.find(o => o._id === "placed")?.count || 0;
    const placementRate = totalPlacements > 0 ? (placedCount / totalPlacements * 100).toFixed(2) : 0;

    const salaryStats = await Placement.aggregate([
      { $match: { outcome: "placed", "salary.final": { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgSalary: { $avg: "$salary.final" },
          minSalary: { $min: "$salary.final" },
          maxSalary: { $max: "$salary.final" }
        }
      }
    ]);

    const timeToPacement = await Placement.aggregate([
      { $match: { outcome: "placed", applicationDate: { $exists: true }, joinDate: { $exists: true } } },
      {
        $project: {
          daysToPlace: {
            $divide: [
              { $subtract: ["$joinDate", "$applicationDate"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: "$daysToPlace" }
        }
      }
    ]);

    res.json({
      totalStudents: totalPlacements,
      placementRate: `${placementRate}%`,
      outcomeBreakdown: outcomes,
      salary: salaryStats[0] || { avgSalary: 0, minSalary: 0, maxSalary: 0 },
      averageDaysToPlacement: Math.round(timeToPacement[0]?.avgDays || 0)
    });
  } catch (err) {
    console.error("Get Metrics Error:", err);
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
};

export const verifyPlacement = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can verify placements" });
    }

    const placement = await Placement.findById(id);
    if (!placement) {
      return res.status(404).json({ message: "Placement not found" });
    }

    placement.verified = true;
    placement.verifiedBy = req.user._id;
    placement.verificationDate = new Date();

    await placement.save();

    res.json({ success: true, message: "Placement verified", placement });
  } catch (err) {
    console.error("Verify Placement Error:", err);
    res.status(500).json({ message: "Failed to verify placement" });
  }
};
