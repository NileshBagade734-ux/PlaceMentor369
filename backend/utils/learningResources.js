const RESOURCE_LIBRARY = {
  javascript: [
    {
      title: "MDN JavaScript Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      type: "Docs",
      description: "Core JavaScript reference and learning guide."
    },
    {
      title: "javascript.info",
      url: "https://javascript.info/",
      type: "Tutorial",
      description: "Deep, structured JavaScript learning path."
    }
  ],
  react: [
    {
      title: "React Docs",
      url: "https://react.dev/learn",
      type: "Docs",
      description: "Official React learning materials."
    },
    {
      title: "React Patterns",
      url: "https://reactpatterns.com/",
      type: "Reference",
      description: "Common React component patterns and practices."
    }
  ],
  nodejs: [
    {
      title: "Node.js Learn",
      url: "https://nodejs.org/en/learn",
      type: "Docs",
      description: "Official Node.js learning resources."
    }
  ],
  express: [
    {
      title: "Express Guide",
      url: "https://expressjs.com/en/guide/routing.html",
      type: "Docs",
      description: "Routing and middleware basics for Express."
    }
  ],
  mongodb: [
    {
      title: "MongoDB University",
      url: "https://learn.mongodb.com/",
      type: "Course",
      description: "Free MongoDB learning content."
    }
  ],
  mongoose: [
    {
      title: "Mongoose Docs",
      url: "https://mongoosejs.com/docs/guide.html",
      type: "Docs",
      description: "Schema design and model documentation."
    }
  ],
  python: [
    {
      title: "Python Tutorial",
      url: "https://docs.python.org/3/tutorial/",
      type: "Docs",
      description: "Official Python beginner tutorial."
    }
  ],
  java: [
    {
      title: "Java Tutorials",
      url: "https://docs.oracle.com/javase/tutorial/",
      type: "Docs",
      description: "Official Java learning path."
    }
  ],
  sql: [
    {
      title: "SQLBolt",
      url: "https://sqlbolt.com/",
      type: "Practice",
      description: "Hands-on SQL exercises and lessons."
    }
  ],
  html: [
    {
      title: "MDN HTML Guide",
      url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
      type: "Docs",
      description: "HTML fundamentals and best practices."
    }
  ],
  css: [
    {
      title: "MDN CSS Guide",
      url: "https://developer.mozilla.org/en-US/docs/Learn/CSS",
      type: "Docs",
      description: "CSS fundamentals and layout techniques."
    }
  ],
  tailwind: [
    {
      title: "Tailwind CSS Docs",
      url: "https://tailwindcss.com/docs",
      type: "Docs",
      description: "Utility-first CSS framework reference."
    }
  ]
};

function normalizeSkill(value) {
  return String(value || "").trim().toLowerCase();
}

function buildFallbackResources(skill) {
  const encoded = encodeURIComponent(skill);
  return [
    {
      title: `${skill} Roadmap`,
      url: `https://www.google.com/search?q=${encoded}+learning+roadmap`,
      type: "Search",
      description: `A quick way to find curated learning material for ${skill}.`
    }
  ];
}

export function getResourcesForSkills(skills) {
  return (skills || []).map((skill) => {
    const normalized = normalizeSkill(skill);
    const resources = RESOURCE_LIBRARY[normalized] || buildFallbackResources(skill);

    return {
      skill: skill,
      resources
    };
  });
}