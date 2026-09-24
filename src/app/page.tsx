"use client";

import { Header } from "@/components/orbyt/header";
import { Hero } from "@/components/orbyt/hero";
import { Problem } from "@/components/orbyt/problem";
import { Services } from "@/components/orbyt/services";
import { Process } from "@/components/orbyt/process";
import { Systems } from "@/components/orbyt/systems";
import { Why } from "@/components/orbyt/why";
import { Insights } from "@/components/orbyt/insights";
import { CtaStrip } from "@/components/orbyt/cta-strip";
import { Contact } from "@/components/orbyt/contact";
import { Footer } from "@/components/orbyt/footer";

/**
 * ORBYT — official agency site. Single route, anchor-based navigation.
 * This is a composition root only: all structure lives in
 * src/components/orbyt/*, all copy in src/content/orbyt.ts.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Services />
        <Process />
        <Systems />
        <Why />
        <Insights />
        <CtaStrip />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
