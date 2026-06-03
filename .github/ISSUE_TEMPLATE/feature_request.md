name: ✨ Feature Request
description: Suggest a new idea or enhancement for PlaceMentor369
title: "feat: "
labels: ["enhancement"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Suggesting enhancements helps make PlaceMentor369 better for everyone!
  - type: textarea
    id: feature-description
    attributes:
      label: 💡 Proposed Feature / Enhancement
      description: A clear and concise description of what you want to add or improve.
      placeholder: E.g., Add a search bar to search jobs by branch or eligibility CGPA...
    validations:
      required: true
  - type: textarea
    id: problem-solved
    attributes:
      label: ❓ Problem It Solves
      description: Explain the problem or use case this feature targets.
      placeholder: Students currently have to scroll through all jobs manually.
    validations:
      required: true
  - type: textarea
    id: implementation-details
    attributes:
      label: 🛠️ Suggested Implementation
      description: Outline how you think this can be built (files, styles, backend APIs, etc.).
  - type: textarea
    id: alternatives
    attributes:
      label: 🔄 Alternatives Considered
      description: Any alternative solutions or features you've considered.
