# Resume V2 Tabbed Portfolio Design

**Date:** 2026-09-25
**Repository:** `github.com/WeeJubya/Resume`
**GitHub Pages URL:** `https://weejubya.github.io/Resume/`
**Status:** Approved design, awaiting implementation-plan approval

## 1. Goal

Create Version 2 of Glynn Williams' portfolio site by replacing the long single-page scrolling experience with a tabbed application-style interface, while preserving the established visual language and adding a fully interactive Renewable Energy learning-module showcase inside the Portfolio tab.

V2 must continue to work as a static GitHub Pages site with no server-side runtime and no external build dependency required for deployment.

## 2. Design Intent

The site should feel like a restrained futuristic information console rather than a conventional CV website. The existing visual identity remains the baseline:

- Light theme centred on command burgundy.
- Dark theme centred on science blue.
- Gold used sparingly for emphasis.
- Rounded control geometry inspired by late-future LCARS visual ideas without copying Star Trek branding or recognizable interface layouts.
- Strong typography, generous information hierarchy, subtle panel transitions and clear control surfaces.

Version 2 changes the interaction model, not the core identity.

## 3. Main Application Structure

The root site remains a single static application served from `index.html`.

### Primary tabs

The top-level navigation is:

1. Home
2. About
3. Experience
4. Portfolio
5. Skills
6. Testimonials
7. Contact

Only one primary tab panel is visually active at a time.

### URL behaviour

Each primary tab must be deep-linkable using the URL hash:

- `#home`
- `#about`
- `#experience`
- `#portfolio`
- `#skills`
- `#testimonials`
- `#contact`

Requirements:

- Opening the site without a hash defaults to Home.
- Opening the site with a valid hash activates that tab.
- Invalid hashes fall back to Home without throwing an error.
- Browser Back and Forward must navigate between tab states.
- Activating a tab updates the URL without reloading the page.

### Desktop navigation

Desktop uses a prominent control-surface tab strip integrated into the main header.

### Mobile navigation

Mobile uses a horizontally scrollable touch-friendly tab strip rather than a hamburger menu. The active tab must remain visually obvious and should be scrolled into view where practical.

### Keyboard interaction

The primary navigation follows accessible tab semantics:

- `role="tablist"` for the tab container.
- `role="tab"` for controls.
- `role="tabpanel"` for content panels.
- Left/Right arrows move focus among tabs.
- Home/End jump to first/last tab.
- Enter or Space activates the focused tab.
- Only the active tab has `aria-selected="true"` and `tabindex="0"`.

## 4. Content Mapping

Existing V1 content is redistributed into the tabs without losing substantive content.

### Home

- Glynn Williams hero identity.
- eLearning / instructional design positioning.
- Short professional summary.
- Primary calls to Portfolio and Contact.
- Existing portrait imagery.

### About

- Longer professional profile.
- Secure-government / regulated-environment context.
- Design approach and working principles.
- Public-safe statement explaining that some work cannot be shared because of security obligations.

### Experience

- Existing experience timeline and role summaries.
- MI5, GCHQ and WWT experience content already present in V1.
- Existing education / professional information where appropriate.

### Portfolio

Becomes a dedicated project hub rather than a vertically stacked section.

Primary project cards:

- Analyst Developer Programme (ADP)
- Renewable Energy interactive sample

### Skills

- Existing authoring tools, learning standards, LMS platforms, creative tools and delivery skills.
- Retain dashboard-style visual treatment.

### Testimonials

- Existing public-safe testimonials from the supplied portfolio.

### Contact

- Public email.
- LinkedIn.
- Gloucestershire location reference.
- No phone number, referee names, referee contact information or restricted material.

## 5. Portfolio Hub

The Portfolio tab is an application workspace with a project selector and a project-detail region.

### ADP project

The Analyst Developer Programme remains a structured case study and must retain:

- Project purpose.
- Audience.
- Tools used.
- Planning and scoping.
- Design and prototyping.
- Full development.
- Review / QA / deployment.
- Impact.
- Reflection.

The project can use tabs, stepped panels or grouped sections within the Portfolio view, but it must not launch a second full-screen application.

### Renewable Energy project

The Renewable Energy card must include a prominent **Launch Interactive Case Study** control.

Selecting it transitions from the Portfolio workspace into a near-full-screen learning-module experience.

## 6. Renewable Energy Full-Screen Module

### Entry and exit

When launched:

- The normal portfolio workspace visually recedes.
- A dedicated module stage fills most or all of the viewport.
- The site theme remains consistent with the selected light/dark mode.
- A persistent **Exit to Portfolio** control is available.
- Exiting returns the user to the Portfolio tab and restores focus to the launch control.

