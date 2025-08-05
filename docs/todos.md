# Nebby Neighbor - Development Priority Queue

## Issue Format

**Short summary** - 1-2 sentence, imperative form

**Guiding priorities** - required project context; short explanation about what aspects have already been in play and will likely guide subsequent choices

**Acceptance criteria** - bullet-point set of todos. Highlight items as "interactive-pre" (architectural) or "interactive-post" (design choices). For design elements, we will likely want to make multiple versions; for infrastructural aspects, will want to check in so Will can carefully plan the big picture

**Test steps** - comprehensive list (usually one per acceptance criterion), note that you will use the Playwright mcp for visual aspects such as clicking and image/pdf generation. Use lookahead to incorporate elements from future issues when they provide clear efficiency gains.

## Priority Queue

- [ ] **Implement Canvas accessibility with DOM fallback and keyboard navigation** (#14)
- [ ] **Add Playwright test suite with custom matchers** (#17)
- [ ] **Display level selection interface** (#11)
- [ ] **Create one-time conversion tool from extremely compressed representation to puzzle data** (#12)
- [ ] **Fix bugs in early warning system (unlisted, see git commits from #13)** (#13)
- [ ] **Visualize new constraints and successes in inspect mode** (#15) - might not be necessary given other UI improvements