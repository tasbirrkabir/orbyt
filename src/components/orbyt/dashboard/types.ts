/**
 * Shared shapes for the dashboard workspace. Mirrors the /api/me contract.
 */

export type MeUser = {
  name: string | null;
  email: string;
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
  createdAt: string;
};

export type MePayload = {
  user: MeUser;
  profile: MeProfile | null;
  submissions: MeSubmission[] | null;
};
