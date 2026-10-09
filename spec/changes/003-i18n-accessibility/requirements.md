# Slice 003: Complete Internationalization & Accessibility - Requirements

## Intent
Deliver complete tri-lingual support (`pt-BR` default, `en`, `es`) across all UI elements, mathematical explanations, validation messages, and game state feedback. Ensure rigorous accessibility (WCAG 2.1 AA compliant) including visible keyboard focus rings, semantic ARIA attributes, screen reader live regions, and strict zero-leakage of hidden hypotenuse values in accessible text.

## Scope
- Full i18n dictionaries for `pt-BR`, `en`, and `es`.
- Persistent language switcher dropdown/toggle in Header.
- Domain-appropriate football/math terminology in all 3 languages:
  - pt-BR: Cateto A, Cateto B, Distância do Passe (Hipotenusa C), Teorema de Pitágoras no Futebol.
  - en: Leg A, Leg B, Pass Distance (Hypotenuse C), Pythagorean Theorem in Football.
  - es: Cateto A, Cateto B, Distancia del Pase (Hipotenusa C), Teorema de Pitágoras en el Fútbol.
- Validation, error, and feedback messaging localized in all 3 languages.
- Strict anti-leak accessibility:
  - When Help is OFF (hidden), screen readers MUST NOT announce the target hypotenuse or cheat values.
  - Live region announces pass outcome ("Goal!", "Pass too short!", "Pass too long!").
  - Semantic canvas description (`role="img"` with localized `aria-label`).
  - High visible focus outlines (`focus-visible:ring-2 focus-visible:ring-amber-400`).
  - Touch targets $\ge 44\text{px}$ and color-independent status icons.

## Non-Goals in Slice 003
- PWA offline service worker and Web App Manifest (Slice 004).
- Make webhook scripts (Slice 005).

## Requirement Scenarios (Given/When/Then)

### REQ-003-I18N: Tri-Lingual Localization
- **Scenario 1 (Default pt-BR)**:
  - *Given* a new session
  - *Then* active language is `pt-BR`. Labels read "Lançamento de Pitágoras", "Distância do Passe (C)", "Lançar Bola!".
- **Scenario 2 (Switching to English)**:
  - *Given* the user selects `en`
  - *When* UI renders
  - *Then* labels read "Pythagoras Pass", "Pass Distance (C)", "Launch Ball!", "Try Again", "Next Phase".
- **Scenario 3 (Switching to Spanish)**:
  - *Given* the user selects `es`
  - *When* UI renders
  - *Then* labels read "Lanzamiento de Pitágoras", "Distancia del Pase (C)", "¡Lanzar Balón!", "Intentar de Nuevo".

### REQ-003-A11Y: Accessibility & Zero Answer Leakage
- **Scenario 1 (Hidden Help Mode Anti-Leak)**:
  - *Given* Help toggle is OFF
  - *When* inspecting DOM accessibility tree, `aria-label`, and live regions
  - *Then* neither the numeric target hypotenuse nor the calculated square root appears in any text or ARIA attribute.
- **Scenario 2 (Live Region Announcements)**:
  - *Given* ball trajectory finishes
  - *When* phase changes to `goal`, `miss_short`, or `miss_long`
  - *Then* an `aria-live="polite"` region announces the localized result without page reload.
- **Scenario 3 (Keyboard Operability & Focus)**:
  - *Given* keyboard navigation via `Tab`
  - *When* focusing buttons and inputs
  - *Then* all interactive controls display high-contrast visible focus rings.
