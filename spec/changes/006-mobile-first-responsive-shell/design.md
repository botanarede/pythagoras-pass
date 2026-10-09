# Slice 006: Mobile-First Universal Responsive Shell - Design

## Architecture & Layout Structure

### 1. Viewport Container Hierarchy
```
┌────────────────────────────────────────────────────────┐
│ Outer Viewport (min-h-[100dvh], bg-slate-950)           │
│ Centers mobile stage on desktop screens (sm:py-4)       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Mobile Stage Shell (w-full max-w-[460px] mx-auto)│  │
│  │ sm:rounded-3xl sm:border sm:border-slate-800/80  │  │
│  │ sm:shadow-2xl overflow-hidden flex flex-col     │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Header (Safe-area top, brand, phase, flags)│  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Scene Slot (PitchCanvas, guaranteed space) │  │  │
│  │  │ - 1:1 uniform scale                        │  │  │
│  │  │ - Strictly disjoint from controls          │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Help Formula Panel (when open, flows down) │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Controls Dock (Input C, steps, launch)     │  │  │
│  │  │ - Min 44px touch targets                   │  │  │
│  │  │ - Safe-area bottom                         │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Footer (Brand & copyright)                 │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 2. Pitch Sizing & Non-Overlap Math
- `PitchCanvas` is contained in a responsive wrapper with:
  - Width: `w-full`
  - Min Height: `min-h-[250px]` (ensures readability even on short viewports)
  - Ideal Max Height: `max-h-[46dvh]` (leaves ample room for controls without scroll on 390x844)
  - Aspect Ratio: naturally locked by `calculateFieldProjection` maintaining exact $W/H$ ratio.
- No siblings share coordinates with `PitchCanvas`.
- `OfflineIndicator` is anchored at the bottom edge with z-index above footer but below interactive modals.

### 3. Touch Target Guidelines (Mobile Ergonomics)
- Step buttons ($\pm0.01$, $\pm0.10$): Minimum `h-11` ($44\text{px}$) and `w-11`.
- Numeric Input: `h-12` ($48\text{px}$) with bold readable font ($24\text{px}$) and clear focus ring.
- Launch Action Button: `h-12` ($48\text{px}$) full-width primary CTA.
- Phase / Language / Help buttons: `min-h-[40px]` with padded click areas.

### 4. Virtual Keyboard Handling
- Instead of using `overflow-hidden` on the whole page which clips inputs when virtual keyboard slides up:
- The `Mobile Stage Shell` allows natural vertical document scrolling when content exceeds available viewport height.
- The input remains auto-scrolled into view on focus without occluding the top goal or pass trajectory.
