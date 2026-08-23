import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Vinicio Garzón',
  description: 'Terms for using viniciogarzon.com and its scheduling tool.',
};

const UPDATED = 'August 23, 2026';
const CONTACT = 'yo@viniciogarzon.com';

export default function TermsPage() {
  return (
    <article className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <p className="section-label">Legal</p>
        <h1 className="!text-4xl md:!text-5xl font-display font-bold mb-3">Terms of Service</h1>
        <p className="text-text-dim text-sm mb-14">Last updated: {UPDATED}</p>

        <div className="space-y-10 text-text-muted leading-relaxed">
          <Section title="What this is">
            <p>
              viniciogarzon.com is the personal and professional website of Vinicio Garzón Castrillón. It hosts
              a profile, a portfolio, occasional writing, and a private scheduling page used to book a video
              call with me. Using the site means you accept what is written here.
            </p>
          </Section>

          <Section title="Booking a meeting">
            <p className="mb-3">
              The scheduling page is shared by direct link with people I would like to talk to. Booking a time
              is free and creates no commercial relationship, no retainer and no obligation on either side
              beyond showing up.
            </p>
            <p className="mb-3">
              Please book with a real name and an email address you actually read — the confirmation, the
              calendar invitation and the link to cancel or reschedule all go there. One booking per
              conversation, please.
            </p>
            <p>
              I may cancel or move a meeting when something unavoidable comes up, and I will tell you by email
              when that happens. I may also decline or cancel bookings that are clearly automated, abusive, or
              made under a false identity.
            </p>
          </Section>

          <Section title="The meeting itself">
            <p>
              Calls happen on Zoom and are subject to Zoom&apos;s own terms. I do not record meetings. If you
              want to record one, ask me first — and I will ask you the same.
            </p>
          </Section>

          <Section title="Content on this site">
            <p>
              The writing, images, design and code on viniciogarzon.com are mine unless credited otherwise. You
              are welcome to read, quote with attribution, and share links. You may not republish substantial
              parts as your own or use the material to train commercial models without asking. Logos and work
              belonging to the organizations mentioned in the portfolio remain theirs.
            </p>
          </Section>

          <Section title="No professional advice">
            <p>
              Anything on this site, and anything discussed in a call booked through it, is shared as personal
              opinion and professional experience. It is not legal, financial, medical or investment advice,
              and it is not a substitute for a qualified professional who knows your specific situation.
            </p>
          </Section>

          <Section title="Availability and liability">
            <p>
              This is a personal site run by one person. It is provided as-is: I do not promise it will always
              be online, error-free, or that a booked slot will survive a power outage. To the extent the law
              allows, I am not liable for indirect or consequential damages arising from using the site or the
              scheduling tool. Nothing here limits liability that cannot legally be limited.
            </p>
          </Section>

          <Section title="Privacy">
            <p>
              How personal information is handled is described in the{' '}
              <a href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </a>
              , which is part of these terms.
            </p>
          </Section>

          <Section title="Changes and contact">
            <p>
              These terms may change; the date at the top will say when. Questions, corrections, or a request
              to delete your booking data go to{' '}
              <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">
                {CONTACT}
              </a>
              . These terms are governed by the laws of the State of Illinois, USA.
            </p>
          </Section>
        </div>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="!text-xl md:!text-2xl font-display font-semibold text-text mb-4">{title}</h2>
      {children}
    </section>
  );
}
