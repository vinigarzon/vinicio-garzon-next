import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Vinicio Garzón',
  description:
    'How viniciogarzon.com handles personal information, including the scheduling tool and Google Calendar access.',
};

const UPDATED = 'August 23, 2026';
const CONTACT = 'yo@viniciogarzon.com';

export default function PrivacyPage() {
  return (
    <article className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <p className="section-label">Legal</p>
        <h1 className="!text-4xl md:!text-5xl font-display font-bold mb-3">Privacy Policy</h1>
        <p className="text-text-dim text-sm mb-14">Last updated: {UPDATED}</p>

        <div className="space-y-10 text-text-muted leading-relaxed">
          <Section title="Who runs this site">
            <p>
              viniciogarzon.com is the personal and professional website of Vinicio Garzón Castrillón. It is
              run by one person, not a company. There is no marketing team, no advertising network and no data
              broker behind it. Questions about anything on this page go to{' '}
              <Mail /> and are answered by me.
            </p>
          </Section>

          <Section title="What this site collects">
            <p className="mb-4">There are exactly two ways this site receives personal information.</p>
            <p className="mb-3">
              <strong className="text-text">1. Booking a meeting.</strong> The private scheduling page at{' '}
              <code className="text-accent text-sm">/book</code> asks for your name, your email address and,
              optionally, a short note about what you would like to discuss. Your browser also reports its time
              zone and language so the page can show you the correct hours, and your IP address is recorded to
              limit automated abuse. That is the entire list.
            </p>
            <p>
              <strong className="text-text">2. Analytics.</strong> The site uses Google Analytics 4 to count
              page views. It tells me that a page was read, from roughly which country, and on what kind of
              device. It does not tell me who you are.
            </p>
          </Section>

          <Section title="What that information is used for">
            <p className="mb-3">
              Booking details are used to create the calendar event, send you the confirmation and reminders,
              and let you cancel or reschedule. Your email address is used for those messages and nothing else.
            </p>
            <p>
              I do not sell personal information, I do not share it for advertising, and I do not add anyone to
              a mailing list. There is no mailing list.
            </p>
          </Section>

          <Section title="Google user data">
            <p className="mb-3">
              The scheduling tool connects to <strong className="text-text">my own</strong> Google Calendar —
              never yours. Visitors do not sign in with Google and are never asked for access to their Google
              account.
            </p>
            <p className="mb-3">
              When I authorize the connection, the tool asks for permission to read my calendar&apos;s busy times
              and to create, update and delete the events it creates. It uses those permissions for one purpose:
              to know which hours are genuinely free and to put your meeting on the calendar. It does not read
              the contents of my other events, and it does not touch events it did not create.
            </p>
            <p className="mb-3">
              The authorization token that makes this possible is stored encrypted at rest on the site&apos;s
              server infrastructure and is never exposed to visitors. I can revoke it at any time from the
              tool&apos;s admin panel or from{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google Account permissions
              </a>
              .
            </p>
            <p>
              This site&apos;s use of information received from Google APIs adheres to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </Section>

          <Section title="Services that process data on my behalf">
            <ul className="space-y-3">
              <Item name="Netlify">hosts the website and serves every page.</Item>
              <Item name="Supabase">stores bookings and scheduling settings in a private database.</Item>
              <Item name="Google Calendar">holds the meeting and sends the calendar invitation.</Item>
              <Item name="Resend">delivers the confirmation, cancellation and reschedule emails.</Item>
              <Item name="Zoom">hosts the video call itself, under its own privacy policy.</Item>
              <Item name="Google Analytics">counts anonymous page views.</Item>
            </ul>
            <p className="mt-4">
              Each of these only receives what it needs to do its job, and none of them is authorized to use it
              for anything else.
            </p>
          </Section>

          <Section title="How long things are kept">
            <p>
              Booking records are kept while they are useful as a history of who I have met with, and are
              deleted on request. Cancelled bookings keep only the fact of the cancellation. Analytics data
              follows Google Analytics&apos; own retention settings.
            </p>
          </Section>

          <Section title="Your choices">
            <p className="mb-3">
              You can cancel or reschedule a meeting yourself from the link in your confirmation email, for as
              long as the scheduling rules allow it.
            </p>
            <p>
              You can also write to <Mail /> and ask me what I hold about you, ask for a copy, ask for a
              correction, or ask me to delete it. I will do it, and I do not need a legal process to be
              persuaded. If you are in the EU, the UK, California or anywhere with a comparable law, those
              rights are yours by statute as well.
            </p>
          </Section>

          <Section title="Children">
            <p>This site is not directed at children under 13 and does not knowingly collect their data.</p>
          </Section>

          <Section title="Changes">
            <p>
              If this policy changes, the date at the top changes with it. Material changes will be described
              plainly rather than buried.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Vinicio Garzón Castrillón · Naperville, Illinois, USA · <Mail />
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

function Item({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-accent mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
      <span>
        <strong className="text-text font-medium">{name}</strong> {children}
      </span>
    </li>
  );
}

function Mail() {
  return (
    <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">
      {CONTACT}
    </a>
  );
}
