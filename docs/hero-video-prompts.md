# VentureNex — Hero Video Generation Prompts

> For use with Runway Gen-3, Sora, Kling, Pika, or similar text-to-video tools.
> Target: 10–15s looping background video, 1920×1080, subtle motion, cinematic colour grade.

---

## Option A — "The Virtual Huddle" (Recommended)

**Prompt:**
> Cinematic over-the-shoulder shot of a young professional wearing headphones, sitting at a clean desk in a stylish home office at night. Her ultrawide monitor shows a video call with 5 diverse teammates in a grid — different ethnicities, different home environments, different time zones visible through their windows (daylight, sunset, night). Beside the video grid, a shared online whiteboard fills half the screen — colourful sticky notes, flow diagrams, connecting arrows, and task cards being rearranged in real time. A cursor moves a sticky note on the whiteboard. Camera slowly pushes in towards the monitor. Warm desk lamp glow mixed with cool indigo monitor light. Shallow depth of field. City lights bokeh through the window behind her. Muted — no audio. No text overlays. 4K, 24fps.

**Why it works:** Shows the exact VentureNex experience — diverse global team, remote-first, actively planning together on a shared digital canvas. The different time zones in each person's background sell the "global" angle instantly.

---

## Option B — "Screen-First"

**Prompt:**
> Smooth slow dolly shot of a laptop screen in a dimly lit room. The screen shows a sleek online whiteboard app with a project plan — colourful sticky notes arranged in columns (To Do, In Progress, Done), wireframe sketches, and connecting arrows. Five small video call bubbles of diverse professionals are pinned to the top of the whiteboard — each person in a different location (home office, café, modern apartment). One person's cursor drags a sticky note from one column to another. Another cursor adds a new card. The whiteboard feels alive with gentle real-time activity. Camera slowly drifts closer to the screen until the whiteboard fills the frame. Cool indigo and violet ambient glow on the laptop edges. Shallow depth of field. Muted. No text overlays. 4K, 24fps.

**Why it works:** Puts the product experience front and centre. The viewer immediately understands "this is a platform where remote teams plan and build together." Minimal set dressing keeps focus on the digital collaboration.

---

## Option C — "Split Worlds" ⭐ SELECTED

**Prompt:**
**Scene 1 — "The Build" (0:00–0:08)**
> Cinematic split-screen of four diverse professionals, each in their own remote environment — a developer in a Tokyo apartment at night with city lights outside, a designer in a sun-drenched Berlin loft, a project manager in a Lagos home office with warm golden light, a founder in a rainy New York high-rise at dusk. Each person is at their desk, focused on their glowing screen, typing, scrolling, and occasionally smiling at something on-screen. Their monitors show a shared digital workspace — flowchart icons, task cards, profile avatars, and connection lines animate smoothly across the screen. Cursors drag and rearrange UI elements. A progress bar fills. A notification badge pulses. A kanban card slides from one column to the next. All on-screen activity is digital — clean icons, vector shapes, UI components — no physical objects. Camera holds steady on the four-quadrant composition, with a very slow gentle push-in. Each quadrant is colour-graded to match its location's light but united by the indigo and violet glow of their screens. Muted — no audio. No text overlays. 4K, 24fps.

**Scene 2 — "The Pitch" (0:08–0:15)**
> Smooth crossfade transition. The four quadrants dissolve into a single cinematic frame: the founder from the New York high-rise, now standing confidently in front of her monitor. Her screen shows a polished pitch deck — clean slides with charts, traction metrics, and a team photo of the four collaborators from Scene 1. On the other half of her screen, a video call shows a suited investor leaning forward with interest, nodding slowly, engaged. The founder gestures towards her screen as she presents. A subtle green checkmark animation appears on the pitch deck — deal approved. The founder breaks into a genuine smile. Camera holds steady with a very slow push-in on her face. Warm amber key light from the side, cool indigo fill from the monitor. Rain streaks on the window behind her, city lights soft in the bokeh. Muted — no audio. No text overlays. 4K, 24fps.

**Why it works:** Two-act story — *build together, then win together*. Scene 1 shows the collaborative journey (the product). Scene 2 delivers the payoff (the result). The founder pitching the completed project to an investor closes the loop on the full VentureNex value proposition: find people → build the project → pitch to investors. The crossfade from four quadrants to one person creates a satisfying visual resolution.

---

## Option D — "The Whiteboard Comes Alive"

**Prompt:**
> Top-down bird's-eye shot of a large online whiteboard filling the entire frame. The board is populated with colourful sticky notes, user avatars, profile cards with photos, wireframe sketches, and connection lines forming a network. Multiple cursors (each a different colour, each labelled with a name) move across the board — dragging cards, drawing arrows, adding notes. The activity is calm and purposeful, not frantic. Camera very slowly zooms out, revealing more of the board and more contributors joining. Colour palette: white board background with indigo, violet, cyan, and amber accents on the cards and connections. Clean, modern UI aesthetic. Muted. No text overlays. 4K, 24fps.

**Why it works:** Abstract enough to loop seamlessly, concrete enough to communicate "real people collaborating on a shared plan." The expanding zoom-out suggests a growing network — more people joining, more ideas connecting.

---

## Option E — "Night Shift, Global Team"

**Prompt:**
> Cinematic tracking shot starting on a close-up of hands typing on a glowing keyboard in a dark room. Camera pulls back to reveal a professional at a standing desk, their monitor showing an online whiteboard with sticky notes and a video call sidebar with diverse teammates. Camera continues pulling back through the window, rising upward into a city skyline at night — apartment windows glowing with screens. Slow transition: the city dissolves into a stylised digital globe with glowing connection lines linking cities across continents. The globe rotates gently. Deep indigo and violet colour grade throughout. Volumetric light rays. Muted — no audio. No text overlays. 4K, 24fps.

**Why it works:** Tells a story from individual → team → global network in one continuous shot. The transition from physical to digital reinforces that VentureNex bridges the gap between people and projects worldwide.

---

## Production Notes

### Overlay Compatibility
The video will sit behind:
- Semi-transparent dark gradient (`from-slate-950/80 via-slate-950/65 to-indigo-950/40`)
- White headline text with drop shadow
- Glassmorphic badge and buttons

So the video should be:
- **Not too busy** — no fast cuts or flashing
- **Dark-ish or mid-tone** — the overlay will darken it further
- **Subtle motion** — slow dolly, orbit, or drift (no handheld shake)
- **No faces in the left half** — that's where the headline text sits

### Colour Palette to Match Brand
| Element | Hex |
|---|---|
| Indigo (primary) | `#6366f1` |
| Violet (accent) | `#8b5cf6` |
| Purple (accent) | `#a855f7` |
| Cyan (secondary) | `#06b6d4` |
| Warm amber (highlight) | `#f59e0b` |

### Technical Specs
- **Resolution:** 1920×1080 minimum (4K preferred for quality at scale)
- **Duration:** 10–15 seconds (will be looped with `<video loop>`)
- **Format:** MP4 (H.264) or WebM (VP9) for web delivery
- **File size target:** < 5MB for fast load (compress with HandBrake or FFmpeg)
- **Audio:** None (muted background video)

### Implementation
Once generated, the video replaces the current `<Image>` in the hero section:
```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  className="object-cover object-center"
  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
>
  <source src="/hero-bg.mp4" type="video/mp4" />
  <source src="/hero-bg.webm" type="video/webm" />
</video>
```
With a static image fallback for slow connections / mobile data saver.
