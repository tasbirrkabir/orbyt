'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ArrowUp,
  Ban,
  Blocks,
  Check,
  Download,
  Grid3x3,
  HeartPulse,
  Menu,
  MoveHorizontal,
  Palette,
  Ruler,
  Square,
  Timer,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────
   Data
──────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Foundations', href: '#foundations' },
  { label: 'Color', href: '#color' },
  { label: 'Type', href: '#type' },
  { label: 'Logo', href: '#logo' },
  { label: 'Motion', href: '#motion' },
  { label: 'Components', href: '#components' },
] as const;

const FOUNDATIONS = [
  {
    icon: Grid3x3,
    title: 'Pixel precision',
    body: 'Everything snaps to the grid. Chunky pixels, square edges, no blur, no fudge.',
    token: 'grid/8px',
  },
  {
    icon: Palette,
    title: 'Flat & fearless color',
    body: 'One loud orange on honest neutrals. Flat blocks and hard shadows do the work — no decorative gradients.',
    token: 'fill/flat',
  },
  {
    icon: Zap,
    title: 'Forward motion',
    body: 'If it does not move the eye forward, cut it. Speed lines over scenery, always.',
    token: 'vel/max',
  },
  {
    icon: Blocks,
    title: 'Systematic play',
    body: 'Strict tokens, room to jam. Learn the rules first, then find the rhythm.',
    token: 'sys/play',
  },
] as const;

const SWATCHES = [
  { name: 'Orbyt Orange', hex: '#FD5A01', role: 'Primary — energy, action, key moments', light: false },
  { name: 'Charcoal', hex: '#1B1B1A', role: 'Ink — type, the runner, hard shadows', light: true },
  { name: 'Paper', hex: '#FAF7F2', role: 'Canvas — the page itself', light: true },
  { name: 'White', hex: '#FFFFFF', role: 'Surface — cards and panels', light: true },
  { name: 'Sand', hex: '#F1EBE1', role: 'Secondary — quiet fills and wells', light: true },
  { name: 'Ember Tint', hex: '#FF8A3D', role: 'Support — gradients, hover heat', light: true },
  { name: 'Ember Deep', hex: '#B44401', role: 'Support — pressed states, gradients', light: true },
  { name: 'Blush', hex: '#FFE3D1', role: 'Accent tint — soft highlights', light: true },
  { name: 'Smoke', hex: '#EFEADF', role: 'Neutral fill — code, tokens, dividers', light: true },
  { name: 'Ash', hex: '#6B6862', role: 'Muted — secondary text only', light: true },
] as const;

const USAGE_RATIO = [
  { label: 'Paper', pct: 60, hex: '#FAF7F2', text: '#1B1B1A' },
  { label: 'White', pct: 20, hex: '#FFFFFF', text: '#1B1B1A' },
  { label: 'Charcoal', pct: 12, hex: '#1B1B1A', text: '#FAF7F2' },
  { label: 'Orbyt Orange', pct: 8, hex: '#FD5A01', text: '#1B1B1A' },
] as const;

const TYPE_FAMILIES = [
  {
    name: 'Space Grotesk',
    role: 'Display',
    glyph: 'Aa',
    className: 'font-display',
    note: 'Headlines and big statements — geometric, sporty, a little retro.',
  },
  {
    name: 'Inter',
    role: 'Text',
    glyph: 'Aa',
    className: 'font-sans',
    note: 'UI and long-form copy — neutral, legible, never in the way.',
  },
  {
    name: 'Geist Mono',
    role: 'Mono',
    glyph: '01',
    className: 'font-mono',
    note: 'Eyebrows, labels, tokens and stats — the digital heartbeat.',
  },
] as const;