The module is session-only. Refreshing the page or leaving the site resets module progress.

### Module sequence

1. Welcome / Learning Objectives
2. Types of Renewable Energy
3. Positive Impact on the World Climate
4. Renewable Energy in the UK
5. Knowledge Check
6. Results / Completion

### Module navigation

The module provides:

- Back
- Next
- Exit to Portfolio
- Progress indication
- Current section label

Desktop uses a console-style navigation strip. Mobile uses a fixed or sticky bottom navigation strip that preserves maximum content space.

Back is disabled on the first screen. Next must not advance from any screen that has a required completion condition until that condition is met.

## 7. Source Content Rules

The supplied eLearning Portfolio storyboard is the source of truth for the Renewable Energy instructional content.

Do not silently replace, modernise, fact-check or expand the authored storyboard text with outside material. The site is showcasing the authored sample as supplied.

The source provides:

- Introductory text and learning objectives.
- Descriptions of Solar, Wind, Hydropower, Biomass and Geothermal energy.
- Positive world-climate impacts.
- The storyboard's factoid and carbon-emitter statements.
- UK renewable-energy content.
- Avonmouth Wind Farm case-study content.
- The proposed structure for a knowledge check.

The source specifies a bank of ten questions but does not provide those ten questions. V2 therefore authors a question bank of ten using only facts taught in the supplied module content.

## 8. Screen 1: Welcome / Learning Objectives

Content must reproduce the supplied storyboard meaning:

- Introduce renewable energy.
- Explain that the learner will explore major renewable types and climate benefits globally and in the UK.
- Present the three supplied learning objectives.

The screen may use restrained animated entrance effects unless reduced motion is enabled.

## 9. Screen 2: Types of Renewable Energy

Five interactive controls:

- Solar Energy
- Wind Energy
- Hydropower
- Biomass Energy
- Geothermal Energy

Selecting a control reveals the full supplied explanation for that energy type.

Completion rule:

- All five energy types must be opened before the screen is marked complete and Next becomes available.

Interaction requirements:

- Active type is visually highlighted.
- Previously viewed types are distinguishable from unvisited types.
- Keyboard activation works with Enter and Space.
- Mobile uses vertically stacked touch-friendly controls/cards.
- No content is hover-only.

## 10. Screen 3: Positive Impact on the World Climate

Present the supplied climate-benefit statements as progressive-reveal panels or cards.

The supplied factoid block must remain visually distinct.

Completion rule:

- All reveal panels must be opened/viewed before Next becomes available.

The interaction must remain fully usable without animation when `prefers-reduced-motion: reduce` is active.

## 11. Screen 4: Renewable Energy in the UK

Present the supplied UK renewable-energy content and the Avonmouth case-study entry point.

### Avonmouth Wind Farm modal

A **View Case Study** control opens an accessible modal containing the full supplied Avonmouth Wind Farm case-study text.

Modal requirements:

- `role="dialog"` and `aria-modal="true"`.
- Programmatic title association.
- Focus moves into the modal when opened.
- Focus is trapped while the modal is open.
- Escape closes the modal.
- Explicit Close control closes the modal.
- Clicking the backdrop may close the modal.
- Closing returns focus to the View Case Study control.
- Page content behind the modal must not be keyboard-interactive while the modal is active.

Completion rule:

- Opening the Avonmouth case study at least once marks the required interaction complete.

## 12. Screen 5: Knowledge Check

### Question bank

Create ten original questions derived strictly from facts contained in the supplied Renewable Energy module.

Allowed types:

- Multiple choice.
- True / False.

A run selects five questions from the bank.

Requirements:

- Questions must not require information absent from the supplied storyboard.
- Correct answers must be unambiguous based on the module text.
- Question order may vary per run.
- The selected answer for each question is retained until submission or retry.

### Matching interaction

Include the storyboard's proposed matching activity pairing renewable-energy types with their descriptions.

Desktop:

- Support drag-and-drop.

Keyboard and touch:

- Provide an equivalent select-and-place mechanism.
- The activity must be fully completable without pointer dragging.

### Scoring

The pass mark is **80%**.

The score combines the five selected knowledge questions and the matching interaction using a clearly defined deterministic scoring model documented in code comments and tests.

The implementation must show the learner what counts toward the score.

## 13. Screen 6: Results / Completion

### Pass result

At 80% or above:

- Show Pass state.
- Show the supplied completion message:
  "Great work! You now have a clear understanding of the types of renewable energy, and how they benefit both our planet, and the UK."
