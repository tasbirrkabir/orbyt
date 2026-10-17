#!/bin/bash
# ORBYT "Ember Poster" set — original art echoing the user's reference plates
# (glowing monoliths, brutalist energy, mantra posters) without copying them.
# Style anchor: matte black + vivid ember orange. No hex codes, no baked text —
# typography is done in CSS so it stays razor sharp and on-brand.
set -u
OUT=/home/z/my-project/public/images/art
STYLE="bold poster-like composition, matte black background, deep charcoal darkness, vivid electric orange glowing accents, film grain, cinematic contrast, premium tech agency aesthetic, dramatic lighting, ultra high quality, detailed, no text, no letters, no words, no numbers, no typography, no people, no office"

gen() {
  local file="$1"; local size="$2"; local prompt="$3"
  if [ -s "$OUT/$file" ]; then echo "SKIP $file"; return 0; fi
  z-ai image -p "$prompt, $STYLE" -o "$OUT/$file" -s "$size" >/dev/null 2>&1 \
    && echo "OK  $file" || echo "FAIL $file"
}
export -f gen
export OUT STYLE

CMDS=(
"gen design-grid.png 1344x768|Architectural blueprint made of thin glowing orange circles and arcs drawn over a dark grid, compass geometry, technical drawing coming alive with light"
"gen build-blocks.png 1344x768|Dark glossy blocks stacking themselves into a rising tower, thin glowing orange seams of light between the layers, mid-assembly"
"gen grow-terrace.png 1344x768|Abstract ascending staircase of dark platforms with glowing orange edge light rising from left to right into darkness"
"gen web-portal.png 1024x1024|Glowing wireframe sphere portal made of thin orange latitude and longitude lines floating in dark space, volumetric glow at its core"
"gen growth-beam.png 1024x1024|Powerful thin beam of orange light projecting upward from a small point on the ground, expanding broadcast arcs rippling outward"
"gen data-pulse2.png 1024x1024|Columns of glowing orange light bars of different heights like a living bar chart, soft reflections on a dark floor"
"gen ai-synapse.png 1024x1024|Network of glowing orange nodes connected by thin light threads forming an abstract eye shape at the center of darkness"
"gen ops-assembly.png 1024x1024|Overhead abstract assembly line of dark square modules moving through glowing orange checkpoints on a dark conveyor"
"gen discover-contour.png 1344x768|Dark topographic contour map of thin grey lines with one single glowing orange route crossing the terrain toward a lit peak"
"gen connect-corridor.png 1344x768|Dark corridor with vertical glowing orange light seams receding into depth, one bright doorway of light at the far end"
"gen layers.png 1344x768|Exploded view of translucent dark glass layers stacked in space, connected by thin vertical orange light beams"
"gen remote-constellation.png 1024x1024|Scattered glowing orange nodes across a dark field of thin grid lines, connected into one bright constellation network"
"gen engine-core.png 1024x1024|Macro close-up of a dark mechanical engine core with glowing orange energy running between its dark metal gears"
)

printf '%s\n' "${CMDS[@]}" | xargs -P 2 -I{} bash -c 'IFS="|" read -r a b <<< "{}"; eval "$a" "$b"'
echo "ALL DONE"