const TYPE_SCALE = [
  {
    token: 'display.xl',
    sample: 'Run forward',
    className: 'font-display text-5xl md:text-7xl font-bold tracking-tight',
  },
  {
    token: 'display.l',
    sample: 'Built to move',
    className: 'font-display text-4xl md:text-6xl font-bold tracking-tight',
  },
  {
    token: 'heading.1',
    sample: 'Pixel precision at pace',
    className: 'font-display text-3xl md:text-5xl font-bold tracking-tight',
  },
  {
    token: 'heading.2',
    sample: 'The system in practice',
    className: 'font-display text-2xl md:text-4xl font-semibold tracking-tight',
  },
  {
    token: 'heading.3',
    sample: 'Flat & fearless color',
    className: 'font-display text-xl md:text-2xl font-semibold',
  },
  {
    token: 'body.l',
    sample: 'Orbyt runs on pixel precision and relentless forward motion.',
    className: 'text-lg',
  },
  {
    token: 'body',
    sample: 'Every surface inherits the same tokens — no per-component theming.',
    className: 'text-base',
  },
  {
    token: 'label',
    sample: 'BRAND GUIDELINES · V1.0',
    className:
      'font-mono text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground',
  },
] as const;

const LOGO_TILES = [
  {
    ground: 'Paper',
    tileClass: 'bg-[#FAF7F2] border border-border',
    caption: 'on paper — the default canvas',
    captionClass: 'text-muted-foreground',
  },
  {
    ground: 'White',
    tileClass: 'bg-white border border-border',
    caption: 'on white — cards and surfaces',
    captionClass: 'text-muted-foreground',
  },
  {
    ground: 'Charcoal',
    tileClass: 'bg-[#1B1B1A]',
    caption: 'on charcoal — full inversion',
    captionClass: 'text-[#FAF7F2]/70',
  },
  {
    ground: 'Orange',
    tileClass: 'bg-[#FD5A01]',
    caption: 'on orange — canvas on canvas',
    captionClass: 'text-[#1B1B1A]/80',
  },
] as const;

const NEVER_RULES = [
  {
    token: 'never/outline',
    title: 'Never outline the runner',
    body: 'No strokes, no glows, no outer shadows on the artwork itself. The mark ships flat.',
  },
  {
    token: 'never/stretch',
    title: 'Never stretch it',
    body: 'Scale uniformly only. Skewed pixels read as a limp, not a run.',
  },
  {
    token: 'never/recolor',
    title: 'Never recolor the canvas',
    body: 'The orange is #FD5A01 — no themes, no seasonal editions, no exceptions.',
  },
] as const;

const MOTION_PRINCIPLES = [
  {
    icon: MoveHorizontal,
    token: 'animate-marquee',
    title: 'Marquee',
    body: 'Continuous flow. The brand never stops moving — loops must be seamless.',
  },
  {
    icon: Square,
    token: 'animate-blink',
    title: 'Blink',
    body: 'Pixel heartbeat. Stepped and digital — a cursor, not a fade.',
  },
  {
    icon: ArrowUp,
    token: 'animate-float',
    title: 'Float',
    body: 'Light lift. Small elements drift, big ones stay planted.',
  },
] as const;

const TODAY_STATS = [
  { label: 'Distance', value: '7.42', unit: 'km', icon: Activity },
  { label: 'Pace', value: '4:38', unit: '/km', icon: Timer },
  { label: 'Heart rate', value: '152', unit: 'bpm', icon: HeartPulse },
] as const;

const HISTORY_ROWS = [
  { day: 'Today', name: 'Tempo — river loop', km: '7.42' },
  { day: 'Yesterday', name: 'Easy — recovery jog', km: '5.10' },
  { day: 'Saturday', name: 'Long run — bridge 10K', km: '12.85' },
  { day: 'Friday', name: 'Intervals — 8 × 400m', km: '6.30' },
] as const;

const TEAMS_ROWS = [
  { rank: '01', name: 'Kite Collective', km: '284.6' },
  { rank: '02', name: 'Pixel Pacers', km: '261.2' },
  { rank: '03', name: 'Ember Run Club', km: '249.8' },
] as const;

