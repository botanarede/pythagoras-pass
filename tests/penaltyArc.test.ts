import { describe, it, expect } from 'vitest';
import { computePenaltyArcGeometry } from '../src/game/geometry.ts';

describe('Penalty Arc (Meia-Lua) Mathematical Contract', () => {
  // Regulation-proportional scenario:
  // Penalty spot at Y = 100, Front line of penalty box at Y = 150 (d = 50), Radius = 83.18
  const spotX = 200;
  const spotY = 100;
  const frontLineY = 150;
  const d = frontLineY - spotY; // 50
  const radius = (50 / 5.5) * 9.15; // ~83.1818

  it('calculates exact intersection points on the penalty area front line', () => {
    const arc = computePenaltyArcGeometry(spotX, spotY, frontLineY, radius);

    // Left and right intersections MUST sit precisely on the front line
    expect(arc.leftIntersection.y).toBeCloseTo(frontLineY, 2);
    expect(arc.rightIntersection.y).toBeCloseTo(frontLineY, 2);

    // X positions must be exactly spotX +- sqrt(R^2 - d^2)
    const expectedHalfChord = Math.sqrt(radius * radius - d * d);
    expect(arc.rightIntersection.x).toBeCloseTo(spotX + expectedHalfChord, 2);
    expect(arc.leftIntersection.x).toBeCloseTo(spotX - expectedHalfChord, 2);
  });

  it('guarantees lateral symmetry across the vertical goal-center axis', () => {
    const arc = computePenaltyArcGeometry(spotX, spotY, frontLineY, radius);

    const rightDist = arc.rightIntersection.x - arc.centerX;
    const leftDist = arc.centerX - arc.leftIntersection.x;

    expect(rightDist).toBeCloseTo(leftDist, 4);
    expect(rightDist).toBeGreaterThan(0);
  });

  it('computes exact canvas angles where sin(theta) = d / R', () => {
    const arc = computePenaltyArcGeometry(spotX, spotY, frontLineY, radius);

    const expectedAlpha = Math.asin(d / radius);
    expect(arc.startAngle).toBeCloseTo(expectedAlpha, 4);
    expect(arc.endAngle).toBeCloseTo(Math.PI - expectedAlpha, 4);
  });

  it('projects apex strictly toward midfield beyond the penalty area front line', () => {
    const arc = computePenaltyArcGeometry(spotX, spotY, frontLineY, radius);

    expect(arc.midfieldApex.x).toBeCloseTo(spotX, 2);
    expect(arc.midfieldApex.y).toBeCloseTo(spotY + radius, 2);
    expect(arc.midfieldApex.y).toBeGreaterThan(frontLineY);
  });

  it('ensures zero arc portion penetrates inside the penalty area', () => {
    const arc = computePenaltyArcGeometry(spotX, spotY, frontLineY, radius);

    // Sample 20 points along the arc from startAngle to endAngle
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const theta = arc.startAngle + (arc.endAngle - arc.startAngle) * (i / steps);
      const pointY = arc.centerY + arc.radius * Math.sin(theta);
      // In downward Y screen coordinates, pointY must be >= frontLineY
      expect(pointY).toBeGreaterThanOrEqual(frontLineY - 0.001);
    }
  });
});
