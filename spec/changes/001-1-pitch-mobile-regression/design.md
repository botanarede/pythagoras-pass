# Slice 001.1: Penalty Arc and Mobile Layout Regression Fix - Design

## 1. Penalty Arc Mathematical Model
In FIFA / IFAB regulation geometry (standardized to relative units):
- Goal Line: $Y_{\text{goal}} = 0$
- Penalty Area Depth: $D_{\text{box}} = 16.5\text{m}$ (Front line at $Y_{\text{front}} = Y_{\text{goal}} + D_{\text{box}}$)
- Penalty Spot Distance: $D_{\text{spot}} = 11.0\text{m}$ (Spot at $Y_{\text{spot}} = Y_{\text{goal}} + D_{\text{spot}}$)
- Spot to Front line distance: $d = D_{\text{box}} - D_{\text{spot}} = 5.5\text{m}$
- Penalty Arc Radius: $R_{\text{arc}} = 9.15\text{m}$

In our logical pitch coordinate system:
Let logical pitch width = $100$, height = $85$.
The goal line is at $Y_{\text{goal}} = \text{offsetY} + \text{pitchHeight} \times 0.05$.
Penalty area front line: $Y_{\text{front}} = Y_{\text{goal}} + \text{pitchHeight} \times 0.22$.
Penalty spot: $Y_{\text{spot}} = Y_{\text{goal}} + \text{pitchHeight} \times 0.1467$ (i.e. $11 / 16.5$ of penalty area depth).
Distance $d = Y_{\text{front}} - Y_{\text{spot}} = \text{pitchHeight} \times (0.22 - 0.1467) = \text{pitchHeight} \times 0.0733$.
Arc radius: $R = d \times (9.15 / 5.5) = \text{pitchHeight} \times 0.122$.

### Intersection Angles
Let $\alpha = \arcsin(d / R) = \arcsin(5.5 / 9.15) \approx 0.6453\text{ rad} \approx 36.97^\circ$.
In Canvas 2D:
- $\theta = 0$: $+X$ (pointing right)
- $\theta = \pi / 2$: $+Y$ (pointing down towards midfield)
- $\theta = \pi$: $-X$ (pointing left)

Intersection points:
- Right intersection: $\theta_{\text{start}} = \alpha$.
  $X_1 = X_{\text{spot}} + R \cos(\alpha)$, $Y_1 = Y_{\text{spot}} + R \sin(\alpha) = Y_{\text{front}}$.
- Left intersection: $\theta_{\text{end}} = \pi - \alpha$.
  $X_2 = X_{\text{spot}} - R \cos(\alpha)$, $Y_2 = Y_{\text{spot}} + R \sin(\alpha) = Y_{\text{front}}$.

When drawn clockwise from $\theta_{\text{start}}$ to $\theta_{\text{end}}$:
- Sweeps from $X_1$ downwards through $\theta = \pi/2$ (apex at $Y = Y_{\text{spot}} + R > Y_{\text{front}}$) to $X_2$.
- Every point on this arc has $Y \ge Y_{\text{front}}$.
- **Zero arc length is inside the penalty box.**
- The arc is strictly symmetric about $X = X_{\text{spot}}$.

## 2. Production Geometry Helper
We add `computePenaltyArcGeometry()` in `src/game/geometry.ts`:
```typescript
export interface PenaltyArcGeometry {
  centerX: number;
  centerY: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  frontLineY: number;
  leftIntersection: Point;
  rightIntersection: Point;
  midfieldApex: Point;
}
```

## 3. Mobile Composition Layout Contract
- **Root Container**: `min-h-screen`, `flex flex-col`, allowing natural vertical document scrolling when content exceeds viewport height.
- **Header**: Fixed height / compact banner ($48\text{px}-56\text{px}$).
- **Scene Viewport**:
  - Reserved minimum height: $340\text{px}$ on mobile, up to $520\text{px}$ on desktop.
  - Aspect ratio: strictly preserves $100 \times 85$ field ratio with uniform letterboxing.
  - Zero squishing: `flex-shrink-0` or explicit CSS clamp `clamp(340px, 48vh, 520px)`.
- **Controls & Help Area**:
  - Distinct block beneath the scene.
  - Expands downwards into page scroll without squeezing the canvas.
  - Touch targets $\ge 44\text{px}$ on all buttons.

## 4. Test Strategy
1. **Behavioral Geometry Unit Tests** in `tests/penaltyArc.test.ts`:
   - Test mathematical intersections: $Y_1 = Y_2 = Y_{\text{front}}$.
   - Test symmetry: $X_1 - X_{\text{spot}} = X_{\text{spot}} - X_2$.
   - Test arc strictly outside penalty area: apex $Y_{\text{apex}} > Y_{\text{front}}$, all points $Y \ge Y_{\text{front}}$.
2. **Layout & Responsive Structure Tests** in `tests/layout.test.ts`:
   - Validates region hierarchy, non-zero minimum scene constraints, and uniform projection scaling across target viewports (320x568, 390x844, 844x390, 1366x768).
3. **CI Workflow**:
   - Create `.github/workflows/verify.yml` with typecheck, Vitest, and build steps.