const SPEED_ROWS = [
  {
    mode: 'step' as const,
    duration: '1.4s',
    height: 'h-1.5',
    bars: ['w-10 bg-foreground/25', 'w-28 bg-primary', 'w-12 bg-foreground/15', 'w-24 bg-foreground'],
  },
  {
    mode: 'marquee' as const,
    duration: '11s',
    height: 'h-2.5',
    bars: ['w-14 bg-foreground', 'w-24 bg-primary', 'w-8 bg-foreground/20', 'w-16 bg-ember-tint'],
  },
  {
    mode: 'marquee' as const,
    duration: '17s',
    height: 'h-2',
    bars: ['w-12 bg-foreground/25', 'w-28 bg-ember-deep', 'w-10 bg-foreground/15', 'w-20 bg-foreground'],
  },
] as const;

/* ────────────────────────────────────────────────────────────
   Shared primitives
──────────────────────────────────────────────────────────── */

function useReduced() {
  return useReducedMotion() === true;
}

function FadeUp({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduced = useReduced();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReduced();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Section({
  id,
  index,
  eyebrow,
  title,
  lede,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {index} · {eyebrow}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">{lede}</p>
        </Reveal>
        <div className="mt-10 md:mt-14">{children}</div>
      </div>
    </section>
  );
}

/** Seamless marquee: content rendered twice, track translates -50%. */
function MarqueeTrack({
  duration,
  children,
  step = false,
  className,
}: {
  duration: string;
  children: React.ReactNode;
  step?: boolean;
  className?: string;
}) {
  const reduced = useReduced();
  return (
    <div className={cn('min-w-0 max-w-full overflow-hidden', className)} aria-hidden="true">
      <div
        className={cn(
          'flex w-max items-center',
          !reduced && (step ? 'animate-step-run' : 'animate-marquee')
        )}
        style={{ '--marquee-duration': duration } as React.CSSProperties}
      >
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeedRow({
  duration,
  bars,
  height,
  mode,
}: {
  duration: string;
  bars: readonly string[];
  height: string;
  mode: 'marquee' | 'step';
}) {
  return (
    <MarqueeTrack duration={duration} step={mode === 'step'}>
      {Array.from({ length: 5 }).map((_, group) => (
        <div key={group} className="flex items-center gap-3 pr-3">
          {bars.map((bar, i) => (
            <span key={i} className={cn('shrink-0 rounded-full', height, bar)} />
          ))}
        </div>
      ))}
    </MarqueeTrack>
  );
}

function notify(title: string, description: string) {
  toast({ title, description });
}

/* ────────────────────────────────────────────────────────────
   Header
──────────────────────────────────────────────────────────── */

function Header() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex min-h-11 items-center gap-2.5 rounded-lg pr-2"
          aria-label="Orbyt — back to top"
        >
          <Image
            src="/orbyt-mark.png"
            alt="Orbyt logo — charcoal pixel runner on flat orange"
            width={256}
            height={285}
            priority
            className="h-[34px] w-auto rounded-md"
          />
          <span className="font-display text-xl font-bold lowercase tracking-tight">orbyt</span>
          <Badge
            variant="secondary"
            className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.16em] md:inline-flex"
          >
            Brand System v1.0
          </Badge>
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-11 items-center rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            className="hidden h-11 px-5 sm:inline-flex"
            onClick={() =>
              notify(
                'Brand kit requested',
                'Logo, tokens and wallpapers are packed and ready. Check your downloads.'
              )
            }
          >
            Get the kit
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  <Image
                    src="/orbyt-mark.png"
                    alt=""
                    width={256}
                    height={285}
                    className="h-8 w-auto rounded-md"
                  />
                  <span className="font-display text-lg font-bold lowercase tracking-tight">
                    orbyt
                  </span>
                </SheetTitle>
                <SheetDescription className="font-mono text-xs uppercase tracking-[0.2em]">
                  Brand System v1.0
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile sections" className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center rounded-lg px-3 text-base font-medium transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </a>
                ))}
                <Button
                  className="mt-4 h-12 w-full"
                  onClick={() => {
                    setOpen(false);
                    notify(
                      'Brand kit requested',
                      'Logo, tokens and wallpapers are packed and ready. Check your downloads.'
                    );
                  }}
                >
                  Get the kit
                </Button>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Flat Ember · Paper #FAF7F2 · Orange #FD5A01
                </p>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────
   Hero
