import React, { useEffect, useRef } from 'react';
import {
  calculateFieldProjection,
  computePlayerPositions,
  calculateBallPosition,
  computePenaltyArcGeometry,
  PlayerPositions,
  Projection,
} from '../game/geometry.ts';
import { RoundConfig, RoundPhase } from '../game/types.ts';
import { PhaseTheme } from '../game/themes.ts';
import { Translations } from '../game/i18n.ts';

interface PitchCanvasProps {
  config: RoundConfig;
  phase: RoundPhase;
  animationProgress: number; // 0 to 1
  enteredHundredths: number | null;
  isHelpOpen: boolean;
  theme: PhaseTheme;
  t: Translations;
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  config,
  phase,
  animationProgress,
  enteredHundredths,
  isHelpOpen,
  theme,
  t,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Calculate projection (logical pitch 100 x 85)
    const proj = calculateFieldProjection(width, height, 100, 85);
    const pos = computePlayerPositions(config.a, config.b, config.passerSide, proj);

    // 1. Draw Stadium Surroundings & Perimeter Banners
    drawStadiumBanners(ctx, width, height, proj, theme);

    // 2. Draw Pitch Field Surface (stripes & line markings)
    drawPitchLines(ctx, proj, pos, theme);

    // 3. Draw Right Triangle Leg Geometry
    drawTriangleGeometry(ctx, config, pos, proj, isHelpOpen, enteredHundredths);

    // 4. Draw Goal Structure
    drawGoal(ctx, pos, proj, phase);

    // 5. Draw Players with team kits and localized labels
    drawPlayers(ctx, pos, proj, phase, animationProgress, theme, t);

    // 6. Draw Ball & Trajectory
    drawBallFlight(
      ctx,
      pos,
      proj,
      config,
      phase,
      animationProgress,
      enteredHundredths
    );

    // 7. Draw Visual Feedback Badges (GOL / Curto / Longo)
    drawFeedbackOverlays(ctx, pos, proj, phase, animationProgress);

