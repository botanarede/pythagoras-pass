# Slice 001: Playable Foundation - Requirements

## Intent
Deliver a complete, robust, playable foundation of *Lançamento de Pitágoras* demonstrating the core mathematical model, uniform-scale 2D pitch rendering, precision hundredths input, Show/Hide formula toggle, animated pass trajectory with miss or receive-and-goal, retry, and comprehensive unit tests.

## Scope
- Mathematical model: $(A, B)$ generation with Easy/Hard bounds, reference hypotenuse, integer-hundredths conversion, parsing of `.` and `,`.
- Single active round object shared across canvas, labels, explanation, and controls.
- Uniform-aspect 2D field renderer (Bahia daytime theme) with right-angle triangle, passer $P$, attacker $Q$, and goal.
- Precision input: numeric field with integer hundredths state, $\pm0.01$ and $\pm0.10$ increment/decrement controls, validation error handling.
- Show/Hide formula toggle (default OFF). When ON: shows $A^2 + B^2 = C^2$, reference $C$ with approximation note, preview diagonal, and "Usar valor calculado".
- Launch mechanics: ball moves from $P$ to calculated endpoint $P + C \cdot \vec{u}$. If accurate within round-to-hundredths: receives and strikes goal. If short: ball stops short. If long: ball overshoots.
- Retry: retains current $(A, B)$ and position for another attempt.
- New Round: generates a new pair.

## Non-Goals in Slice 001
- Flamengo and Cruzeiro themes (Slice 002).
- Language switcher (en/es in Slice 003; default pt-BR here).
- Service worker / PWA offline manifest (Slice 004).

## Requirement Scenarios (Given/When/Then)

### REQ-001-MATH: Hypotenuse Reference and Verification
- **Scenario 1 (Exact Pythagorean Triple)**:
  - *Given* $A = 3$ and $B = 4$
  - *When* reference hypotenuse is computed
  - *Then* reference value is exactly $5.00$ and target hundredths is $500$.
- **Scenario 2 (Irrational Hypotenuse)**:
  - *Given* $A = 2$ and $B = 3$
  - *When* reference hypotenuse is computed
  - *Then* reference value is $\approx 3.60555...$, target hundredths is $361$, formatted as "≈ 3.61".
- **Scenario 3 (Hard Mode Dimensions)**:
  - *Given* $A = 20$ and $B = 21$
  - *When* reference hypotenuse is computed
  - *Then* reference value is $29.00$, target hundredths is $2900$.

### REQ-001-INPUT: Hundredths Entry and Parsing
- **Scenario 1 (Locale Parsing)**:
  - *Given* an empty input
  - *When* the player enters "3.61" or "3,61"
  - *Then* the parsed hundredths value is $361$.
- **Scenario 2 (Step Buttons)**:
  - *Given* input is $500$ (5.00)
  - *When* player clicks `+ 0.01`
  - *Then* input becomes $501$ (5.01).
- **Scenario 3 (Validation Messages)**:
  - *Given* an input of "-2" or "abc" or ""
  - *When* validation runs
  - *Then* launch button is disabled and a clear Portuguese validation hint is displayed.

### REQ-001-GEO: Uniform Scaling
- **Scenario 1 (Aspect Ratio & Proportions)**:
  - *Given* a canvas of width $W$ and height $H$
  - *When* rendering player $P$ and $Q$ separated by $A$ and $B$
  - *Then* horizontal pixel distance is $S \times A$ and vertical pixel distance is $S \times B$ with identical scale factor $S$.
  - *And* player sprites, ball, and goal circles maintain 1:1 circular/proportional aspect ratios without distortion.

### REQ-001-LAUNCH: Trajectory & Outcome
- **Scenario 1 (Correct Pass)**:
  - *Given* target hundredths is $500$ and player enters $500$
  - *When* player clicks "Lançar Bola"
  - *Then* the ball travels to $Q$, attacker triggers a kick into the goal, and goal celebration feedback is shown.
- **Scenario 2 (Short Pass)**:
  - *Given* target hundredths is $500$ and player enters $400$
  - *When* player launches
  - *Then* the ball stops short of $Q$, attacker shows missed reception, and feedback indicates "Passe curto!".
- **Scenario 3 (Long Pass)**:
  - *Given* target hundredths is $500$ and player enters $650$
  - *When* player launches
  - *Then* the ball travels past $Q$, and feedback indicates "Passe longo!".
