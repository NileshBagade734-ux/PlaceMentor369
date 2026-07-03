/**
 * Placement Tracking Service
 * Handles comprehensive placement journey tracking and accurate metrics computation.
 */

const CONFIRMED_PLACEMENT_STATUSES = ["placed"];
const TERMINAL_STATUSES = [
  "placed",
  "offer-rejected",
  "rejected-by-company",
  "pursuing-further-studies"
];

export const isTerminalStatus = (status) => TERMINAL_STATUSES.includes(status);

export const isConfirmedPlacement = (application) =>
  CONFIRMED_PLACEMENT_STATUSES.includes(application.status) && application.employerConfirmed === true;

/**
 * Transitions an application to a new status, recording full audit history.
 * Enforces that "placed" requires employer confirmation and offer details.
 */
export const transitionApplicationStatus = (application, newStatus, changedBy, options = {}) => {
  const { note = "", offerDetails = null, outcomeType = null, employerConfirmed = false } = options;

  if (newStatus === "placed" && !employerConfirmed) {
    throw new Error("Employer confirmation is required before marking an application as placed");
  }

  if (offerDetails) {
    application.offerDetails = { ...application.offerDetails, ...offerDetails };
  }

  if (outcomeType) {
    application.outcomeType = outcomeType;
  }

  if (employerConfirmed) {
    application.employerConfirmed = true;
  }

  application.recordStatusChange(newStatus, changedBy, note);
  return application;
};

/**
 * Computes accurate placement metrics from a set of applications.
 * Unlike naive counting, this only counts employer-confirmed placements
 * as "true placements" and differentiates offer outcomes.
 */
export const computePlacementMetrics = (applications) => {
  const total = applications.length;

  const confirmedPlacements = applications.filter(isConfirmedPlacement);
  const offersExtended = applications.filter(a =>
    ["offer-extended", "offer-accepted", "offer-negotiating", "offer-rejected", "placed"].includes(a.status)
  );
  const offersRejectedByStudent = applications.filter(a => a.status === "offer-rejected");
  const rejectedByCompany = applications.filter(a => a.status === "rejected-by-company");
  const negotiating = applications.filter(a => a.status === "offer-negotiating");
  const pursuingStudies = applications.filter(a => a.status === "pursuing-further-studies");

  const internships = confirmedPlacements.filter(a => a.outcomeType === "internship");
  const permanentRoles = confirmedPlacements.filter(a => a.outcomeType === "permanent" || a.outcomeType === "ppo");

  const salaries = confirmedPlacements
    .map(a => a.offerDetails?.negotiatedSalary || a.offerDetails?.offeredSalary || 0)
    .filter(s => s > 0);
  const averageSalary = salaries.length > 0
    ? salaries.reduce((sum, s) => sum + s, 0) / salaries.length
    : 0;

  // True placement rate: confirmed placements / total applications (not just "shortlisted")
  const truePlacementRate = total > 0
    ? Math.round((confirmedPlacements.length / total) * 100)
    : 0;

  // Time-to-placement: average days between appliedAt and placementConfirmedAt
  const placementTimes = confirmedPlacements
    .filter(a => a.placementConfirmedAt)
    .map(a => (new Date(a.placementConfirmedAt) - new Date(a.appliedAt)) / (1000 * 60 * 60 * 24));
  const avgTimeToPlacementDays = placementTimes.length > 0
    ? Math.round(placementTimes.reduce((s, t) => s + t, 0) / placementTimes.length)
    : null;

  return {
    totalApplications: total,
    truePlacementRate,
    confirmedPlacements: confirmedPlacements.length,
    offersExtended: offersExtended.length,
    offersRejectedByStudent: offersRejectedByStudent.length,
    rejectedByCompany: rejectedByCompany.length,
    currentlyNegotiating: negotiating.length,
    pursuingFurtherStudies: pursuingStudies.length,
    internshipPlacements: internships.length,
    permanentPlacements: permanentRoles.length,
    averageSalary: Math.round(averageSalary),
    averageTimeToPlacementDays: avgTimeToPlacementDays
  };
};
