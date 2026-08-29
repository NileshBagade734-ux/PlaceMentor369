name: 🐛 Bug Report
description: Report a bug to help us improve PlaceMentor369
title: "bug: "
labels: ["bug"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Please fill out this template with as much detail as possible to help us reproduce and fix the bug.
  - type: textarea
    id: problem-description
    attributes:
      label: 📝 Describe the Bug
      description: A clear and concise description of what the bug is.
      placeholder: E.g., The login page returns a 500 error when submitting the form with...
    validations:
      required: true
  - type: textarea
    id: reproduction-steps
    attributes:
      label: 🚶 Steps to Reproduce
      description: Explain how we can reproduce the behavior.
      placeholder: |
        1. Go to '/login.html'
        2. Click on 'Login' with empty inputs
        3. See error
    validations:
      required: true
  - type: textarea
    id: expected-behavior
    attributes:
      label: 🎯 Expected Behavior
      description: What did you expect to happen?
      placeholder: E.g., Visual validation error should appear below the email input field.
    validations:
      required: true
  - type: textarea
    id: screenshots
    attributes:
      label: 📸 Screenshots / Logs
      description: Drag/drop screenshots or paste logs showing the issue.
  - type: dropdown
    id: environment
    attributes:
      label: 💻 Environment / OS
      options:
        - Windows
        - macOS
        - Linux
        - Other
    validations:
      required: true
