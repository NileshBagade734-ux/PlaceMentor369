import Application from "../models/application.js";
import Job from "../models/job.js";
import Student from "../models/student.js";
import { APPLICATION_STATUS } from "../constants/applicationStatus.js";

/**
 * Month name lookup for aggregation results.
 */
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * GET /api/admin/analytics
 *
 * Runs 6 MongoDB aggregation pipelines in parallel and returns
 * pre-formatted data for Chart.js consumption.
 */
export const getAnalytics = async (req, res) => {
  try {
    // Calculate date 12 months ago for time-based queries
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [
      applicationsPerMonth,
      statusBreakdown,
      demandedSkills,
      applicationsPerCompany,
      studentsPerBranch,
      jobPostingsTrend
    ] = await Promise.all([
      // ─── 1. Applications Per Month (last 12 months) ───
      Application.aggregate([
        { $match: { appliedAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$appliedAt" },
              month: { $month: "$appliedAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),

      // ─── 2. Application Status Breakdown ───
      Application.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // ─── 3. Most Demanded Skills (top 10) ───
      Job.aggregate([
        { $match: { status: "approved" } },
        { $unwind: "$skillsRequired" },
        {
          $group: {
            _id: { $toLower: { $trim: { input: "$skillsRequired" } } },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // ─── 4. Applications Per Company (top 10) ───
      Application.aggregate([
        {
          $lookup: {
            from: "jobs",
            localField: "job",
            foreignField: "_id",
            as: "jobDetails"
          }
        },
        { $unwind: "$jobDetails" },
        {
          $group: {
            _id: "$jobDetails.company",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // ─── 5. Students Per Branch ───
      Student.aggregate([
        {
          $match: {
            branch: { $exists: true, $ne: "" }
          }
        },
        {
          $group: {
            _id: "$branch",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // ─── 6. Job Postings Trend (last 12 months) ───
      Job.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ])
    ]);

    // ─── Format results into Chart.js-ready { labels, data } ───

    // 1. Applications Per Month
    const appsByMonth = {
      labels: applicationsPerMonth.map(
        (r) => `${MONTH_NAMES[r._id.month - 1]} ${r._id.year}`
      ),
      data: applicationsPerMonth.map((r) => r.count)
    };

    // 2. Status Breakdown
    const statusLabels = {
      [APPLICATION_STATUS.APPLIED]: "Applied",
      [APPLICATION_STATUS.SHORTLISTED]: "Shortlisted",
      [APPLICATION_STATUS.REJECTED]: "Rejected",
    };
    const statusData = {
      labels: statusBreakdown.map(
        (r) => statusLabels[r._id] || r._id
      ),
      data: statusBreakdown.map((r) => r.count)
    };

    // 3. Most Demanded Skills
    const skillsData = {
      labels: demandedSkills.map((r) => r._id),
      data: demandedSkills.map((r) => r.count)
    };

    // 4. Applications Per Company
    const companyData = {
      labels: applicationsPerCompany.map((r) => r._id),
      data: applicationsPerCompany.map((r) => r.count)
    };

    // 5. Students Per Branch
    const branchData = {
      labels: studentsPerBranch.map((r) => r._id),
      data: studentsPerBranch.map((r) => r.count)
    };

    // 6. Job Postings Trend
    const jobsTrend = {
      labels: jobPostingsTrend.map(
        (r) => `${MONTH_NAMES[r._id.month - 1]} ${r._id.year}`
      ),
      data: jobPostingsTrend.map((r) => r.count)
    };

    // ─── Compute acceptance rate ───
    const totalApps = statusBreakdown.reduce((sum, r) => sum + r.count, 0);
    const shortlistedCount =
      statusBreakdown.find((r) => r._id === APPLICATION_STATUS.SHORTLISTED)?.count || 0;
    const acceptanceRate =
      totalApps > 0 ? Math.round((shortlistedCount / totalApps) * 100) : 0;

    res.status(200).json({
      applicationsPerMonth: appsByMonth,
      statusBreakdown: statusData,
      demandedSkills: skillsData,
      applicationsPerCompany: companyData,
      studentsPerBranch: branchData,
      jobPostingsTrend: jobsTrend,
      acceptanceRate
    });
  } catch (err) {
    console.error("Analytics aggregation error:", err);
    res.status(500).json({
      message: "Failed to load analytics",
      error: err.message
    });
  }
};
