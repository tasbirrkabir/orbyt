'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  Download,
  Flame,
  Menu,
  Moon,
  Orbit,
  Rocket,
  Ruler,
  Satellite,
  ShieldCheck,
  Sparkles,
  Timer,
  Type as TypeIcon,
  Waves,
  X,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
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

const KIT_TOAST = {
  title: 'Brand kit requested',
  description: 'orbyt-brand-kit-v1.0 — tokens, marks, and type specimens are queued for delivery.',
} as const;

const ASSETS_TOAST = {
  title: 'Preparing assets',
  description:
    'orbyt-brand-kit-v1.0.zip — logos, tokens & type specimens. Demo build: the download is stubbed.',
} as const;

const PRINCIPLES = [
  {
    icon: Orbit,
    title: 'Orbital geometry',
    copy: 'Layouts, loaders, and micro-interactions move along arcs. Circles and ellipses are the native shapes of the system.',
  },
  {
    icon: Flame,
    title: 'Ember warmth',
    copy: 'One incandescent accent carries the brand. Ember is spent deliberately — on CTAs, focus, and moments of ignition.',
  },
  {
    icon: TypeIcon,
    title: 'Precise type',
    copy: 'Space Grotesk sets direction, Inter sets detail. A fixed scale keeps every voice at the right altitude.',
  },
  {
    icon: Moon,
    title: 'Deep space canvas',
    copy: 'Void and Nebula surfaces give light somewhere to land. Contrast stays generous; darkness is never muddy.',
  },
] as const;

const SWATCHES = [
  { name: 'Void', hex: '#0B0A08', role: 'Canvas' },
  { name: 'Nebula', hex: '#14120D', role: 'Surface' },
  { name: 'Ash', hex: '#211D15', role: 'Elevated surface' },
  { name: 'Starlight', hex: '#F2EEE6', role: 'Primary text' },
  { name: 'Ember', hex: '#FF7A1A', role: 'Primary accent' },
  { name: 'Flare', hex: '#FFB25C', role: 'Highlight' },
  { name: 'Gold', hex: '#E8C468', role: 'Detail · data' },
  { name: 'Sage', hex: '#9BAF7E', role: 'Positive · support' },
  { name: 'Terra', hex: '#D96C4F', role: 'Warm secondary' },
] as const;

const USAGE_RATIO = [
  { name: 'Void', detail: 'canvas', pct: 60, hex: '#0B0A08' },
  { name: 'Nebula / Ash', detail: 'surfaces', pct: 25, hex: '#14120D' },
  { name: 'Starlight', detail: 'text', pct: 10, hex: '#F2EEE6' },
  { name: 'Ember', detail: 'accents', pct: 5, hex: '#FF7A1A' },
] as const;

const TYPE_SCALE = [
  {
    token: 'display / 64',
    className: 'font-display text-[clamp(2.75rem,7vw,4rem)] leading-none tracking-tight',
    sample: 'Precision in orbit',
  },
  {
    token: 'h1 / 48',
    className: 'font-display text-[clamp(2.25rem,5.5vw,3rem)] leading-tight tracking-tight',
    sample: 'Precision in orbit',
  },
  {
    token: 'h2 / 36',
    className: 'font-display text-[clamp(1.75rem,4.5vw,2.25rem)] leading-tight tracking-tight',
    sample: 'Precision in orbit',
  },
  {
    token: 'h3 / 28',
    className: 'font-display text-[clamp(1.5rem,3.5vw,1.75rem)] leading-snug',
    sample: 'Precision in orbit',
  },
  {
    token: 'body / 16',
    className: 'font-sans text-base leading-relaxed',
    sample: 'Orbyt pairs exact geometry with the warmth of ember light.',
  },
  {
    token: 'caption / 13',
    className: 'font-sans text-[13px] text-muted-foreground',
    sample: 'Metadata and supporting detail, always secondary.',
  },
  {
    token: 'mono / 14',
    className: 'font-mono text-sm text-flare',
    sample: 'orbital.duration = 30s',
  },
] as const;

