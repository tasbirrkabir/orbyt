import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TEAM } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { emphasize } from "./emphasize";
import { Reveal } from "./reveal";
import { Section } from "./section";
import { SpotlightCard } from "./spotlight-card";

/**
 * Home team teaser. Split layout: the promise on the left, four role
 * cards on the right. Roles, not headshots: nothing invented.
 */
export function TeamSection() {
  return (
    <Section
      id="team"
      eyebrow={TEAM.eyebrow}
      title={TEAM.title}
      titleAccent={TEAM.titleAccent}
      lede={TEAM.lede}
    >
      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        {/* Promise + CTA rail */}
        <Reveal className="lg:col-span-4">
          <div className="border-l-2 border-primary pl-5">
            <p className="text-lg font-medium leading-relaxed">
              {emphasize(TEAM.promise, TEAM.promiseWord)}
            </p>
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {String(TEAM.crew.length).padStart(2, "0")} SEATS. NO BENCH.
          </p>
          <Button asChild variant="outline" className="mt-8 h-11 px-6">
            <Link href={TEAM.homeCta.href}>
              {TEAM.homeCta.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>

        {/* Role cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
          {TEAM.crew.map((member, i) => (
            <Reveal key={member.id} delay={i * 0.06} className="h-full">
              <SpotlightCard className="p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  {member.id}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold tracking-tight transition-colors duration-200 group-hover/spot:text-primary">
                  {member.role}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {member.tagline}
                </p>
                <div className="mt-5 border-t border-dashed border-border pt-4">
                  <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
                    {member.owns}
                  </p>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
