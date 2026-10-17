/**
 * ORBYT brand image set — "Ink & Ember" aesthetic.
 * Deep matte black + electric orange (#FD5A01), ember glow, premium 3D tech.
 * Generates 15 images into /public/images/showcase, /systems, /essays.
 */
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const ROOT = "/home/z/my-project/public/images";

const STYLE =
  "dark moody premium 3D render, deep matte black background, vivid electric orange (#FD5A01) glowing accents, ember light, cinematic rim lighting, volumetric glow, subtle haze, ultra detailed, high quality, futuristic tech aesthetic, no text, no letters, no watermark, no people, no logo";

const JOBS = [
  // ── Showcase gallery (home) ─────────────────────────────
  { out: "showcase/showcase-01.png", size: "1024x1024", prompt: `floating holographic analytics dashboard panels made of glowing orange wireframes and translucent glass, bar charts and line graphs made of light particles, suspended in dark space, ${STYLE}` },
  { out: "showcase/showcase-02.png", size: "768x1344", prompt: `vertical column of flowing luminous data particles streaming downward like a waterfall of orange embers, depth of field, ${STYLE}` },
  { out: "showcase/showcase-03.png", size: "1344x768", prompt: `vast 3D network of connected glowing nodes and lines, constellation-like mesh of orange light points on dark background, some nodes as glowing cubes, ${STYLE}` },
  { out: "showcase/showcase-04.png", size: "1024x1024", prompt: `abstract dark chrome torus rings orbiting a glowing orange sphere core, satellite rings tilted in space, polished metal with ember reflections, ${STYLE}` },
  { out: "showcase/showcase-05.png", size: "1344x768", prompt: `retro pixel art style scene of a small glowing orange pixel robot running across a dark checkered grid floor, neon scanlines, subtle orange fog, 16-bit aesthetic mixed with modern 3D lighting, ${STYLE}` },
  { out: "showcase/showcase-06.png", size: "1024x1024", prompt: `abstract artificial intelligence neural core, luminous orange branching synapses forming a sphere, electric energy tendrils radiating outward, dark void, ${STYLE}` },
  { out: "showcase/showcase-07.png", size: "1344x768", prompt: `3D automation pipeline of dark glass pipes and conveyor segments carrying glowing orange energy orbs, isometric composition, connected modular machinery, ${STYLE}` },
  { out: "showcase/showcase-08.png", size: "768x1344", prompt: `tall dark monolithic server obelisk with thin glowing orange light seams, floating in empty dark space with drifting embers, monumental minimal composition, ${STYLE}` },

  // ── System blueprints (/work) ───────────────────────────
  { out: "systems/acquisition.png", size: "1344x768", prompt: `thousands of glowing orange particles converging through a massive dark funnel structure into a single bright core point, motion streaks, sense of inflow and capture, wide cinematic composition, ${STYLE}` },
  { out: "systems/ai-ops.png", size: "1344x768", prompt: `glowing orange AI core sphere at center orbited by dark mechanical rings and satellite modules, precise clockwork-like machinery around a light heart, wide cinematic composition, ${STYLE}` },
  { out: "systems/connected-web.png", size: "1344x768", prompt: `isometric dark glass website interface grid floating above a reflective black surface, pages and blocks connected by glowing orange light lines, miniature world feel, wide cinematic composition, ${STYLE}` },

  // ── Essay covers (/insights) ────────────────────────────
  { out: "essays/ai-strategies-are-workflow-problems.png", size: "1344x768", prompt: `abstract tangled assembly line of dark geometric shapes being untangled and straightened by a beam of orange light, gears and conveyor fragments reorganizing, ${STYLE}` },
  { out: "essays/tracking-is-lying-to-you.png", size: "1344x768", prompt: `dark analytics gauges and dials with cracked glass faces, one needle glowing orange and bending toward truth, scattered measuring instruments in fog, mysterious mood, ${STYLE}` },
  { out: "essays/landing-page-is-a-system.png", size: "1344x768", prompt: `single dark landing page slab as a machine with visible glowing orange gears and pistons underneath, cross-section blueprint feel, floating in dark space, ${STYLE}` },
  { out: "essays/disconnected-tools-silent-tax.png", size: "1344x768", prompt: `row of dark isolated floating tool cubes with gaps between them, glowing orange energy leaking and dissipating between the gaps, melancholic cinematic mood, ${STYLE}` },
];

const CONCURRENCY = 4;

async function generate(zai, job, attempt = 1) {
  const outPath = path.join(ROOT, job.out);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10240) {
    console.log(`↷ skip (exists): ${job.out}`);
    return { ok: true, skipped: true };
  }
  try {
    const res = await zai.images.generations.create({
      prompt: job.prompt,
      size: job.size,
    });
    const b64 = res?.data?.[0]?.base64;
    if (!b64) throw new Error("empty base64");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
    console.log(`✓ ${job.out} (${job.size})`);
    return { ok: true };
  } catch (err) {
    if (attempt < 3) {
      console.log(`✗ retry ${attempt}/2: ${job.out} — ${err.message}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return generate(zai, job, attempt + 1);
    }
    console.error(`✗ FAILED ${job.out}: ${err.message}`);
    return { ok: false };
  }
}

async function main() {
  const zai = await ZAI.create();
  const queue = [...JOBS];
  const results = [];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const job = queue.shift();
        if (!job) break;
        results.push(await generate(zai, job));
      }
    })
  );
  const ok = results.filter((r) => r.ok).length;
  console.log(`\nDone: ${ok}/${JOBS.length} images`);
  process.exit(ok === JOBS.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
