export interface Projection {
  scale: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
  pitchWidth: number;
  pitchHeight: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlayerPositions {
  passer: Point;
  attacker: Point;
  rightAngleVertex: Point;
  goalCenter: Point;
  goalPostLeft: Point;
  goalPostRight: Point;
}

export interface BallPosition {
  groundX: number;
  groundY: number;
  height: number;
  renderX: number;
  renderY: number;
}

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

export function computePenaltyArcGeometry(
  spotX: number,
  spotY: number,
  frontLineY: number,
  radius: number
): PenaltyArcGeometry {
  const d = frontLineY - spotY;
  const clampedRatio = Math.max(-1, Math.min(1, d / radius));
  const alpha = Math.asin(clampedRatio);

  const startAngle = alpha;
  const endAngle = Math.PI - alpha;

  const halfChord = Math.sqrt(Math.max(0, radius * radius - d * d));
  const rightIntersection: Point = { x: spotX + halfChord, y: frontLineY };
  const leftIntersection: Point = { x: spotX - halfChord, y: frontLineY };
  const midfieldApex: Point = { x: spotX, y: spotY + radius };

  return {
    centerX: spotX,
    centerY: spotY,
    radius,
    startAngle,
    endAngle,
    frontLineY,
    leftIntersection,
    rightIntersection,
    midfieldApex,
  };
}

export function calculateFieldProjection(
  canvasWidth: number,
  canvasHeight: number,
  logicalWidth: number = 100,
  logicalHeight: number = 80
): Projection {
  const safeW = Math.max(10, canvasWidth);
  const safeH = Math.max(10, canvasHeight);

  const scale = Math.min(safeW / logicalWidth, safeH / logicalHeight);
  const pitchWidth = logicalWidth * scale;
  const pitchHeight = logicalHeight * scale;

  const offsetX = (safeW - pitchWidth) / 2;
  const offsetY = (safeH - pitchHeight) / 2;

  return {
    scale,
    scaleX: scale,
    scaleY: scale,
    offsetX,
    offsetY,
    pitchWidth,
    pitchHeight,
  };
}

export function computePlayerPositions(
  a: number,
  b: number,
  side: 'left' | 'right',
  projection: Projection
): PlayerPositions {
  const { scale, offsetX, offsetY, pitchWidth, pitchHeight } = projection;

  // Center of pitch
  const centerX = offsetX + pitchWidth / 2;
  const goalY = offsetY + pitchHeight * 0.08;
  const goalWidth = pitchWidth * 0.28;

  const goalCenter: Point = { x: centerX, y: goalY };
  const goalPostLeft: Point = { x: centerX - goalWidth / 2, y: goalY };
  const goalPostRight: Point = { x: centerX + goalWidth / 2, y: goalY };

  // Determine vertical spacing for attacker and passer
  // Attacker should be stationed in dangerous attacking third (e.g. 25% to 35% from top)
  // Passer should be in midfield / build-up area (around 65% to 75% from top)
  const pixelA = a * scale;
  const pixelB = b * scale;

  // Attacker position
  const attackerY = goalY + pitchHeight * 0.22;
  const passerY = attackerY + pixelB;

  let passerX: number;
  let attackerX: number;

  if (side === 'left') {
    // Passer on the left, attacker on the right
    passerX = centerX - pixelA / 2;
    attackerX = passerX + pixelA;
  } else {
    // Passer on the right, attacker on the left
    passerX = centerX + pixelA / 2;
    attackerX = passerX - pixelA;
  }

  // Right angle vertex R:
  // Leg A is horizontal (from passer to R: same Y as passer, same X as attacker)
  // Leg B is vertical (from R to attacker: same X as attacker, from passerY to attackerY)
  const rightAngleVertex: Point = {
    x: attackerX,
    y: passerY,
  };

  return {
    passer: { x: passerX, y: passerY },
    attacker: { x: attackerX, y: attackerY },
    rightAngleVertex,
    goalCenter,
    goalPostLeft,
    goalPostRight,
  };
}

export function calculateBallPosition(
  passer: Point,
  attacker: Point,
  enteredDistance: number,
  progress: number,
  maxArcHeight: number = 35
): BallPosition {
  const dx = attacker.x - passer.x;
  const dy = attacker.y - passer.y;
  const targetDist = Math.hypot(dx, dy);

  // Unit direction vector from passer to attacker
  const unitX = targetDist === 0 ? 0 : dx / targetDist;
  const unitY = targetDist === 0 ? 0 : dy / targetDist;

  // Total ground distance the ball will travel based on entered value
  const endpointX = passer.x + unitX * enteredDistance;
  const endpointY = passer.y + unitY * enteredDistance;

  // Linear interpolation for ground coordinates
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const groundX = passer.x + (endpointX - passer.x) * clampedProgress;
  const groundY = passer.y + (endpointY - passer.y) * clampedProgress;

  // Parabolic flight arc (cosmetic height off ground)
  // h(t) = 4 * H * t * (1 - t)
  const height = 4 * maxArcHeight * clampedProgress * (1 - clampedProgress);

  // Render position: ground Y minus height
  const renderX = groundX;
  const renderY = groundY - height;

  return {
    groundX,
    groundY,
    height,
    renderX,
    renderY,
  };
}
