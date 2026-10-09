import { describe, it, expect } from 'vitest';
import {
  calculateFieldProjection,
  computePlayerPositions,
} from '../src/game/geometry.ts';

describe('Responsive Layout & Projection Geometry Contract', () => {
  const targetViewports = [
    { name: 'iPhone SE (compact portrait)', width: 320, height: 360 },
    { name: 'iPhone 12/13/14 (standard mobile portrait)', width: 390, height: 480 },
    { name: 'Mobile Landscape (short screen)', width: 844, height: 350 },
    { name: 'Desktop Standard', width: 1024, height: 600 },
  ];

  it.each(targetViewports)(
    'guarantees strictly uniform scaling ($scaleX === $scaleY) on $name',
    ({ width, height }) => {
      const proj = calculateFieldProjection(width, height, 100, 85);

      // Absolutely zero anisotropic stretching allowed
      expect(proj.scaleX).toBe(proj.scaleY);
      expect(proj.scale).toBe(proj.scaleX);
      expect(proj.scale).toBeGreaterThan(0);

      // Pitch fits inside the available canvas dimensions without overflow
      expect(proj.pitchWidth).toBeLessThanOrEqual(width);
      expect(proj.pitchHeight).toBeLessThanOrEqual(height);

      // Offset centers the pitch accurately
      expect(proj.offsetX).toBeGreaterThanOrEqual(0);
      expect(proj.offsetY).toBeGreaterThanOrEqual(0);
      expect(proj.offsetX * 2 + proj.pitchWidth).toBeCloseTo(width, 1);
      expect(proj.offsetY * 2 + proj.pitchHeight).toBeCloseTo(height, 1);
    }
  );

  it.each(targetViewports)(
    'keeps players and right-angle triangle within pitch bounds on $name',
    ({ width, height }) => {
      const proj = calculateFieldProjection(width, height, 100, 85);

      // Test with max leg dimensions for Easy (10, 10) and Hard (30, 30)
      for (const [a, b] of [[10, 10], [3, 4], [30, 30]]) {
        for (const side of ['left', 'right'] as const) {
          const pos = computePlayerPositions(a, b, side, proj);

          // Passer and Attacker within pitch X bounds
          expect(pos.passer.x).toBeGreaterThanOrEqual(proj.offsetX);
          expect(pos.passer.x).toBeLessThanOrEqual(proj.offsetX + proj.pitchWidth);
          expect(pos.attacker.x).toBeGreaterThanOrEqual(proj.offsetX);
          expect(pos.attacker.x).toBeLessThanOrEqual(proj.offsetX + proj.pitchWidth);

          // Attacker is in offensive third, higher than passer (upward attack)
          expect(pos.attacker.y).toBeLessThan(pos.passer.y);

          // Right-angle vertex is within pitch bounds
          expect(pos.rightAngleVertex.x).toBeGreaterThanOrEqual(proj.offsetX);
          expect(pos.rightAngleVertex.x).toBeLessThanOrEqual(proj.offsetX + proj.pitchWidth);
        }
      }
    }
  );

  it('guarantees safe clearances for labels and markers', () => {
    const proj = calculateFieldProjection(390, 480, 100, 85);
    const pos = computePlayerPositions(6, 8, 'left', proj);

    // Goal is placed near top
    expect(pos.goalCenter.y).toBeLessThan(pos.attacker.y);
    // Attacker has clearance from goal
    expect(pos.attacker.y - pos.goalCenter.y).toBeGreaterThan(proj.scale * 10);
  });
});