    ctx.restore();
  }, [config, phase, animationProgress, enteredHundredths, isHelpOpen, theme, t]);

  return (
    <div className="w-full flex flex-col items-center justify-center shrink-0 relative select-none">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={t.canvasLabel}
        tabIndex={0}
        className="w-full h-[280px] sm:h-[320px] max-h-[46dvh] min-h-[250px] rounded-2xl shadow-2xl border border-slate-700/80 bg-emerald-950 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

// --- RENDER HELPERS ---

function drawStadiumBanners(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  proj: Projection,
  theme: PhaseTheme
) {
  // Deep background matching time of day
  ctx.fillStyle = theme.skyColor;
  ctx.fillRect(0, 0, w, h);

  // Stadium Perimeter Banner Colors
  const bannerY = Math.max(0, proj.offsetY - 14);
  const bannerH = 10;
  const bannerW = proj.pitchWidth;
  const bannerX = proj.offsetX;

  ctx.save();
  // Striped banner
  const segmentCount = theme.bannerColors.length;
  const segmentW = bannerW / segmentCount;
  for (let i = 0; i < segmentCount; i++) {
    ctx.fillStyle = theme.bannerColors[i];
    ctx.fillRect(bannerX + i * segmentW, bannerY, segmentW, bannerH);
  }

  // Stadium atmosphere details
  if (theme.timeOfDay === 'night') {
    // Floodlight glow lamps at stadium corners
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(bannerX + 15, bannerY - 4, 3, 0, Math.PI * 2);
    ctx.arc(bannerX + bannerW - 15, bannerY - 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
    ctx.beginPath();
    ctx.arc(bannerX + 15, bannerY - 4, 12, 0, Math.PI * 2);
    ctx.arc(bannerX + bannerW - 15, bannerY - 4, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme.timeOfDay === 'sunset') {
    // Warm sunset gradient haze along the top
    const grad = ctx.createLinearGradient(0, 0, 0, bannerY + bannerH);
    grad.addColorStop(0, 'rgba(251, 146, 60, 0.25)');
    grad.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, bannerY + bannerH);
  }

  ctx.restore();
}

function drawPitchLines(
  ctx: CanvasRenderingContext2D,
  proj: Projection,
  pos: PlayerPositions,
  theme: PhaseTheme
) {
  const { offsetX, offsetY, pitchWidth, pitchHeight } = proj;

  // Pitch Grass Base
  ctx.save();
  ctx.fillStyle = theme.grassBaseColor;
  ctx.fillRect(offsetX, offsetY, pitchWidth, pitchHeight);

  // Mowing lawn bands (vertical or horizontal stripes)
  const bands = 9;
  const bandH = pitchHeight / bands;
  for (let i = 0; i < bands; i++) {
    if (i % 2 === 0) {
      ctx.fillStyle = theme.grassStripeColor;
      ctx.fillRect(offsetX, offsetY + i * bandH, pitchWidth, bandH);
    }
  }

  // Pitch Boundary Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = Math.max(2, 2.5 * (proj.scale / 5));
  ctx.strokeRect(offsetX, offsetY, pitchWidth, pitchHeight);

  // Penalty Box (Attacking Third)
  const penBoxW = pitchWidth * 0.58;
  const penBoxH = pitchHeight * 0.28;
  const penBoxX = offsetX + (pitchWidth - penBoxW) / 2;
  const penBoxY = offsetY;
  ctx.strokeRect(penBoxX, penBoxY, penBoxW, penBoxH);

  // 6-yard Goal Box
  const goalBoxW = pitchWidth * 0.32;
  const goalBoxH = pitchHeight * 0.12;
  const goalBoxX = offsetX + (pitchWidth - goalBoxW) / 2;
  ctx.strokeRect(goalBoxX, offsetY, goalBoxW, goalBoxH);

  // Penalty Spot: exactly 11m from goal line (11/16.5 of penalty area depth)
  const spotY = offsetY + penBoxH * (11 / 16.5);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pos.goalCenter.x, spotY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Penalty Arc (Meia-lua): strictly outside the penalty area, projecting toward midfield
  // Radius is regulation 9.15m (d * 9.15 / 5.5 where d is the distance from spot to front line)
  const dSpotToFront = penBoxH - (spotY - offsetY);
  const arcRadius = dSpotToFront * (9.15 / 5.5);
  const penaltyArc = computePenaltyArcGeometry(
    pos.goalCenter.x,
    spotY,
    offsetY + penBoxH,
    arcRadius
  );

  ctx.beginPath();
  ctx.arc(
    penaltyArc.centerX,
    penaltyArc.centerY,
    penaltyArc.radius,
    penaltyArc.startAngle,
    penaltyArc.endAngle,
    false
  );
  ctx.stroke();

  ctx.restore();
}

function drawTriangleGeometry(
  ctx: CanvasRenderingContext2D,
  config: RoundConfig,
  pos: PlayerPositions,
  proj: Projection,
  isHelpOpen: boolean,
  enteredHundredths: number | null
) {
  const { passer, attacker, rightAngleVertex } = pos;

  ctx.save();

  // 1. Leg A (Horizontal line: from passer to rightAngleVertex)
  ctx.strokeStyle = '#f59e0b'; // Amber
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(passer.x, passer.y);
  ctx.lineTo(rightAngleVertex.x, rightAngleVertex.y);
  ctx.stroke();

  // 2. Leg B (Vertical line: from rightAngleVertex to attacker)
  ctx.strokeStyle = '#06b6d4'; // Cyan
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(rightAngleVertex.x, rightAngleVertex.y);
  ctx.lineTo(attacker.x, attacker.y);
  ctx.stroke();

  // 3. Right-Angle Square Marker at rightAngleVertex
  const squareSize = Math.max(10, 14 * (proj.scale / 6));
  const dirX = passer.x < attacker.x ? -1 : 1;
  const dirY = -1; // attacker is always above passer (upward attack)

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rightAngleVertex.x + dirX * squareSize, rightAngleVertex.y);
  ctx.lineTo(
    rightAngleVertex.x + dirX * squareSize,
    rightAngleVertex.y + dirY * squareSize
  );
  ctx.lineTo(rightAngleVertex.x, rightAngleVertex.y + dirY * squareSize);
  ctx.stroke();

  // Dot in right-angle square
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(
    rightAngleVertex.x + (dirX * squareSize) / 2,
    rightAngleVertex.y + (dirY * squareSize) / 2,
    2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 4. Dimension Labels: Leg A and Leg B
  drawBadge(
    ctx,
    (passer.x + rightAngleVertex.x) / 2,
    passer.y + 18,
    `A = ${config.a}`,
    '#f59e0b',
    '#000000'
  );

  const labelBX = rightAngleVertex.x + (config.passerSide === 'left' ? 24 : -24);
  drawBadge(
    ctx,
    labelBX,
    (rightAngleVertex.y + attacker.y) / 2,
    `B = ${config.b}`,
    '#06b6d4',
    '#000000'
  );

  // 5. Help Mode: Ideal Hypotenuse Line & Submitted Preview
  if (isHelpOpen) {
    // Dashed Reference Diagonal
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#a855f7'; // Purple reference
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(passer.x, passer.y);
    ctx.lineTo(attacker.x, attacker.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reference C Badge
    const midX = (passer.x + attacker.x) / 2;
    const midY = (passer.y + attacker.y) / 2;
    const refText = config.isIntegerTriple
      ? `C = ${config.targetHundredths / 100}`
      : `C ≈ ${config.formattedApprox}`;
    drawBadge(ctx, midX - 20, midY - 14, refText, '#a855f7', '#ffffff');

    // Preview marker if player has entered a value
    if (enteredHundredths && enteredHundredths > 0) {
      const enteredDistancePixels = (enteredHundredths / 100) * proj.scale;
      const previewBall = calculateBallPosition(
        passer,
        attacker,
        enteredDistancePixels,
        1.0
      );

      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(previewBall.groundX, previewBall.groundY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      drawBadge(
        ctx,
        previewBall.groundX,
        previewBall.groundY + 16,
        `Destino: ${(enteredHundredths / 100).toFixed(2)}`,
        '#f43f5e',
        '#ffffff'
      );
    }
  }

  ctx.restore();
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bgColor: string,
  textColor: string
) {
  ctx.save();
  ctx.font = 'bold 12px sans-serif';
  const metrics = ctx.measureText(text);
  const padX = 6;
  const padY = 4;
  const w = metrics.width + padX * 2;
  const h = 18;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawGoal(
  ctx: CanvasRenderingContext2D,
  pos: PlayerPositions,
  proj: Projection,
  phase: RoundPhase
) {
  const { goalPostLeft, goalPostRight, goalCenter } = pos;
  const netDepth = 12 * (proj.scale / 5);

  ctx.save();

  // Net background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(
    goalPostLeft.x,
    goalCenter.y - netDepth,
    goalPostRight.x - goalPostLeft.x,
    netDepth
  );

  // Net cross-hatching
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  const netLines = 6;
  const step = (goalPostRight.x - goalPostLeft.x) / netLines;
  for (let i = 0; i <= netLines; i++) {
    ctx.beginPath();
    ctx.moveTo(goalPostLeft.x + i * step, goalCenter.y);
    ctx.lineTo(goalPostLeft.x + i * step, goalCenter.y - netDepth);
    ctx.stroke();
  }

  // Goal Crossbar & Posts
  ctx.strokeStyle = phase === 'goal' ? '#fbbf24' : '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(goalPostLeft.x, goalCenter.y);
  ctx.lineTo(goalPostRight.x, goalCenter.y);
  ctx.stroke();

  // Posts
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(goalPostLeft.x, goalCenter.y, 4, 0, Math.PI * 2);
  ctx.arc(goalPostRight.x, goalCenter.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPlayers(
  ctx: CanvasRenderingContext2D,
  pos: PlayerPositions,
  proj: Projection,
  phase: RoundPhase,
  progress: number,
  theme: PhaseTheme,
  t: Translations
) {
  const radius = Math.max(9, 12 * (proj.scale / 6));

  // 1. Passer (P)
  drawPlayerFigure(
    ctx,
    pos.passer.x,
    pos.passer.y,
    radius,
    theme.passerJersey,
    theme.passerShorts,
    theme.passerTrim,
    t.passerLabel,
    phase === 'passing' && progress < 0.2
  );

  // 2. Attacker (Q)
  drawPlayerFigure(
    ctx,
    pos.attacker.x,
    pos.attacker.y,
    radius,
    theme.attackerJersey,
    theme.attackerShorts,
    theme.attackerTrim,
    t.attackerLabel,
    phase === 'shooting'
  );
}

function drawPlayerFigure(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  jerseyColor: string,
  shortsColor: string,
  trimColor: string,
  label: string,
  isKicking: boolean
) {
  ctx.save();

  // Player Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + r + 2, r * 1.1, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Torso / Jersey
  ctx.fillStyle = jerseyColor;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Trim stripes
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Head
  ctx.fillStyle = '#f5d0b0'; // Skin tone
  ctx.beginPath();
  ctx.arc(x, y - 2, r * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1e1b18';
  ctx.beginPath();
  ctx.arc(x, y - 4, r * 0.5, Math.PI, Math.PI * 2);
  ctx.fill();

  // Kicking animation visual bump
  if (isKicking) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Label above
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 3;
  ctx.fillText(label, x, y - r - 6);

  ctx.restore();
}

function drawBallFlight(
  ctx: CanvasRenderingContext2D,
  pos: PlayerPositions,
  proj: Projection,
  config: RoundConfig,
  phase: RoundPhase,
  progress: number,
  enteredHundredths: number | null
) {
  const enteredDistPixels = ((enteredHundredths || 0) / 100) * proj.scale;
  let ballX = pos.passer.x;
  let ballY = pos.passer.y;
  let groundX = pos.passer.x;
  let groundY = pos.passer.y;
  let height = 0;

  if (phase === 'idle') {
    // Ball sits at passer's foot
    ballX = pos.passer.x + (config.passerSide === 'left' ? 10 : -10);
    ballY = pos.passer.y - 4;
    groundX = ballX;
    groundY = ballY;
  } else if (phase === 'passing' || phase === 'miss_short' || phase === 'miss_long') {
    const flight = calculateBallPosition(
      pos.passer,
      pos.attacker,
      enteredDistPixels,
      progress
    );
    ballX = flight.renderX;
    ballY = flight.renderY;
    groundX = flight.groundX;
    groundY = flight.groundY;
    height = flight.height;
  } else if (phase === 'shooting') {
    // Attacker kicks from Q towards goalCenter
    const shootDx = pos.goalCenter.x - pos.attacker.x;
    const shootDy = pos.goalCenter.y - pos.attacker.y;
    ballX = pos.attacker.x + shootDx * progress;
    ballY = pos.attacker.y + shootDy * progress - Math.sin(progress * Math.PI) * 15;
    groundX = pos.attacker.x + shootDx * progress;
    groundY = pos.attacker.y + shootDy * progress;
  } else if (phase === 'goal') {
    // Ball resting inside the goal net
    ballX = pos.goalCenter.x;
    ballY = pos.goalCenter.y - 6;
    groundX = ballX;
    groundY = ballY;
  }

  // Draw Ground Shadow
  ctx.save();
  const shadowRadius = Math.max(2, 5 - height * 0.08);
  ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.15, 0.45 - height * 0.01)})`;
  ctx.beginPath();
  ctx.ellipse(groundX, groundY, shadowRadius * 1.3, shadowRadius * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw Ball
  const ballR = Math.max(4.5, 6 * (proj.scale / 6));
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
  ctx.fill();

  // Ball Soccer Pattern
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFeedbackOverlays(
  ctx: CanvasRenderingContext2D,
  pos: PlayerPositions,
  proj: Projection,
  phase: RoundPhase,
  progress: number
) {
  if (phase === 'goal') {
    ctx.save();
    ctx.font = '900 36px sans-serif';
    ctx.fillStyle = '#fbbf24'; // Gold
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 5;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 15;

    const textY = pos.goalCenter.y + 40;
    ctx.strokeText('⚽ GOL! ⚽', pos.goalCenter.x, textY);
    ctx.fillText('⚽ GOL! ⚽', pos.goalCenter.x, textY);
    ctx.restore();
  } else if (phase === 'miss_short') {
    ctx.save();
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#f87171'; // Red
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText('⚠️ Passe Curto!', pos.attacker.x, pos.attacker.y + 35);
    ctx.restore();
  } else if (phase === 'miss_long') {
    ctx.save();
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText('⚠️ Passe Longo!', pos.attacker.x, pos.attacker.y + 35);
    ctx.restore();
  }
}