const LOGO_TILES = [
  { bg: '#0B0A08', color: '#F2EEE6', label: 'On Void — primary' },
  { bg: '#14120D', color: '#F2EEE6', label: 'On Nebula — surfaces' },
  { bg: '#F2EEE6', color: '#1A0E04', label: 'On Starlight — print' },
  { bg: '#FF7A1A', color: '#1A0E04', label: 'On Ember — campaigns' },
] as const;

const LOGO_DONT = [
  'Never rotate or tilt the ring — it holds its −18° inclination.',
  'Never recolor the planet — the ember gradient is fixed.',
  'Never add outlines, shadows, or glows beyond the system itself.',
] as const;

const MOTION_PRINCIPLES = [
  {
    icon: Orbit,
    title: 'Orbital, never linear',
    copy: 'Elements travel arcs and closed loops. Nothing teleports; everything keeps its path.',
  },
  {
    icon: Timer,
    title: 'Two clocks',
    copy: 'Interface answers in 300ms. Celestial bodies take 30s — the system breathes on both scales.',
  },
  {
    icon: Waves,
    title: 'Ease in-out only',
    copy: 'Accelerate gently, settle gently. No bounce, no overshoot — motion obeys gravity, not springs.',
  },
] as const;

const TELEMETRY = [
  { label: 'Delta-v', value: '0.42 km/s' },
  { label: 'Signal', value: '98.7%' },
  { label: 'Core temp', value: '1,920 K' },
] as const;

const CREW = [
  {
    initials: 'AK',
    name: 'A. Kestrel',
    role: 'Flight lead',
    status: 'On duty',
    tone: 'bg-primary/15 text-flare',
  },
  {
    initials: 'JS',
    name: 'J. Solaris',
    role: 'Comms',
    status: 'On duty',
    tone: 'bg-gold/15 text-gold',
  },
  {
    initials: 'MV',
    name: 'M. Vela',
    role: 'Payload',
    status: 'Rest',
    tone: 'bg-sage/15 text-sage',
  },
] as const;

const STATION_AVATARS = [
  { initials: 'AK', tone: 'bg-primary/20 text-flare' },
  { initials: 'JS', tone: 'bg-gold/20 text-gold' },
  { initials: '+4', tone: 'bg-sage/20 text-sage' },
] as const;

const ORBIT_RINGS = [
  { size: '100%', duration: '46s', reverse: false, dot: 'bg-flare', glow: 'shadow-[0_0_12px_rgba(255,178,92,0.9)]', dotSize: 'size-2.5' },
  { size: '73%', duration: '30s', reverse: true, dot: 'bg-gold', glow: 'shadow-[0_0_10px_rgba(232,196,104,0.9)]', dotSize: 'size-2' },
  { size: '47%', duration: '17s', reverse: false, dot: 'bg-primary', glow: 'shadow-[0_0_10px_rgba(255,122,26,0.9)]', dotSize: 'size-2' },
] as const;

const STARS = [
  { top: '6%', left: '20%', size: 'size-1', delay: '0s' },
  { top: '14%', left: '70%', size: 'size-1.5', delay: '0.8s' },
  { top: '32%', left: '92%', size: 'size-1', delay: '1.6s' },
  { top: '68%', left: '6%', size: 'size-1.5', delay: '0.4s' },
  { top: '88%', left: '38%', size: 'size-1', delay: '2.1s' },
  { top: '80%', left: '84%', size: 'size-1.5', delay: '1.2s' },
  { top: '44%', left: '3%', size: 'size-1', delay: '2.6s' },
  { top: '52%', left: '97%', size: 'size-1', delay: '0.2s' },
] as const;

/* ────────────────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────────────────── */

function orbitStyle(duration: string): React.CSSProperties {
  return { '--orbit-duration': duration } as React.CSSProperties;
}