- Offer Review Answers.
- Offer Exit to Portfolio.
- Offer Restart Module.

### Fail result

Below 80%:

- Show Fail state without punitive language.
- Display achieved percentage.
- Offer Review Answers.
- Offer Try Again.
- Offer Exit to Portfolio.

### Review Answers

Review mode shows:

- Each asked question.
- Learner response.
- Correct answer.
- Correct / incorrect state.
- Matching results.

Retry starts a fresh five-question selection from the ten-question bank and resets the matching exercise.

## 14. State Model

Primary application state:

- Active main tab.
- Current theme.

Renewable module session state:

- Current module screen.
- Viewed renewable-energy types.
- Viewed climate-impact panels.
- Whether Avonmouth case study has been opened.
- Selected five questions.
- Answers.
- Matching choices.
- Score.
- Pass/fail state.

Theme preference remains persisted using the same local-storage mechanism as V1.

Learning-module state is intentionally not persisted across refreshes.

## 15. No-JavaScript Behaviour

The résumé and portfolio content must remain readable when JavaScript is unavailable.

Primary tab panels may be presented sequentially in the no-JavaScript fallback so content is not hidden permanently.

The interactive Renewable Energy project must display a clear message explaining that JavaScript is required to launch the interactive learning demonstration.

No essential CV content may depend solely on JavaScript.

## 16. Motion and Transition Design

Primary tab changes use short, restrained transitions resembling a console redraw rather than large sliding-page animation.

Launching the Renewable Energy module may use a slightly stronger transition to establish the change of context.

All non-essential transitions must be removed or made effectively instantaneous when reduced-motion preference is enabled.

No animation may prevent interaction or delay keyboard focus.

## 17. Responsive Requirements

### Desktop

- Full tab strip.
- Multi-column project hub.
- Broad control surfaces in the learning module.
- Renewable-type controls may use a horizontal or grid arrangement.

### Tablet

- Tabs remain visible and may scroll if necessary.
- Portfolio hub adapts to available width.
- Module content remains centred and readable.

### Mobile

- Horizontally scrollable top-level tab strip.
- Minimum 44px practical touch targets.
- Portfolio project cards stack vertically.
- Learning module occupies nearly the full viewport.
- Module Back / progress / Next controls remain reachable without excessive scrolling.
- Renewable-energy controls stack vertically.
- Matching exercise offers select-and-place controls as the primary reliable interaction.
- Modal fits within viewport and scrolls internally when needed.

## 18. Theme Requirements

Preserve the existing themes and user preference behaviour.

### Light

- Command burgundy remains the dominant accent.
- Warm neutral surfaces.
- Harmonious secondary highlight colours.
- Gold only for selective emphasis.

### Dark

- Science blue remains the dominant accent.
- Deep navy / charcoal surfaces.
- Gold remains restrained.

Both themes must maintain accessible colour contrast for body copy, controls, focus states and status messaging.

## 19. Accessibility Requirements

Target WCAG 2.2 AA behaviours where practical for a static portfolio demonstration.

Requirements include:

- Semantic headings.
- Keyboard-operable primary tabs.
- Visible focus indicators.
- Proper tab roles and relationships.
- Accessible dialog behaviour.
- Touch and keyboard equivalent for drag-and-drop.
- No colour-only indication of correctness or active state.
- `aria-live` or equivalent announcement for quiz result changes where useful.
- Reduced-motion support.
- Logical focus restoration after closing module or modal.
- Meaningful image alt text; decorative UI graphics use empty alt text or CSS backgrounds.

## 20. Metadata and Site-Wide Requirements

Every HTML document must retain:

```html
<meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett" />
```

Retain existing public metadata, favicon behaviour, robots configuration, sitemap and `.nojekyll` unless an implementation requirement specifically demands an update.

All asset paths must remain compatible with the GitHub Pages project path `/Resume/`.

Use relative URLs for local assets wherever possible.

## 21. Privacy and Public-Safe Content

The public repository and rendered site must not contain:

- Private mobile number.
- Referee names.
- Referee email addresses.
- Referee telephone numbers.
- Restricted or classified work samples.
- Any source document copied wholesale into the repository.

Public contact information remains limited to approved public-safe channels such as email, LinkedIn and broad location.

## 22. V1 Preservation and Versioning

Before V2 replaces the root site, the current published V1 must be preserved in Git history and tagged:

`v1.0`

V2 becomes the root GitHub Pages experience after merge/deployment.

No duplicate `/v1/` copy is required in the deployed site unless explicitly requested later.

Recommended V2 release tag after acceptance:

