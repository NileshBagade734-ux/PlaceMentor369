// Maps skills to a small set of curated, free learning resources.
// Falls back to a generic search-style resource for skills not in the map,
// so every missing skill always returns something useful.

const RESOURCE_MAP = {
  javascript: [
    { title: "JavaScript.info", url: "https://javascript.info/" },
    { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
  ],
  python: [
    { title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/" },
    { title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/" },
  ],
  react: [
    { title: "React Official Docs", url: "https://react.dev/learn" },
  ],
  "node.js": [
    { title: "Node.js Official Docs", url: "https://nodejs.org/en/docs" },
  ],
  sql: [
    { title: "SQLBolt Interactive Lessons", url: "https://sqlbolt.com/" },
  ],
  mongodb: [
    { title: "MongoDB University", url: "https://learn.mongodb.com/" },
  ],
  "data structures": [
    { title: "GeeksforGeeks DSA", url: "https://www.geeksforgeeks.org/data-structures/" },
  ],
  java: [
    { title: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/" },
  ],
  "c++": [
    { title: "LearnCpp.com", url: "https://www.learncpp.com/" },
  ],
  git: [
    { title: "Git Official Docs", url: "https://git-scm.com/doc" },
  ],
};

/**
 * Returns curated learning resources for a list of skills.
 * Output shape: [{ skill, resources: [{title, url}, ...] }, ...]
 */
export function getResourcesForSkills(skills = []) {
  return skills.map((skill) => {
    const key = String(skill).trim().toLowerCase();
    const resources =
      RESOURCE_MAP[key] || [
        {
          title: `Search courses for "${skill}"`,
          url: `https://www.google.com/search?q=free+course+${encodeURIComponent(skill)}`,
        },
      ];
    return { skill, resources };
  });
}