/** Inline brand mark — same geometry as /orbyt-mark.svg; ring + satellite use currentColor. */
function OrbytMark({ className }: { className?: string }) {
  const uid = React.useId().replace(/[^a-zA-Z0-9-]/g, '');
  const gradientId = `orbyt-planet-${uid}`;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={gradientId} cx="36%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#FFD9A8" />
          <stop offset="38%" stopColor="#FFB25C" />
          <stop offset="72%" stopColor="#FF7A1A" />
          <stop offset="100%" stopColor="#B34200" />
        </radialGradient>
      </defs>
      <g transform="rotate(-18 32 32)">
        <ellipse
          cx="32"
          cy="32"
          rx="30"
          ry="12"
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="2.5"
        />
        <circle cx="59.2" cy="26.9" r="3" fill="currentColor" />
      </g>
      <circle cx="32" cy="32" r="13" fill={`url(#${gradientId})`} />
      <ellipse
        cx="27.5"
        cy="26.5"
        rx="4.6"
        ry="2.6"
        transform="rotate(-28 27.5 26.5)"
        fill="#FFF6E8"
        opacity="0.45"
      />
      <g transform="rotate(-18 32 32)">
        <path
          d="M 2 32 A 30 12 0 0 1 62 32"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** On-load, staggered fade-up (hero). */
function FadeUp({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-into-view fade-up; plays once. */
function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/** Consistent section shell: numbered mono eyebrow + display heading + muted lede. */
function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-flare">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </Reveal>
        <div className="mt-10 md:mt-14">{children}</div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Orbital system (hero visual)
──────────────────────────────────────────────────────────── */

function OrbitalSystem({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className={cn('relative aspect-square w-full', className)} aria-hidden="true">
      {STARS.map((star, i) => (
        <span
          key={i}
          className={cn(
            'absolute rounded-full bg-[#FFF6E8]/70',
            star.size,
            !reduced && 'animate-twinkle'
          )}
          style={{ top: star.top, left: star.left, animationDelay: star.delay }}
        />
      ))}

      {ORBIT_RINGS.map((ring, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: ring.size, height: ring.size }}
        >
          <div
            className={cn(
              'absolute inset-0 rounded-full border border-foreground/10',
              !reduced && (ring.reverse ? 'animate-orbit-reverse' : 'animate-orbit')
            )}
            style={orbitStyle(ring.duration)}
          >
            <span
              className={cn(
                'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full',
                ring.dot,
                ring.dotSize,
                ring.glow
              )}
            />
          </div>
        </div>
      ))}

      <div
        className={cn(
          'absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-2xl md:size-28',
          !reduced && 'animate-pulse-glow'
        )}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <OrbytMark className="size-20 text-foreground drop-shadow-[0_0_18px_rgba(255,122,26,0.5)] md:size-24" />
      </div>

      <div className="absolute -right-2 top-10 hidden animate-float rounded-md border border-border bg-card/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur lg:block">
        30s · celestial
      </div>
      <div
        className="absolute -left-2 bottom-12 hidden animate-float rounded-md border border-border bg-card/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur lg:block"
        style={{ animationDelay: '1.6s' }}
      >
        300ms · interface
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Header
──────────────────────────────────────────────────────────── */

function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const handleKit = () => toast(KIT_TOAST);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex min-h-[44px] items-center gap-2.5 rounded-lg"
          aria-label="Orbyt — back to top"
        >
          <OrbytMark className="size-7 text-foreground" />
          <span className="font-display text-lg font-medium lowercase tracking-tight">orbyt</span>
          <Badge
            variant="secondary"
            className="ml-1 hidden font-mono text-[10px] uppercase tracking-wider sm:inline-flex"
          >
            Brand System v1.0
          </Badge>
        </a>

        <nav aria-label="Primary" className="hidden items-center md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-11 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button size="lg" className="hidden h-11 px-5 sm:inline-flex" onClick={handleKit}>
            Get the kit
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-border bg-background/95 backdrop-blur-xl">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-display lowercase">
                  <OrbytMark className="size-5 text-foreground" />
                  orbyt
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Orbyt brand system navigation
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center rounded-lg px-3 font-display text-base text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <Button
                className="mt-4 h-11 w-full"
                onClick={() => {
                  setOpen(false);
                  handleKit();
                }}
              >
                Get the kit
              </Button>
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
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[92svh] items-center overflow-hidden"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/orbyt-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.55]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/35 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_42%,transparent_0%,rgba(11,10,8,0.55)_100%)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 pb-20 pt-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-14 lg:pt-14 lg:px-8">
        <div className="relative z-10 max-w-2xl">
          <FadeUp>
            <Badge
              variant="outline"
              className="border-flare/30 bg-primary/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-flare"
            >
              <Sparkles className="size-3" aria-hidden="true" />
              Brand Guidelines · v1.0
            </Badge>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1
              id="hero-heading"
              className="mt-6 font-display text-5xl font-medium leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
            >
              One brand in <span className="text-gradient-brand">orbit</span>.
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="mt-6 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
              Orbyt is a design language of precise typography, orbital geometry, and ember
              warmth — built for products that move with quiet confidence.
            </p>
          </FadeUp>

          <FadeUp delay={0.24}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <a href="#color">
                  Explore the system
                  <ArrowDown className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-7 text-base"
                onClick={() => toast(ASSETS_TOAST)}
              >
                <Download className="size-4" aria-hidden="true" />
                Download assets
              </Button>
            </div>
          </FadeUp>
        </div>

        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-40 lg:relative lg:inset-auto lg:z-auto lg:justify-end lg:opacity-100">
          <OrbitalSystem className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[540px]" />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Sections
──────────────────────────────────────────────────────────── */

function FoundationsSection() {
  return (
    <Section
      id="foundations"
      eyebrow="01 · Foundations"
      title={
        <>
          Four principles, one <span className="text-gradient-brand">gravity</span>
        </>
      }
      description="Every Orbyt surface obeys the same physics: geometry orbits, warmth radiates, type stays precise, and darkness holds it all together."
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map((principle, i) => (
          <li key={principle.title} className="h-full">
            <Reveal delay={i * 0.06} className="h-full">
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-flare">
                    <principle.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-base font-medium">{principle.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{principle.copy}</p>
                </CardContent>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function ColorSection() {
  return (
    <Section
      id="color"
      eyebrow="02 · Color"
      title={
        <>
          The <span className="text-gradient-brand">Ember</span> spectrum
        </>
      }
      description="A warm core burning inside a deep, near-black canvas. Dark neutrals do the quiet work; a single ember and its satellites carry the signal."
    >
      <Reveal>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {SWATCHES.map((swatch) => (
            <li
              key={swatch.name}
              className="rounded-xl border border-border bg-card p-3 sm:p-4"
            >
              <div
                className="h-24 rounded-lg border border-foreground/10 sm:h-28"
                style={{ backgroundColor: swatch.hex }}
              />
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <p className="font-display text-sm font-medium">{swatch.name}</p>
                <p className="font-mono text-[11px] uppercase text-muted-foreground">
                  {swatch.hex}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{swatch.role}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-lg font-medium">Usage ratio</h3>
            <p className="font-mono text-xs text-muted-foreground">60 / 25 / 10 / 5</p>
          </div>
          <div
            className="mt-4 flex h-12 w-full overflow-hidden rounded-full border border-border"
            role="img"
            aria-label="Color usage ratio: Void 60 percent, Nebula and Ash 25 percent, Starlight 10 percent, Ember 5 percent"
          >
            {USAGE_RATIO.map((ratio, i) => (
              <div
                key={ratio.name}
                className={cn(
                  'flex items-center justify-center',
                  i < USAGE_RATIO.length - 1 && 'border-r border-background/40'
                )}
                style={{ width: `${ratio.pct}%`, backgroundColor: ratio.hex }}
              >
                {ratio.pct >= 10 && (
                  <span
                    className={cn(
                      'font-mono text-xs',
                      ratio.hex === '#F2EEE6' ? 'text-[#1A0E04]' : 'text-foreground/80'
                    )}
                  >
                    {ratio.pct}%
                  </span>
                )}
              </div>
            ))}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {USAGE_RATIO.map((ratio) => (
              <li key={ratio.name} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full border border-foreground/10"
                  style={{ backgroundColor: ratio.hex }}
                  aria-hidden="true"
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {ratio.pct}% {ratio.name} — {ratio.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="mt-12">
          <CardContent className="flex items-start gap-4">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-flare">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-lg font-medium">Accessibility notes</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Ember (#FF7A1A) on Void clears WCAG AA for large text and UI accents; Starlight on
                Void clears AAA for body copy. Never set body copy below 16px in muted tones —
                reserve muted text for metadata and captions, and keep interactive states on Ember,
                never on Gold or Sage.
              </p>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </Section>
  );
}

function TypeSection() {
  return (
    <Section
      id="type"
      eyebrow="03 · Typography"
      title={
        <>
          Precision in <span className="text-gradient-brand">orbit</span>
        </>
      }
      description="Two voices and one instrument panel: Space Grotesk leads, Inter explains, Geist Mono measures. A fixed seven-step scale keeps every altitude consistent."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Reveal className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display text-xl">Space Grotesk</CardTitle>
              <CardDescription>Display · headlines & numerals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-display text-7xl leading-none tracking-tight">Aa</p>
              <p className="mt-5 break-words font-display text-sm leading-relaxed tracking-wide text-muted-foreground">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 (&?!@)
              </p>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                Set tight and tall for headlines. Pairs with Starlight at 48–64px.
              </p>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.06} className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display text-xl">Inter</CardTitle>
              <CardDescription>Text · body & interface</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-sans text-7xl leading-none tracking-tight">Aa</p>
              <p className="mt-5 break-words font-sans text-sm leading-relaxed text-muted-foreground">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 (&?!@)
              </p>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                Optimized for screens at 16px and up. Never below 13px, even for captions.
              </p>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.12} className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display text-xl">Geist Mono</CardTitle>
              <CardDescription>Mono · labels, code & tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-6xl leading-none">Aa</p>
              <p className="mt-5 break-words font-mono text-sm leading-relaxed text-muted-foreground">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 {<>=}'}
              </p>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                Always uppercase for eyebrows and telemetry. Values render in Flare.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <div className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-lg font-medium">Type scale</h3>
            <p className="font-mono text-xs text-muted-foreground">7 steps · fluid down, fixed up</p>
          </div>
          <Card className="mt-4">
            <CardContent>
              {TYPE_SCALE.map((row, i) => (
                <React.Fragment key={row.token}>
                  {i > 0 && <Separator />}
                  <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-5">
                    <p className={cn('min-w-0 break-words', row.className)}>{row.sample}</p>
                    <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                      {row.token}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </div>
      </Reveal>
    </Section>
  );
}

function LogoSection() {
  return (
    <Section
      id="logo"
      eyebrow="04 · Logo"
      title={
        <>
          A world and its <span className="text-gradient-brand">orbit</span>
        </>
      }
      description="The mark is an ember planet held by a single inclined ring. The ring inherits its surroundings; the planet never changes."
    >
      <Reveal>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {LOGO_TILES.map((tile) => (
            <li key={tile.label}>
              <figure>
                <div
                  className="flex aspect-square items-center justify-center rounded-xl border border-border"
                  style={{ backgroundColor: tile.bg, color: tile.color }}
                >
                  <OrbytMark className="h-[42%] w-[42%]" />
                </div>
                <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {tile.label}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Reveal delay={0.05} className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Ruler className="size-4 text-flare" aria-hidden="true" />
                Clear space & size
              </CardTitle>
              <CardDescription>Give the mark room to orbit.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-flare/40 bg-background/40 p-6">
                  <OrbytMark className="size-14 text-foreground" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-flare">
                    clear space = 1 r
                  </p>
                </div>
                <ul className="flex-1 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                  <li>Keep clear space equal to the planet radius (1× r) on all sides.</li>
                  <li>Minimum digital size: 24px. Minimum print size: 8mm.</li>
                  <li>On tinted grounds, only the ring recolors — via currentColor.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.1} className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display text-lg">Never</CardTitle>
              <CardDescription>Three rules keep the orbit stable.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {LOGO_DONT.map((rule) => (
                  <li key={rule} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                      <X className="size-3" aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

function MotionSection() {
  return (
    <Section
      id="motion"
      eyebrow="05 · Motion"
      title={
        <>
          Everything <span className="text-gradient-brand">orbits</span>
        </>
      }
      description="Motion is the brand made visible: continuous loops, gentle easing, and two clocks running at once — one for people, one for planets."
    >
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <ul className="space-y-6">
          {MOTION_PRINCIPLES.map((principle, i) => (
            <li key={principle.title}>
              <Reveal delay={i * 0.06}>
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-flare">
                    <principle.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-medium">{principle.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {principle.copy}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.08}>
          <Card className="border-gradient-brand">
            <CardHeader>
              <CardTitle className="font-display text-lg">Motion tokens in action</CardTitle>
              <CardDescription>Three loops from the Orbyt motion set, running live.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 sm:grid-cols-3 sm:items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative size-32" aria-hidden="true">
                    <div className="absolute inset-0 rounded-full border border-foreground/15" />
                    <div className="absolute inset-0 animate-orbit" style={orbitStyle('12s')}>
                      <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flare shadow-[0_0_12px_rgba(255,178,92,0.9)]" />
                    </div>
                    <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary glow-primary" />
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">animate-orbit · 12s</p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="animate-float rounded-lg border border-border bg-secondary px-4 py-2.5 font-mono text-xs text-secondary-foreground">
                    float · 7s
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">animate-float · 7s</p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <span
                    className="size-5 animate-pulse-glow rounded-full bg-primary glow-primary"
                    aria-hidden="true"
                  />
                  <p className="font-mono text-[11px] text-muted-foreground">
                    animate-pulse-glow · 5s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

function ComponentsSection() {
  return (
    <Section
      id="components"
      eyebrow="06 · Components"
      title={
        <>
          The system in <span className="text-gradient-brand">practice</span>
        </>
      }
      description="Every primitive inherits the token set automatically — no per-component theming. What follows is a slice of a real product surface, plus the control inventory."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <Card className="border-gradient-brand">
            <CardHeader>
              <CardTitle className="font-display text-lg">Orbyt Mission Control</CardTitle>
              <CardDescription>Systems nominal · all stations reporting</CardDescription>
              <CardAction>
                <Badge className="gap-1.5">
                  <span
                    className="size-1.5 animate-pulse rounded-full bg-primary-foreground/80"
                    aria-hidden="true"
                  />
                  Live
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-5">
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  toast({
                    title: 'Telemetry scan queued',
                    description: 'Demo action — no spacecraft were contacted.',
                  });
                }}
              >
                <Input
                  className="h-10 min-w-0 flex-1"
                  placeholder="Search telemetry…"
                  aria-label="Search telemetry"
                />
                <Button type="submit" className="h-10">
                  Scan
                </Button>
              </form>

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Badge>Nominal</Badge>
                <Badge variant="secondary">Standby</Badge>
                <Badge variant="outline">Uplink</Badge>
                <Badge variant="outline" className="border-gold/40 bg-gold/10 text-gold">
                  Caution
                </Badge>
              </div>

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                  <TabsTrigger value="crew">Crew</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-2">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    All orbital systems nominal. Station-keeping within tolerance; next correction
                    burn in 42 minutes.
                  </p>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-baseline justify-between font-mono text-xs text-muted-foreground">
                      <span>Uplink stability</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} aria-label="Uplink stability: 68 percent" />
                  </div>
                </TabsContent>
                <TabsContent value="telemetry" className="pt-2">
                  <dl className="grid grid-cols-3 gap-2">
                    {TELEMETRY.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg border border-border bg-background/40 px-2 py-3 text-center"
                      >
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {stat.label}
                        </dt>
                        <dd className="mt-1 font-display text-sm font-medium sm:text-base">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
                <TabsContent value="crew" className="pt-2">
                  <ul className="space-y-2.5">
                    {CREW.map((member) => (
                      <li key={member.name} className="flex items-center gap-3">
                        <Avatar className="size-8 border border-border">
                          <AvatarFallback className={cn('text-[11px] font-medium', member.tone)}>
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        <Badge
                          variant={member.status === 'Rest' ? 'secondary' : 'outline'}
                          className="ml-auto font-mono text-[10px] uppercase tracking-wider"
                        >
                          {member.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div className="flex -space-x-2.5">
                  {STATION_AVATARS.map((avatar) => (
                    <Avatar key={avatar.initials} className="size-9 ring-2 ring-card">
                      <AvatarFallback
                        className={cn('border border-border text-[11px] font-semibold', avatar.tone)}
                      >
                        {avatar.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="auto-uplink" defaultChecked aria-label="Toggle auto uplink" />
                  <Label htmlFor="auto-uplink" className="text-sm text-muted-foreground">
                    Auto-uplink
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Buttons & badges</CardTitle>
              <CardDescription>Every control inherits the ember token set.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2.5">
                <Button className="h-10">Primary</Button>
                <Button variant="secondary" className="h-10">
                  Secondary
                </Button>
                <Button variant="outline" className="h-10">
                  Outline
                </Button>
                <Button variant="ghost" className="h-10">
                  Ghost
                </Button>
                <Button variant="destructive" className="h-10">
                  Abort
                </Button>
                <Button variant="link" className="h-10">
                  Documentation
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10"
                  aria-label="Launch sequence"
                >
                  <Rocket className="size-4" aria-hidden="true" />
                </Button>
              </div>

              <Separator />

              <div className="flex flex-wrap items-center gap-2">
                <Badge>Ember</Badge>
                <Badge variant="secondary">Ash</Badge>
                <Badge variant="outline">Starlight</Badge>
                <Badge variant="destructive">Alert</Badge>
                <Badge variant="outline" className="border-flare/40 bg-primary/10 text-flare">
                  Flare
                </Badge>
                <Badge variant="outline" className="border-gold/40 bg-gold/10 text-gold">
                  Gold
                </Badge>
              </div>

              <Separator />

              <Button
                variant="secondary"
                className="h-10"
                onClick={() =>
                  toast({
                    title: 'Signal received',
                    description: 'Control room acknowledges. (Demo toast)',
                  })
                }
              >
                <Satellite className="size-4" aria-hidden="true" />
                Ping control room
              </Button>

              <p className="font-mono text-xs text-muted-foreground">
                radius: 1rem · focus ring: ember · border: white 10%
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
   Footer
──────────────────────────────────────────────────────────── */

const FOOTER_LINKS = [
  {
    label: 'Guidelines',
    toast: {
      title: 'Guidelines',
      description: 'You are reading the living guidelines — scroll on.',
    },
  },
  { label: 'Assets', toast: ASSETS_TOAST },
  {
    label: 'License',
    toast: {
      title: 'License',
      description: 'Orbyt v1.0 demo license — remix freely, honor the ember.',
    },
  },
] as const;

function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <OrbytMark className="size-6 text-foreground" />
              <span className="font-display text-lg font-medium lowercase tracking-tight">
                orbyt
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A stellar design language — crafted in orbit, shipped with warmth.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => toast(link.toast)}
                    className="flex min-h-[44px] items-center px-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © 2025 Orbyt Studio — Crafted in orbit
          </p>
          <p className="font-mono text-xs text-muted-foreground">Stellar Ember theme v1.0</p>
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
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FoundationsSection />
        <ColorSection />
        <TypeSection />
        <LogoSection />
        <MotionSection />
        <ComponentsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
