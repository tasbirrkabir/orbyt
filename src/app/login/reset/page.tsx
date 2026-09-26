import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AUTH } from "@/content/flows";
import { FOOTER, HERO } from "@/content/orbyt";
import { PasswordResetForms } from "@/components/orbyt/portal/password-reset-forms";
import { SiteShell } from "@/components/orbyt/site-shell";

export const metadata: Metadata = {
  title: "Reset your password · ORBYT",
};

/**
 * /login/reset: self-service password recovery. The one-time token
 * arrives in the query string of the email link; without one the page
 * is the request form.
 */
export default async function PasswordResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = rawToken && rawToken.length >= 32 ? rawToken : null;

  return (
    <SiteShell>
      <main className="flex-1">
        <div className="mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-2">
          <aside className="relative hidden border-b border-border bg-blueprint lg:flex lg:flex-col lg:justify-between lg:gap-12 lg:border-b-0 lg:border-r lg:p-12">
            <Link
              href="/"
              className="inline-flex h-11 items-center self-start font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
            >
              {AUTH.shared.backHome}
            </Link>

            <div className="mx-auto w-full max-w-xs py-16">
              <div
                className="overflow-hidden rounded-md border border-border"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)",
                }}
              >
                <Image
                  src="/orbyt-logo.png"
                  alt="ORBYT logo: a black pixel runner on an orange tile"
                  width={1189}
                  height={1323}
                  sizes="(min-width: 1024px) 320px, 60vw"
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-10 font-display text-2xl font-bold leading-snug tracking-tight">
                {HERO.titleA} {HERO.titleB}
              </p>
              <p className="mt-5 font-mono text-xs tracking-widest text-muted-foreground">
                {FOOTER.tag}
              </p>
            </div>

            <p
              aria-hidden="true"
              className="select-none font-mono text-lg leading-none text-foreground/15"
            >
              +
            </p>
          </aside>

          <div className="flex items-center justify-center px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <PasswordResetForms token={token} />
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
