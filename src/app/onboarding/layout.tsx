import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding · ORBYT",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
