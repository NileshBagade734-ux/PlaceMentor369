/**
 * Utility: learningResources.js
 * Returns curated free learning resources for a given list of skills.
 *
 * Resource structure per skill:
 * {
 *   skill: String,         // original skill name passed in
 *   resources: [
 *     { title, url, type, platform }
 *   ]
 * }
 *
 * type: "course" | "documentation" | "tutorial" | "practice"
 */

/**
 * Static resource map.
 * Key: normalized skill name (lowercase, trimmed).
 * Value: array of resource objects.
 *
 * Covers common placement-relevant skills.
 * Falls back to a generic search URL for unmapped skills.
 */
const RESOURCE_MAP = {
  // ── Web & Frontend ───────────────────────────────────────────────
  "html": [
    { title: "HTML Full Course – freeCodeCamp", url: "https://www.freecodecamp.org/learn/responsive-web-design/", type: "course", platform: "freeCodeCamp" },
    { title: "MDN HTML Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", type: "documentation", platform: "MDN" },
  ],
  "css": [
    { title: "CSS Full Course – freeCodeCamp", url: "https://www.freecodecamp.org/learn/responsive-web-design/", type: "course", platform: "freeCodeCamp" },
    { title: "MDN CSS Docs", url: "https://developer.mozilla.org/en-US/docs/Web/CSS", type: "documentation", platform: "MDN" },
    { title: "CSS Tricks", url: "https://css-tricks.com/", type: "tutorial", platform: "CSS-Tricks" },
  ],
  "javascript": [
    { title: "JavaScript Algorithms – freeCodeCamp", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", type: "course", platform: "freeCodeCamp" },
    { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", type: "documentation", platform: "MDN" },
    { title: "javascript.info", url: "https://javascript.info/", type: "tutorial", platform: "javascript.info" },
  ],
  "typescript": [
    { title: "TypeScript Official Docs", url: "https://www.typescriptlang.org/docs/", type: "documentation", platform: "TypeScript" },
    { title: "TypeScript for JS Programmers", url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", type: "tutorial", platform: "TypeScript" },
  ],
  "react": [
    { title: "React Official Docs", url: "https://react.dev/learn", type: "documentation", platform: "React" },
    { title: "React Course – freeCodeCamp (YouTube)", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", type: "course", platform: "YouTube" },
  ],
  "react.js": [
    { title: "React Official Docs", url: "https://react.dev/learn", type: "documentation", platform: "React" },
    { title: "React Course – freeCodeCamp (YouTube)", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", type: "course", platform: "YouTube" },
  ],
  "next.js": [
    { title: "Next.js Official Docs", url: "https://nextjs.org/docs", type: "documentation", platform: "Next.js" },
    { title: "Next.js Tutorial – Official", url: "https://nextjs.org/learn", type: "course", platform: "Next.js" },
  ],
  "vue": [
    { title: "Vue.js Official Docs", url: "https://vuejs.org/guide/introduction.html", type: "documentation", platform: "Vue.js" },
  ],
  "vue.js": [
    { title: "Vue.js Official Docs", url: "https://vuejs.org/guide/introduction.html", type: "documentation", platform: "Vue.js" },
  ],
  "tailwind": [
    { title: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs", type: "documentation", platform: "Tailwind CSS" },
  ],
  "tailwindcss": [
    { title: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs", type: "documentation", platform: "Tailwind CSS" },
  ],

  // ── Backend ───────────────────────────────────────────────────────
  "node.js": [
    { title: "Node.js Official Docs", url: "https://nodejs.org/en/docs", type: "documentation", platform: "Node.js" },
    { title: "Node.js Crash Course – Traversy Media", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", type: "tutorial", platform: "YouTube" },
  ],
  "nodejs": [
    { title: "Node.js Official Docs", url: "https://nodejs.org/en/docs", type: "documentation", platform: "Node.js" },
    { title: "Node.js Crash Course – Traversy Media", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", type: "tutorial", platform: "YouTube" },
  ],
  "express": [
    { title: "Express.js Official Docs", url: "https://expressjs.com/", type: "documentation", platform: "Express" },
  ],
  "express.js": [
    { title: "Express.js Official Docs", url: "https://expressjs.com/", type: "documentation", platform: "Express" },
  ],
  "django": [
    { title: "Django Official Docs", url: "https://docs.djangoproject.com/", type: "documentation", platform: "Django" },
    { title: "Django for Beginners – freeCodeCamp", url: "https://www.youtube.com/watch?v=F5mRW0jo-U4", type: "course", platform: "YouTube" },
  ],
  "flask": [
    { title: "Flask Official Docs", url: "https://flask.palletsprojects.com/", type: "documentation", platform: "Flask" },
  ],
  "spring boot": [
    { title: "Spring Boot Official Docs", url: "https://spring.io/projects/spring-boot", type: "documentation", platform: "Spring" },
    { title: "Spring Boot Tutorial – Amigoscode", url: "https://www.youtube.com/watch?v=9SGDpanrc8U", type: "course", platform: "YouTube" },
  ],

  // ── Databases ─────────────────────────────────────────────────────
  "mongodb": [
    { title: "MongoDB University (Free)", url: "https://university.mongodb.com/", type: "course", platform: "MongoDB" },
    { title: "MongoDB Docs", url: "https://www.mongodb.com/docs/", type: "documentation", platform: "MongoDB" },
  ],
  "mysql": [
    { title: "MySQL Tutorial – W3Schools", url: "https://www.w3schools.com/mysql/", type: "tutorial", platform: "W3Schools" },
    { title: "MySQL Official Docs", url: "https://dev.mysql.com/doc/", type: "documentation", platform: "MySQL" },
  ],
  "postgresql": [
    { title: "PostgreSQL Official Docs", url: "https://www.postgresql.org/docs/", type: "documentation", platform: "PostgreSQL" },
    { title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "tutorial", platform: "postgresqltutorial.com" },
  ],
  "sql": [
    { title: "SQL Course – freeCodeCamp", url: "https://www.freecodecamp.org/learn/relational-database/", type: "course", platform: "freeCodeCamp" },
    { title: "SQLZoo – Interactive SQL Practice", url: "https://sqlzoo.net/", type: "practice", platform: "SQLZoo" },
  ],
  "redis": [
    { title: "Redis Official Docs", url: "https://redis.io/docs/", type: "documentation", platform: "Redis" },
    { title: "Redis University (Free)", url: "https://university.redis.com/", type: "course", platform: "Redis" },
  ],

  // ── Programming Languages ─────────────────────────────────────────
  "python": [
    { title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "documentation", platform: "Python" },
    { title: "Python for Everybody – Coursera (Audit Free)", url: "https://www.coursera.org/specializations/python", type: "course", platform: "Coursera" },
    { title: "Automate the Boring Stuff with Python", url: "https://automatetheboringstuff.com/", type: "tutorial", platform: "automatetheboringstuff.com" },
  ],
  "java": [
    { title: "Java Programming – MOOC.fi (Free)", url: "https://java-programming.mooc.fi/", type: "course", platform: "MOOC.fi" },
    { title: "Java Docs – Oracle", url: "https://docs.oracle.com/en/java/", type: "documentation", platform: "Oracle" },
  ],
  "c++": [
    { title: "C++ Tutorial – LearnCpp", url: "https://www.learncpp.com/", type: "tutorial", platform: "learncpp.com" },
    { title: "C++ Reference", url: "https://en.cppreference.com/w/", type: "documentation", platform: "cppreference" },
  ],
  "c": [
    { title: "C Programming – freeCodeCamp", url: "https://www.youtube.com/watch?v=KJgsSFOSQv0", type: "course", platform: "YouTube" },
    { title: "C Reference", url: "https://en.cppreference.com/w/c", type: "documentation", platform: "cppreference" },
  ],
  "kotlin": [
    { title: "Kotlin Official Docs", url: "https://kotlinlang.org/docs/home.html", type: "documentation", platform: "Kotlin" },
    { title: "Kotlin Bootcamp – Google/Udacity (Free)", url: "https://developer.android.com/courses/kotlin-bootcamp/overview", type: "course", platform: "Google" },
  ],
  "go": [
    { title: "Go Official Tour", url: "https://go.dev/tour/", type: "tutorial", platform: "Go" },
    { title: "Go by Example", url: "https://gobyexample.com/", type: "tutorial", platform: "gobyexample.com" },
  ],
  "golang": [
    { title: "Go Official Tour", url: "https://go.dev/tour/", type: "tutorial", platform: "Go" },
    { title: "Go by Example", url: "https://gobyexample.com/", type: "tutorial", platform: "gobyexample.com" },
  ],
  "rust": [
    { title: "The Rust Book (Official)", url: "https://doc.rust-lang.org/book/", type: "documentation", platform: "Rust" },
    { title: "Rustlings – Interactive Exercises", url: "https://github.com/rust-lang/rustlings", type: "practice", platform: "GitHub" },
  ],

  // ── Mobile ────────────────────────────────────────────────────────
  "android": [
    { title: "Android Developer Guides – Google", url: "https://developer.android.com/guide", type: "documentation", platform: "Google" },
    { title: "Android Basics with Compose – Google", url: "https://developer.android.com/courses/android-basics-compose/course", type: "course", platform: "Google" },
  ],
  "jetpack compose": [
    { title: "Jetpack Compose Docs – Google", url: "https://developer.android.com/jetpack/compose/documentation", type: "documentation", platform: "Google" },
    { title: "Compose Pathway – Google", url: "https://developer.android.com/courses/pathways/compose", type: "course", platform: "Google" },
  ],
  "react native": [
    { title: "React Native Official Docs", url: "https://reactnative.dev/docs/getting-started", type: "documentation", platform: "React Native" },
  ],
  "flutter": [
    { title: "Flutter Official Docs", url: "https://docs.flutter.dev/", type: "documentation", platform: "Flutter" },
    { title: "Flutter Codelabs", url: "https://docs.flutter.dev/codelabs", type: "course", platform: "Flutter" },
  ],

  // ── DevOps / Cloud ────────────────────────────────────────────────
  "git": [
    { title: "Git Official Docs", url: "https://git-scm.com/doc", type: "documentation", platform: "Git" },
    { title: "Learn Git Branching (Interactive)", url: "https://learngitbranching.js.org/", type: "practice", platform: "learngitbranching.js.org" },
  ],
  "docker": [
    { title: "Docker Official Docs", url: "https://docs.docker.com/", type: "documentation", platform: "Docker" },
    { title: "Docker Tutorial – TechWorld with Nana", url: "https://www.youtube.com/watch?v=3c-iBn73dDE", type: "course", platform: "YouTube" },
  ],
  "kubernetes": [
    { title: "Kubernetes Official Docs", url: "https://kubernetes.io/docs/home/", type: "documentation", platform: "Kubernetes" },
    { title: "Kubernetes Tutorial – TechWorld with Nana", url: "https://www.youtube.com/watch?v=X48VuDVv0do", type: "course", platform: "YouTube" },
  ],
  "aws": [
    { title: "AWS Free Tier", url: "https://aws.amazon.com/free/", type: "practice", platform: "AWS" },
    { title: "AWS Skill Builder (Free Courses)", url: "https://skillbuilder.aws/", type: "course", platform: "AWS" },
  ],
  "gcp": [
    { title: "Google Cloud Skills Boost", url: "https://www.cloudskillsboost.google/", type: "course", platform: "Google Cloud" },
  ],
  "azure": [
    { title: "Microsoft Learn – Azure", url: "https://learn.microsoft.com/en-us/azure/", type: "course", platform: "Microsoft Learn" },
  ],
  "linux": [
    { title: "Linux Command Line – freeCodeCamp", url: "https://www.youtube.com/watch?v=ZtqBQ68cfJc", type: "course", platform: "YouTube" },
    { title: "The Linux Command Line (Free Book)", url: "https://linuxcommand.org/tlcl.php", type: "tutorial", platform: "linuxcommand.org" },
  ],

  // ── ML / AI / Data ────────────────────────────────────────────────
  "machine learning": [
    { title: "Machine Learning Specialization – Andrew Ng (Coursera, Audit Free)", url: "https://www.coursera.org/specializations/machine-learning-introduction", type: "course", platform: "Coursera" },
    { title: "fast.ai – Practical Deep Learning", url: "https://www.fast.ai/", type: "course", platform: "fast.ai" },
  ],
  "deep learning": [
    { title: "Deep Learning Specialization – Coursera (Audit Free)", url: "https://www.coursera.org/specializations/deep-learning", type: "course", platform: "Coursera" },
    { title: "fast.ai – Practical Deep Learning", url: "https://www.fast.ai/", type: "course", platform: "fast.ai" },
  ],
  "tensorflow": [
    { title: "TensorFlow Official Tutorials", url: "https://www.tensorflow.org/tutorials", type: "tutorial", platform: "TensorFlow" },
  ],
  "pytorch": [
    { title: "PyTorch Official Tutorials", url: "https://pytorch.org/tutorials/", type: "tutorial", platform: "PyTorch" },
  ],
  "data structures": [
    { title: "DSA – freeCodeCamp", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", type: "course", platform: "freeCodeCamp" },
    { title: "Visualgo – Algorithm Visualization", url: "https://visualgo.net/en", type: "practice", platform: "Visualgo" },
  ],
  "algorithms": [
    { title: "Algorithms – Princeton (Coursera, Audit Free)", url: "https://www.coursera.org/learn/algorithms-part1", type: "course", platform: "Coursera" },
    { title: "LeetCode – Practice Problems", url: "https://leetcode.com/", type: "practice", platform: "LeetCode" },
  ],
};

/**
 * getResourcesForSkills(skills)
 *
 * Returns curated learning resources for each skill in the array.
 * Skills not found in the map get a fallback Google search link.
 *
 * @param {string[]} skills - Array of skill name strings
 * @returns {Array<{ skill: string, resources: Array }>}
 */
export const getResourcesForSkills = (skills) => {
  if (!skills || skills.length === 0) return [];

  return skills.map((skill) => {
    const key = skill.trim().toLowerCase();
    const resources = RESOURCE_MAP[key] || [
      {
        title: `Search learning resources for "${skill}"`,
        url: `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}+free+course+tutorial`,
        type: "tutorial",
        platform: "Google Search",
      },
    ];

    return {
      skill,
      resources,
    };
  });
};