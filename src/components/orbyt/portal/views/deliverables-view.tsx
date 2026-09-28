"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Inbox } from "lucide-react";
import { PORTAL } from "@/content/flows";
import { DeliverablesPanel } from "../deliverables-panel";
import { usePortalData } from "../use-portal";
import { PortalLoading, PortalLoadError } from "../portal-states";
import { PortalPageHeader } from "../portal-page-header";

const COPY = PORTAL.deliverables;

export function DeliverablesView() {
  const reduced = useReducedMotion();
  const { data, failed } = usePortalData();

  if (!data) {
    return failed ? <PortalLoadError /> : <PortalLoading />;
  }

  const deliverables = data.deliverables ?? [];
  const projects = (data.projects ?? []).map((project) => ({
    id: project.id,
    title: project.title,
  }));

  return (
    <div>
      <PortalPageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        className="mt-8 flex items-start gap-3 rounded-md border border-border bg-background/60 p-4"
      >
        <Inbox aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">{COPY.note}</p>
      </motion.div>

      <div className="mt-6">
        <DeliverablesPanel deliverables={deliverables} projects={projects} />
      </div>
    </div>
  );
}