──────────────────────────────────────────────────────────── */

function Hero() {
  const reduced = useReduced();

  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[92svh] flex-col overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {/* Copy */}
        <div className="max-w-xl">
          <FadeUp>
            <p className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Brand Guidelines · v1.0
              <span
                aria-hidden="true"
                className={cn('inline-block h-3.5 w-1.5 rounded-[2px] bg-primary', !reduced && 'animate-blink')}
              />
            </p>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1
              id="hero-title"
              className="mt-5 font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl xl:text-8xl"
            >
              Run <span className="text-primary">forward.</span>
              <span
                aria-hidden="true"
                className={cn(
                  'ml-3 inline-block h-[0.62em] w-[0.16em] translate-y-[0.05em] rounded-[3px] bg-primary',
                  !reduced && 'animate-blink'
                )}
              />
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              A brand built on pixel precision and relentless forward motion — one flat orange
              canvas, one charcoal runner, zero fluff.
            </p>
          </FadeUp>

          <FadeUp delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <a href="#color">
                  Explore the system
                  <ArrowRight className="ml-1 size-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-6 text-base"
                onClick={() =>
                  notify(
                    'Asset pack queued',
                    'The official logo, tokens and wallpapers will download shortly.'
                  )
                }
              >
                <Download className="mr-1 size-4" />
                Download assets
              </Button>
            </div>
          </FadeUp>

          <FadeUp delay={0.32}>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              canvas #FD5A01 · ink #1B1B1A · grid 8px · runner ×1
            </p>
          </FadeUp>
        </div>

        {/* Poster composition: logo tile + speed lines */}
        <FadeUp delay={0.15} className="relative">
          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-8 -mx-4 flex flex-col justify-between gap-4 sm:-mx-8"
            >
              {SPEED_ROWS.map((row, i) => (
                <SpeedRow
                  key={i}
                  duration={row.duration}
                  bars={row.bars}
                  height={row.height}
                  mode={row.mode}
                />
              ))}
            </div>

            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 mx-auto w-56 sm:w-64 md:w-80"
            >
              <div className={cn(!reduced && 'animate-float')}>
                <div className="shadow-pixel overflow-hidden rounded-2xl">
                  <Image
                    src="/orbyt-logo.png"
                    alt="Official Orbyt logo — charcoal pixel-art runner with speed lines on a flat orange canvas"
                    width={1189}
                    height={1323}
                    priority
                    sizes="(min-width: 768px) 320px, 224px"
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </motion.div>

            <div
              className={cn(
                'absolute left-0 top-6 z-20 rounded-lg border bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground shadow-sm',
                !reduced && 'animate-float'
              )}
              style={{ animationDelay: '-2.5s' }}
            >
              canvas #fd5a01
            </div>
            <div
              className={cn(
                'absolute bottom-10 right-0 z-20 rounded-lg bg-foreground px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background shadow-pixel-orange',
                !reduced && 'animate-float'
              )}
              style={{ animationDelay: '-4.5s' }}
            >
              ink #1b1b1a
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Orange marquee strip */}
      <div className="border-y border-foreground/15 bg-primary">
        <MarqueeTrack duration="24s" className="py-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="whitespace-nowrap px-4 font-mono text-sm font-bold uppercase tracking-[0.3em] text-[#1B1B1A]"
            >
              Run · Build · Repeat ·
            </span>
          ))}
        </MarqueeTrack>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   01 · Foundations
──────────────────────────────────────────────────────────── */

