import { describe, it, expect } from 'vitest';
import {
  calculateFieldProjection,
  computePlayerPositions,
  calculateBallPosition,
} from '../src/game/geometry.ts';

describe('Geometry Engine - Uniform Projection & Leg Invariants', () => {
  it('enforces strictly uniform scaling on both axes without anisotropic distortion', () => {
    // 800x600 canvas for a 100x80 logical field
    const proj = calculateFieldProjection(800, 600, 100, 80);
    expect(proj.scaleX).toBe(proj.scaleY);
    expect(proj.scale).toBe(proj.scaleX);
    expect(proj.scale).toBeCloseTo(600 / 80, 4); // height is the bounding constraint (7.5)
  });

  it('guarantees leg distances: horizontal separation is scale * A and vertical is scale * B', () => {
    const proj = calculateFieldProjection(500, 500, 100, 100);
    const a = 6;
    const b = 8;
    const layout = computePlayerPositions(a, b, 'left', proj);

    const pixelDeltaX = Math.abs(layout.attacker.x - layout.passer.x);
    const pixelDeltaY = Math.abs(layout.attacker.y - layout.passer.y);

    // Delta X must equal A * scale, Delta Y must equal B * scale
    expect(pixelDeltaX).toBeCloseTo(a * proj.scale, 2);
    expect(pixelDeltaY).toBeCloseTo(b * proj.scale, 2);

    // Diagonal distance must equal hypot(A, B) * scale
    const diagonalDist = Math.hypot(
      layout.attacker.x - layout.passer.x,
      layout.attacker.y - layout.passer.y
    );
    expect(diagonalDist).toBeCloseTo(Math.hypot(a, b) * proj.scale, 2);

    // Upward attack: attacker Y must be closer to top than passer Y
    expect(layout.attacker.y).toBeLessThan(layout.passer.y);

    // Right-angle vertex R
    expect(layout.rightAngleVertex.x).toBe(layout.attacker.x);
    expect(layout.rightAngleVertex.y).toBe(layout.passer.y);
  });
});

describe('Trajectory & Ball Endpoint Model', () => {
  it('projects ball endpoint exactly along unit direction for given distance', () => {
    const passer = { x: 100, y: 300 };
    const attacker = { x: 100 + 30, y: 300 - 40 }; // 3-4-5 triangle scaled by 10 (hypotenuse 50)
    const totalDist = 50;

    // Correct distance (50) at progress 1.0 reaches attacker exactly
    const posAtFinish = calculateBallPosition(passer, attacker, totalDist, 1.0);
    expect(posAtFinish.groundX).toBeCloseTo(attacker.x, 2);
    expect(posAtFinish.groundY).toBeCloseTo(attacker.y, 2);
    expect(posAtFinish.height).toBeCloseTo(0, 2);
  });

  it('stops short when entered distance is less than target', () => {
    const passer = { x: 100, y: 300 };
    const attacker = { x: 100 + 30, y: 300 - 40 }; // target distance is 50
    const shortDist = 25; // half way

    const pos = calculateBallPosition(passer, attacker, shortDist, 1.0);
    expect(pos.groundX).toBeCloseTo(100 + 15, 2);
    expect(pos.groundY).toBeCloseTo(300 - 20, 2);
  });

  it('overshoots when entered distance exceeds target', () => {
    const passer = { x: 100, y: 300 };
    const attacker = { x: 100 + 30, y: 300 - 40 }; // target distance is 50
    const longDist = 75; // 1.5x overshoot

    const pos = calculateBallPosition(passer, attacker, longDist, 1.0);
    expect(pos.groundX).toBeCloseTo(100 + 45, 2);
    expect(pos.groundY).toBeCloseTo(300 - 60, 2);
  });

  it('provides parabolic height arc mid-flight with zero height at start and finish', () => {
    const passer = { x: 0, y: 0 };
    const attacker = { x: 100, y: 0 };

    const start = calculateBallPosition(passer, attacker, 100, 0);
    const mid = calculateBallPosition(passer, attacker, 100, 0.5);
    const end = calculateBallPosition(passer, attacker, 100, 1.0);

    expect(start.height).toBe(0);
    expect(mid.height).toBeGreaterThan(0);
    expect(end.height).toBe(0);
  });
});
