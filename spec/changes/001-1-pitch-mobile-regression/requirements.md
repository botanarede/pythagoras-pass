# Slice 001.1: Penalty Arc and Mobile Layout Regression Fix - Requirements

## Problem Statement & Context
1. **Misplaced Penalty Arc (Meia-Lua)**:
   - *Actual Behavior*: The penalty arc in `PitchCanvas.tsx` was drawn using arbitrary fixed angles (`0.2 * Math.PI` to `0.8 * Math.PI`) that projected into the penalty box rather than strictly outside the penalty area towards midfield.
   - *Expected Behavior*: In regulation-proportional pitch geometry, the penalty arc is centered strictly at the penalty spot ($X_{\text{spot}}, Y_{\text{spot}}$), with radius $R = 9.15$ units. The arc consists **only** of the circle segment **outside** the penalty box front line ($Y > Y_{\text{front}}$), projecting towards midfield. Its start and end angles $\theta_{\text{start}}$ and $\theta_{\text{end}}$ are derived analytically from the intersection with the penalty area front line: $\sin(\alpha) = (Y_{\text{front}} - Y_{\text{spot}}) / R$.
2. **Mobile Composition & Layout Squeezing**:
   - *Actual Behavior*: On small mobile screens (e.g. 320x568, 390x844), or when the help panel opens, or when keyboard/inputs focus, the pitch canvas was in a flex-1 container that could shrink or cause layout collision. Controls and help competed for space.
   - *Expected Behavior*: Header, Scene, Controls, and optional Help reside in clearly defined layout regions. The Scene has a dedicated minimum usable height ($H_{\min} = 340\text{px}$) and maintains a uniform 1:1 scale ratio. If vertical viewport height is constrained, intentional document scrolling is enabled rather than shrinking the pitch canvas or clipping controls. Desktop centers the composition cleanly.
3. **Verification Rigor & CI State**:
   - Previous Slice 001 report used module-not-found as RED evidence instead of behavioral assertions and did not configure initial CI workflow or explicit browser check status. This change rectifies this with behavioral RED tests and a real CI workflow file `.github/workflows/verify.yml`.

## Unchanged Invariants & Contracts
- All core gameplay: player enters $C$ in hundredths, $\pm 0.01$ and $\pm 0.10$ adjustments, launch trajectory, reception and goal, short/long pass feedback, retry/advance, Easy/Hard generation.
- Zero anisotropic stretching: horizontal and vertical scales remain strictly identical ($S_x = S_y$).

## Requirement Identifiers & Scenarios

### REQ-FIX-ARC: Exact Mathematical Penalty Arc
- **Scenario 1 (Symmetry & Center)**:
  - *Given* a pitch with goal line $Y_0$, penalty area front line $Y_{\text{front}}$, and penalty spot $(X_{\text{spot}}, Y_{\text{spot}})$
  - *When* computing the penalty arc geometry
  - *Then* the arc center is $(X_{\text{spot}}, Y_{\text{spot}})$ and the arc is symmetric across the vertical axis $X = X_{\text{spot}}$.
- **Scenario 2 (Boundary Intersections & Midfield Projection)**:
  - *Given* distance $d = Y_{\text{front}} - Y_{\text{spot}} > 0$ and arc radius $R > d$
  - *When* calculating the start and end angles $\theta_{\text{start}} = \arcsin(d/R)$ and $\theta_{\text{end}} = \pi - \arcsin(d/R)$
  - *Then* the arc endpoints lie exactly on the front line ($Y = Y_{\text{front}}$) at $X = X_{\text{spot}} \pm \sqrt{R^2 - d^2}$, and all intermediate arc points satisfy $Y > Y_{\text{front}}$ (projecting toward midfield). No portion of the arc is inside the penalty area.

### REQ-FIX-LAYOUT: Proportional Mobile Composition & Viewport Resilience
- **Scenario 1 (Minimum Scene Height & No Squishing)**:
  - *Given* a mobile viewport of 320x568 or 390x844
  - *When* the scene is rendered with help open or closed
  - *Then* canvas scene height is at least $340\text{px}$, aspect ratio is 1:1 uniform, and document scrolls smoothly without clipping controls.
- **Scenario 2 (Disjoint Layout Regions)**:
  - *Given* Header, Scene, Help, and Controls panels
  - *When* inspecting rendered DOM bounding boxes
  - *Then* no region overlaps another; touch targets meet the $\ge 44\text{px}$ standard.
