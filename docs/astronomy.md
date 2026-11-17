# Moon-phase visualization

This is a teaching model, not an ephemeris or an eclipse predictor. The new sample uses the same renderer and data contract as generated lessons.

## Geometry

`src/lib/moon-scene.js` owns the calculations and semantic validation. Let `p` be the fraction of one phase cycle relative to sunlight:

- New Moon: `p = 0` (Moon toward the Sun).
- First quarter: `p = 0.25`.
- Full Moon: `p = 0.5` (Moon away from the Sun).
- Third quarter: `p = 0.75`.
- New Moon again: `p = 1`.

The normalized orbit position is `x = -cos(2πp)`, `y = sin(2πp)`, with sunlight from the left. Screen coordinates increase downward. The visible disk's illuminated fraction is `(1 - cos(2πp)) / 2`. The lit region uses the projected spherical terminator, not two sliding circles. Waxing lights the right side and waning the left, following a Northern Hemisphere viewing convention. The small orbit-view Moon always has its left, Sun-facing half illuminated.

Each numeric update supplies the end phase for one measured narration phrase. Motion eases from the prior value and settles at 85% of that phrase's duration. An explanation of a fixed phase uses an empty update list. The audio media clock drives both views, captions and controls. Pausing freezes motion; seeking reconstructs it. Reduced-motion mode shows the transition's destination immediately. Board motion stays at phrase level. Subtitles independently reveal a cumulative prefix using word timestamps within that phrase, driven by the same audio clock.

## Deliberate simplifications

Sizes, distances and speeds are illustrative. The orbital schematic is flattened; inclination, eclipses, libration, elliptical motion and Earthshine brightness are not calculated. The dark portion is faintly visible for teaching clarity. Earth artwork identifies the observer's planet; its texture is not a geographic/polar projection of the orbital viewpoint. The Sun is a stylized luminous sphere. These limitations are also stated in the SVG description and short on-board caption.

A phase cycle takes about 29.5 days, while an orbit relative to distant stars takes about 27.3 days. The model illustrates the former geometry relative to sunlight, without simulating Earth's motion around the Sun. Earth's shadow is not the cause of ordinary lunar phases; this scene must not be used to teach an eclipse.

## Sources and locally bundled assets

- [NASA: Moon phases](https://science.nasa.gov/moon/moon-phases/) — illumination, phase sequence, viewing orientation, tilted orbit, phase cycle versus orbital period.
- [NASA Space Place: What are the Moon's phases?](https://spaceplace.nasa.gov/moon-phases/en/) — introductory explanation and distinction from Earth's shadow.
- `public/visuals/astronomy/moon.jpg`: [NASA's full-Moon illustration](https://science.nasa.gov/wp-content/uploads/2023/08/full.jpg), used by the NASA Moon Phases guide. Original 640×640 JPEG is retained. SVG clips/transforms the disk at render time and applies the calculated illuminated region.
- `public/visuals/astronomy/earth.jpg`: [NASA: The Blue Marble](https://science.nasa.gov/resource/the-blue-marble/), Apollo 17 Earth photograph. Downloaded from NASA's image service at 600×600; [original asset](https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/i/IMG004849.jpg).

NASA imagery is credited to NASA; no endorsement is implied. The application serves these files locally. Sun artwork, phase masks, arrows, highlights and layout are implemented in React/SVG.

## Preview recording

`moon-phases-v1` has 299 spoken words across six chapters and eighteen phrases. The voice is AI-generated using the configured OpenAI Realtime model and Marin voice. AAC playback and WAV compatibility copies share cue tables measured from PCM samples. The maintainer script rejects a recording below 97% normalized transcript similarity before writing that chapter. This transcript check is a useful guard, not proof of perfect pronunciation or scientific truth.

Previously saved preview versions and audio paths remain unchanged. A changed script or narration needs a new sample version so existing cached lessons cannot receive mismatched audio.

The preview cue tables now include 299 audio-aligned word entries for progressive subtitles. This metadata upgrade leaves all AAC/WAV bytes and phrase boundaries unchanged. The `--align-only` maintainer mode enriches existing cue files and skips already validated timings.
