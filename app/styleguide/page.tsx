import fs from "node:fs/promises";
import path from "node:path";
import ReactMarkdown from "react-markdown";

const ROOT = process.cwd();

async function readDoc(relPath: string) {
  const full = path.join(ROOT, relPath);
  return fs.readFile(full, "utf8");
}

function Section(props: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={props.id} className="scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight">{props.title}</h2>
      <div className="mt-4">{props.children}</div>
    </section>
  );
}

function NavLink(props: { href: string; label: string }) {
  return (
    <a
      href={props.href}
      className="block rounded-md px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
    >
      {props.label}
    </a>
  );
}

export default async function StyleGuidePage() {
  const designSystemMd = await readDoc("design-system/minimalist/docs/DESIGN_SYSTEM.md");
  const colorsMd = await readDoc("design-system/minimalist/docs/COLORS.md");
  const version = (await readDoc("design-system/minimalist/VERSION.txt")).trim();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start gap-10">
          <aside className="sticky top-6 hidden w-64 shrink-0 md:block">
            <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="px-3 py-2">
                <div className="text-sm font-medium">Minimalist Design System</div>
                <div className="text-xs text-neutral-500">v{version}</div>
              </div>
              <nav className="mt-2">
                <NavLink href="#vision" label="Vision" />
                <NavLink href="#installation" label="Installation" />
                <NavLink href="#tokens" label="Tokens" />
                <NavLink href="#components" label="Components" />
                <NavLink href="#motion" label="Motion" />
                <NavLink href="#accessibility" label="Accessibility" />
                <NavLink href="#download" label="Download" />
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-14">
            <header className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight">Minimalist Style Guide</h1>
              <p className="text-neutral-600 dark:text-neutral-300">
                Public documentation and live examples for the Minimalist Design System.
              </p>
            </header>

            <Section id="vision" title="Vision">
              <div className="prose prose-neutral max-w-none dark:prose-invert">
                <ReactMarkdown>{designSystemMd}</ReactMarkdown>
              </div>
            </Section>

            <Section id="installation" title="Installation">
              <div className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
                <div className="font-medium">Next.js App Router install (portable)</div>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-neutral-700 dark:text-neutral-300">
                  <li>Copy <code>design-system/minimalist/kit</code> into your target repo.</li>
                  <li>Merge the Tailwind <code>content</code> globs into that repo’s Tailwind config.</li>
                  <li>Import the kit <code>index.css</code> into your global stylesheet.</li>
                </ol>
              </div>
            </Section>

            <Section id="tokens" title="Tokens">
              <div className="prose prose-neutral max-w-none dark:prose-invert">
                <ReactMarkdown>{colorsMd}</ReactMarkdown>
              </div>
            </Section>

            <Section id="components" title="Components">
              <div className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
                <div className="font-medium">Source of truth</div>
                <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                  Component recipes currently live in <code>design-system/minimalist/kit/EXAMPLES.jsx</code>.
                  Next step is to port the recipes you want into real, typed components under <code>components/</code>,
                  while keeping the kit as the distribution artifact.
                </p>
              </div>
            </Section>

            <Section id="motion" title="Motion">
              <div className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
                <p className="text-neutral-700 dark:text-neutral-300">
                  Motion primitives should be expressed as named utilities and documented here. This section is the
                  contract that makes motion portable across projects.
                </p>
              </div>
            </Section>

            <Section id="accessibility" title="Accessibility">
              <div className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
                <p className="text-neutral-700 dark:text-neutral-300">
                  This section becomes your checklist: focus visibility, contrast targets, keyboard affordances, reduced motion.
                </p>
              </div>
            </Section>

            <Section id="download" title="Download">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  className="inline-flex items-center rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
                  href="/api/design-systems/minimalist/download"
                >
                  Download Minimalist Kit (.zip)
                </a>
                <span className="text-xs text-neutral-500">Served dynamically from this repo’s canonical kit folder.</span>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