function Foundations() {
  return (
    <Section
      id="foundations"
      index="01"
      eyebrow="Foundations"
      title="Four rules of the run."
      lede="Every Orbyt surface follows the same four principles — the rest is repetition."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {FOUNDATIONS.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08}>
            <Card className="h-full transition-transform hover:-translate-y-1 hover:shadow-pixel">
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle className="font-display text-lg">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{item.body}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {item.token}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   02 · Color
──────────────────────────────────────────────────────────── */

function ColorSection() {
  return (
    <Section
      id="color"
      index="02"
      eyebrow="The palette"
      title="The Flat Ember spectrum."
      lede="Ten colors, one job: make the orange impossible to miss."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
        {SWATCHES.map((swatch, i) => (
          <Reveal key={swatch.hex} delay={(i % 5) * 0.06}>
            <div className="h-full overflow-hidden rounded-xl border bg-card transition-transform hover:-translate-y-1 hover:shadow-pixel-orange">
              <div
                className={cn('h-24 w-full', swatch.light && 'border-b border-border/60')}
                style={{ backgroundColor: swatch.hex }}
                aria-hidden="true"
              />
              <div className="p-4">
                <p className="font-display text-sm font-bold">{swatch.name}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{swatch.hex}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{swatch.role}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Usage ratio */}
        <Reveal>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display text-xl">Usage ratio</CardTitle>
              <CardDescription>
                Mostly quiet, occasionally loud. Orange is seasoning, not sauce.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div
                className="flex h-14 w-full overflow-hidden rounded-xl border"
                role="img"
                aria-label="Usage ratio: Paper 60 percent, White 20 percent, Charcoal 12 percent, Orbyt Orange 8 percent"
              >
                {USAGE_RATIO.map((seg) => (
                  <div
                    key={seg.label}
                    className="flex items-center justify-center border-l border-foreground/10 first:border-l-0"
                    style={{ backgroundColor: seg.hex, color: seg.text, width: `${seg.pct}%` }}
                  >
                    <span className="hidden font-mono text-xs font-bold md:inline">
                      {seg.pct}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {USAGE_RATIO.map((seg) => (
                  <span key={seg.label} className="flex items-center gap-2 text-sm">
                    <span
                      className="size-3.5 rounded-[4px] border border-foreground/10"
                      style={{ backgroundColor: seg.hex }}
                      aria-hidden="true"
                    />
                    <span className="font-medium">{seg.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">{seg.pct}%</span>
                  </span>
                ))}
              </div>
              <p className="rounded-lg bg-smoke px-4 py-3 font-mono text-xs leading-relaxed">
                orange — 8% · <span className="font-bold text-ember-deep">5–10%: spend it loud.</span>{' '}
                never more, never less.
              </p>
            </CardContent>
          </Card>
        </Reveal>

        {/* Accessibility */}
        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display text-xl">Accessibility</CardTitle>
              <CardDescription>Checked pairs — the rules are short on purpose.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm">
                  <span className="font-semibold">Charcoal on Paper — 16.1:1</span>
                  <span className="block text-muted-foreground">AAA. Body text everywhere.</span>
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm">
                  <span className="font-semibold">Charcoal on Orange — 5.4:1</span>
                  <span className="block text-muted-foreground">
                    AA at every size — keep it bold for poster energy, like the mark.
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Ban className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                <p className="text-sm">
                  <span className="font-semibold">White on Orange — 3.2:1</span>
                  <span className="block text-muted-foreground">
                    Fails AA. Never white body text on orange — always Charcoal.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   03 · Type
──────────────────────────────────────────────────────────── */

function TypeSection() {
  return (
    <Section
      id="type"
      index="03"
      eyebrow="Typography"
      title={
        <>
          Type that keeps <span className="text-gradient-brand">pace.</span>
        </>
      }
      lede="A provisional three-font pairing — Space Grotesk shouts, Inter works, Geist Mono counts. Final spec pending."
    >
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {TYPE_FAMILIES.map((family, i) => (
          <Reveal key={family.name} delay={i * 0.08}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <span className={cn('text-7xl font-bold tracking-tight', family.className)}>
                    {family.glyph}
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-[0.18em]">
                    {family.role}
                  </Badge>
                </div>
                <CardTitle className="font-display text-lg">{family.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{family.note}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={cn('text-sm text-muted-foreground', family.className)}>
                  The quick brown fox runs 26.2 miles.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="font-display text-xl">Fluid type scale</CardTitle>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                type.scale -- fixed steps · provisional
              </p>
            </div>
            <CardDescription>
              Eight tokens cover every surface. Sizes are clamped and fluid — swap pending the
              official type spec.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              {TYPE_SCALE.map((row, i) => (
                <div key={row.token}>
                  {i > 0 && <Separator />}
                  <div className="flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:gap-8">
                    <span className="w-32 shrink-0 font-mono text-xs font-semibold text-primary">
                      {row.token}
                    </span>
                    <span className={cn('break-words', row.className)}>{row.sample}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   04 · Logo
──────────────────────────────────────────────────────────── */

function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('w-32 overflow-hidden rounded-xl md:w-40', className)}>
      <Image
        src="/orbyt-logo.png"
        alt="Orbyt logo — charcoal pixel-art runner on flat orange"
        width={1189}
        height={1323}
        className="h-auto w-full"
      />
    </div>
  );
}

function LogoSection() {
  return (
    <Section
      id="logo"
      index="04"
      eyebrow="The mark"
      title="The Runner."
      lede="One charcoal pixel runner, three speed lines, one flat orange canvas. Nothing else ships."
    >
      {/* Placement tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {LOGO_TILES.map((tile, i) => (
          <Reveal key={tile.ground} delay={(i % 2) * 0.08}>
            <div
              className={cn(
                'flex aspect-[4/3] flex-col items-center justify-center gap-6 rounded-2xl p-8',
                tile.tileClass
              )}
            >
              <LogoMark />
              <p
                className={cn(
                  'font-mono text-[11px] uppercase tracking-[0.25em]',
                  tile.captionClass
                )}
              >
                {tile.caption}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Pixel anatomy */}
        <Reveal>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display text-xl">Pixel anatomy</CardTitle>
              <CardDescription>Three parts. That is the whole mark.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="grid w-14 shrink-0 grid-cols-3 gap-[2px]" aria-hidden="true">
                  {Array.from({ length: 9 }).map((_, cell) => (
                    <span
                      key={cell}
                      className={cn(
                        'h-3.5 w-3.5 rounded-[2px]',
                        [2, 4, 5, 6, 8].includes(cell) ? 'bg-foreground' : 'bg-transparent'
                      )}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em]">runner</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The hero. Drawn on a strict pixel grid — edges stay square.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <div className="flex w-14 shrink-0 flex-col gap-1.5" aria-hidden="true">
                  <span className="h-1.5 w-8 rounded-full bg-foreground" />
                  <span className="h-1.5 w-12 rounded-full bg-foreground" />
                  <span className="h-1.5 w-10 rounded-full bg-foreground" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
                    speed_lines
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Three trailing blocks. Always horizontal, always behind.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <span className="h-10 w-14 shrink-0 rounded-lg bg-[#FD5A01]" aria-hidden="true" />
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em]">canvas</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    One flat field of Orbyt Orange #FD5A01. The stage — not a decoration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* Clear space & min size */}
        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Ruler className="size-4 text-primary" aria-hidden="true" />
                Clear space & min size
              </CardTitle>
              <CardDescription>
                Keep one pixel-block of clear space on every side. Minimum size: 32px digital,
                12mm print.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center rounded-xl bg-smoke p-6">
                <div className="rounded-xl border-2 border-dashed border-primary/70 p-4">
                  <LogoMark className="w-20" />
                </div>
              </div>
              <div className="flex items-end justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <LogoMark className="w-8" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    32px — min
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <LogoMark className="w-16" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    64px — comfy
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <LogoMark className="w-28" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    hero — loud
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      {/* Never rules */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {NEVER_RULES.map((rule, i) => (
          <Reveal key={rule.token} delay={i * 0.08}>
            <div className="flex h-full flex-col gap-3 rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <Ban className="size-5 text-destructive" aria-hidden="true" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {rule.token}
                </span>
              </div>
              <p className="font-display font-bold">{rule.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{rule.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   05 · Motion
──────────────────────────────────────────────────────────── */

function MotionSection() {
  const reduced = useReduced();

  return (
    <Section
      id="motion"
      index="05"
      eyebrow="Motion"
      title="Motion is the message."
      lede="Three moves, all mechanical, all flat — the marquee flows, the cursor blinks, the mark floats."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {MOTION_PRINCIPLES.map((item, i) => (
            <Reveal key={item.token} delay={i * 0.08}>
              <div className="flex items-start gap-4 rounded-xl border bg-card p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-display font-bold">{item.title}</p>
                    <code className="rounded bg-smoke px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {item.token}
                    </code>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display text-xl">Live demo</CardTitle>
              <CardDescription>The same three tokens, running right now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* marquee */}
              <div className="space-y-2">
                <div className="rounded-lg border bg-secondary py-2.5">
                  <MarqueeTrack duration="14s">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span
                        key={i}
                        className="whitespace-nowrap px-4 font-mono text-xs font-bold uppercase tracking-[0.25em]"
                      >
                        forward · always ·
                      </span>
                    ))}
                  </MarqueeTrack>
                </div>
                <p className="text-right font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  animate-marquee · --marquee-duration: 14s
                </p>
              </div>

              <Separator />

              {/* blink */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg border bg-secondary px-4 py-3">
                  <span className="font-mono text-sm font-bold uppercase tracking-[0.2em]">
                    run&gt;&gt;&gt;
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'inline-block h-6 w-3 rounded-[3px] bg-primary',
                      !reduced && 'animate-blink'
                    )}
                  />
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    loading pace…
                  </span>
                </div>
                <p className="text-right font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  animate-blink · steps(2, start)
                </p>
              </div>

              <Separator />

              {/* float */}
              <div className="space-y-2">
                <div className="flex h-20 items-center justify-center rounded-lg border bg-secondary">
                  <Badge
                    className={cn(
                      'px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] shadow-pixel-orange',
                      !reduced && 'animate-float'
                    )}
                  >
                    in motion
                  </Badge>
                </div>
                <p className="text-right font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  animate-float · 7s ease-in-out
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   06 · Components
──────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border p-3 md:p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <p className="mt-2 font-mono text-xl font-bold tracking-tight md:text-2xl">
        {value}
        <span className="ml-1 text-[10px] font-medium text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function RunTracker() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-display text-xl">Orbyt Run Tracker</CardTitle>
        <CardDescription>
          Real shadcn/ui parts wearing the Flat Ember tokens — no per-component theming, ever.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            notify(
              'Run logged',
              '7.42 km at 4:38 /km — streak extended to 12 days.'
            );
          }}
        >
          <Label htmlFor="run-input" className="sr-only">
            Log a run
          </Label>
          <Input
            id="run-input"
            placeholder="Log today's run — e.g. 7.42 km easy"
            className="h-11 flex-1"
          />
          <Button type="submit" className="h-11 px-5">
            Log it
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Badge>PR</Badge>
          <Badge variant="secondary" className="font-mono text-[11px] tracking-wider">
            PACE 4:38/KM
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px] tracking-wider">
            RECOVERY
          </Badge>
          <Badge variant="destructive" className="font-mono text-[11px] tracking-wider">
            REDLINE
          </Badge>
        </div>

        <Tabs defaultValue="today">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today" className="h-10">
              Today
            </TabsTrigger>
            <TabsTrigger value="history" className="h-10">
              History
            </TabsTrigger>
            <TabsTrigger value="teams" className="h-10">
              Teams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {TODAY_STATS.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  unit={stat.unit}
                  icon={stat.icon}
                />
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Weekly goal</span>
                <span className="font-mono text-xs text-muted-foreground">42 / 60 km</span>
              </div>
              <Progress value={68} className="h-2.5" aria-label="Weekly goal 68 percent" />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div>
              {HISTORY_ROWS.map((row, i) => (
                <div key={row.name}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {row.day}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-bold">{row.km} km</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" aria-hidden="true" />
              4 crews on the board this week
            </div>
            <div>
              {TEAMS_ROWS.map((team, i) => (
                <div key={team.rank}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center gap-3 py-3">
                    <span className="font-mono text-sm font-bold text-primary">{team.rank}</span>
                    <span className="flex-1 truncate text-sm font-medium">{team.name}</span>
                    <Trophy
                      className={cn('size-4', i === 0 ? 'text-primary' : 'text-muted-foreground/40')}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-sm font-bold">{team.km} km</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {['KT', 'PX', 'ER'].map((initials) => (
                <Avatar key={initials} className="size-8 ring-2 ring-card">
                  <AvatarFallback className="bg-secondary font-mono text-[10px] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div>
              <Label htmlFor="share-live" className="text-sm font-medium">
                Share live with crew
              </Label>
              <p className="text-xs text-muted-foreground">Pace and heart rate, in real time.</p>
            </div>
          </div>
          <Switch id="share-live" defaultChecked aria-label="Share live with crew" />
        </div>
      </CardContent>
    </Card>
  );
}

function PartsShowcase() {
  return (
    <div className="flex h-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Buttons</CardTitle>
          <CardDescription>One orange, five support acts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Button>Log a run</Button>
            <Button variant="secondary">Pace splits</Button>
            <Button variant="outline">
              <Download className="mr-1 size-4" />
              Download GPX
            </Button>
            <Button variant="ghost">Skip</Button>
            <Button variant="destructive">Discard</Button>
            <Button variant="link">View history</Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" className="h-9">
              Small
            </Button>
            <Button size="lg" className="h-12 px-7">
              Large
            </Button>
            <Button size="icon" className="size-11" aria-label="Continue">
              <ArrowRight className="size-4" />
            </Button>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              h-9 · h-10 · h-12
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="font-display text-xl">Badges & tokens</CardTitle>
          <CardDescription>Labels stay mono. Numbers stay mono. Always.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline" className="font-mono text-[11px] tracking-wider">
              OUTLINE
            </Badge>
          </div>
          <div className="rounded-xl bg-smoke p-4 font-mono text-xs leading-relaxed text-foreground/80">
            <p>--primary: #FD5A01;</p>
            <p>--primary-foreground: #1B1B1A;</p>
            <p>--radius: 0.75rem;</p>
            <p>--font-display: &apos;Space Grotesk&apos;;</p>
            <p>--shadow-pixel: 6px 6px 0 #1B1B1A;</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComponentsSection() {
  return (
    <Section
      id="components"
      index="06"
      eyebrow="System"
      title="The system in practice."
      lede="A working product panel — every control below inherits the same tokens you just met."
    >
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <RunTracker />
        </Reveal>
        <Reveal delay={0.1}>
          <PartsShowcase />
        </Reveal>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   Footer
──────────────────────────────────────────────────────────── */

const FOOTER_LINKS = [
  { label: 'Guidelines PDF', message: 'Coming soon', description: 'The printable guide ships with Orbyt v1.1.' },
  { label: 'Asset pack', message: 'Coming soon', description: 'Logo, tokens and wallpapers — packed for v1.1.' },
  { label: 'Changelog', message: 'Coming soon', description: 'Version history lands with the next release.' },
  { label: 'Contact', message: 'Coming soon', description: 'A crew inbox is on the way. Stay in motion.' },
] as const;

function Footer() {
  return (
    <footer className="mt-auto">
      <div className="h-1.5 w-full bg-primary" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-4 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-12 sm:px-6 md:pt-16 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Image
                src="/orbyt-mark.png"
                alt="Orbyt logo — charcoal pixel runner on flat orange"
                width={256}
                height={285}
                className="h-9 w-auto rounded-md"
              />
              <span className="font-display text-xl font-bold lowercase tracking-tight">orbyt</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Bold flat color. Pixel precision. Always in motion — that is the whole brand.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-1 sm:gap-x-16">
            {FOOTER_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => notify(link.message, link.description)}
                className="flex h-11 items-center justify-start text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © 2025 Orbyt Studio — Always in motion
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Flat Ember theme v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
──────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Hero />
        <Foundations />
        <ColorSection />
        <TypeSection />
        <LogoSection />
        <MotionSection />
        <ComponentsSection />
      </main>
      <Footer />
    </div>
  );
}
