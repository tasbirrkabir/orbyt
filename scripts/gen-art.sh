#!/bin/bash
# ORBYT "Ink & Ember" art set — custom abstract renders, no people, no offices.
# Style anchor: matte black background + vivid electric orange glow.
# NOTE: never mention hex codes — the model renders them as literal text.
set -u
OUT=/home/z/my-project/public/images/art
STYLE="minimal abstract 3D render, matte black background, deep charcoal darkness, vivid electric orange glowing accents, soft cinematic glow, premium tech agency aesthetic, clean composition, ultra high quality, detailed, no text, no letters, no words, no numbers, no typography, no people, no office"

gen() {
  local file="$1"; local size="$2"; local prompt="$3"
  if [ -s "$OUT/$file" ]; then echo "SKIP $file"; return 0; fi
  z-ai image -p "$prompt, $STYLE" -o "$OUT/$file" -s "$size" >/dev/null 2>&1 \
    && echo "OK  $file" || echo "FAIL $file"
}
export -f gen
export OUT STYLE

CMDS=(
"gen orbit-core.png 1440x720|Concentric glowing orbital rings circling a dark matte black sphere at different angles, tiny glowing satellites traveling on the rings, volumetric haze"
"gen signal-path.png 1344x768|Dark topographic contour map made of thin grey lines with one single glowing orange route path crossing the terrain like a journey"
"gen data-pulse.png 1024x1024|Abstract equalizer bars and one smooth glowing waveform line rising from darkness like a signal being measured"
"gen particle-flow.png 1344x768|Streams of tiny glowing particles converging from the edges into one bright point at the center, long light trails"
"gen lattice.png 1024x1024|Geometric wireframe lattice structure of cubes and nodes with glowing orange edges floating in dark space, isometric view"
"gen eclipse.png 1344x768|Dark matte black sphere with a thin crescent of vivid orange rim light on its edge, eclipse silhouette in dark space"
"gen circuit-weave.png 1024x1024|Abstract circuit board traces weaving and merging into one glowing path, top-down macro view of luminous lines"
"gen wave-field.png 1344x768|Field of small glowing dots forming flowing sine waves across darkness, waves fading into charcoal at the edges"
"gen monolith.png 768x1344|Tall glowing orange monolith slab standing in dark reflective space with thin vertical light seams, low camera angle"
"gen aperture.png 1024x1024|Concentric broken arc segments forming an abstract camera aperture ring, precise geometric fragments"
"gen workflow-nodes.png 1344x768|Glowing orange path threading through a grid of connected nodes and thin lines like an intelligent flowchart coming alive"
"gen fragmented-grid.png 1344x768|Grid of dark square tiles drifting apart with glowing orange gaps forming between them, fragments floating"
"gen layered-system.png 1344x768|Stack of translucent dark glass layers connected by glowing orange vertical light beams, exploded view of a system"
"gen signal-noise.png 1344x768|Two overlapping waveforms side by side, one clean smooth glowing line and one chaotic distorted scatter of the same signal"
)

printf '%s\n' "${CMDS[@]}" | xargs -P 1 -I{} bash -c 'IFS="|" read -r a b <<< "{}"; eval "$a" "$b"'
echo "DONE"