`v2.0`

## 23. File Architecture

Implementation should preserve a dependency-free static structure and split responsibilities more clearly than V1.

Proposed files:

```text
index.html
404.html
assets/
  css/
    styles.css
    module.css
  js/
    app.js
    tabs.js
    renewable-module.js
    quiz.js
  img/
    ...existing optimised public-safe images...
tests/
  ...static / DOM behaviour tests...
docs/
  superpowers/
    specs/
      2026-09-25-resume-v2-tabbed-portfolio-design.md
    plans/
      ...implementation plan...
.nojekyll
robots.txt
sitemap.xml
README.md
```

The exact implementation may combine very small JavaScript files if doing so improves clarity, but the main-tab controller, learning-module controller and quiz/scoring logic must remain independently understandable and testable.

## 24. Error and Edge-Case Behaviour

The implementation must safely handle:

- Unknown URL hash.
- Rapid repeated tab selection.
- Browser Back/Forward while a different tab is active.
- Launching and exiting the module multiple times in one session.
- Reopening and closing the Avonmouth modal repeatedly.
- Quiz submission with unanswered questions.
- Incomplete matching exercise.
- Retry after pass or fail.
- Mobile viewport rotation / resize.
- Local storage unavailable or throwing an exception.

Failures must degrade gracefully rather than leaving hidden content or an unusable interface.

## 25. Testing Requirements

Implementation is test-driven.

Minimum automated coverage must include:

### Main tabs

- Correct default tab.
- Hash deep-link activation.
- Invalid hash fallback.
- Hash updates on activation.
- Browser history behaviour where test environment permits.
- Keyboard tab navigation.
- ARIA state updates.

### Renewable module

- Launch and exit behaviour.
- Focus return after exit.
- Module screen progression.
- Completion gates for the five renewable types.
- Completion gates for climate-impact reveals.
- Avonmouth modal open / close / Escape / focus return.

### Quiz

- Ten-question bank exists.
- Run selects exactly five questions.
- Questions draw only from defined module facts.
- Scoring is deterministic.
- 80% passes.
- Below 80% fails.
- Unanswered submission is handled.
- Retry resets state and produces a valid fresh run.
- Review answers accurately reflects learner choices.

### Matching

- Pointer-independent completion path works.
- Correct match scoring.
- Incorrect match scoring.
- Reset on retry.

### Site regression

- GNU Terry Pratchett meta tag exists on every HTML page.
- Privacy scan detects none of the excluded source details.
- Relative asset paths are GitHub Pages-safe.
- Themes remain functional.
- Reduced-motion CSS remains present.
- No-JavaScript fallback exposes core résumé content.

## 26. Acceptance Criteria

V2 is ready for user review when all of the following are true:

1. The long-page navigation is replaced by the approved tabbed interface.
2. All seven main tabs work on desktop, keyboard and mobile.
3. Hash deep links and browser history work.
4. Existing V1 visual identity is preserved and refined rather than replaced.
5. Portfolio contains ADP and Renewable Energy projects.
6. Renewable Energy launches into a near-full-screen module.
7. All supplied Renewable Energy storyboard content is represented.
8. Five renewable-type controls work and expose their supplied descriptions.
9. Climate-impact interactions work.
10. Avonmouth Wind Farm opens as a working accessible modal containing the full supplied case-study content.
11. Ten source-grounded knowledge-check questions exist and five are selected per attempt.
12. Matching interaction works with mouse, touch-equivalent controls and keyboard.
13. Pass mark is exactly 80%.
14. Pass, fail, review and retry flows work.
15. Mobile experience is fully usable.
16. Light/dark theme behaviour remains correct.
17. Privacy checks pass.
18. GNU Terry Pratchett meta tag remains on every HTML page.
19. Automated test suite passes with no known failures.
20. README contains Developer PowerShell deployment/update commands using `C:\Dev\Resume`.
21. Existing V1 commit is preserved and instructions include tagging it as `v1.0` before V2 publication.

## 27. Non-Goals

V2 will not:

- Add a backend or database.
- Add user accounts.
- Persist learner results across sessions.
- Send quiz results anywhere.
- Claim LMS/SCORM functionality.
- Replace the supplied instructional content with newly researched climate content.
- Add analytics unless requested separately.
- Recreate Star Trek branding, logos or an exact LCARS interface.

## 28. Implementation Principle

V2 should demonstrate the same thing the portfolio describes: information that is technically sound, structured around the learner/user, accessible, visually coherent and purposeful.

The site itself therefore becomes part of the portfolio evidence, not merely a container for it.
