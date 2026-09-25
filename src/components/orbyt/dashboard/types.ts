/**
 * Shared shapes for the client portal workspace. Mirrors the /api/me contract.
 */

export type MeUser = {
  name: string | null;
  email: string;
  clientId: string | null;
  createdAt: string;
};

export type MeProfile = {
  company: string;
  industry: string;
  stage: string;
  challenges: string[] | null;
  tools: string | null;
  goal: string;
  updatedAt?: string | null;
};

export type MeSubmission = {
  id: string;
  topic: string | null;
  message: string;
  projectId: string | null;
  createdAt: string;
};

export type MeProjectUpdate = {
  id: string;
  tag: string;
  title: string;
  body: string;
  acknowledgedAt: string | null;
  createdAt: string;
};

export type MeDeliverable = {
  id: string;
  title: string;
  detail: string;
  status: string;
  channel: string;
  link: string | null;
  deliveredAt: string | null;
  createdAt: string;
  projectId: string | null;
};

export type MeProject = {
  id: string;
  title: string;
  status: string;
  startedAt: string;
  updates: MeProjectUpdate[];
};

export type MePayload = {
  user: MeUser;
  profile: MeProfile | null;
  submissions: MeSubmission[] | null;
  projects: MeProject[] | null;
  deliverables: MeDeliverable[] | null;
};
