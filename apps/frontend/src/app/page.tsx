import React from 'react';
import type { Metadata } from 'next';
import { AuthorProfileCard } from '../components/content/AuthorProfileCard';
import { SocialShareButtons } from '../components/content/SocialShareButtons';

const DEFAULT_HOMEPAGE_FALLBACK = {
  seo: {
    metaTitle: 'Sandip Thapa | Academic Research, Law & Accessibility Platform',
    metaDescription:
      'Enterprise Backend-Driven Personal Website of Sandip Thapa covering Legal Research, Disability Rights, Human Rights, Literature, and Academic Publications.',
    canonicalUrl: 'https://thapasandip.com.np',
  },
  layout: {
    regions: {
      main: [
        {
          blockId: 'sec-hero',
          type: 'HERO',
          props: {
            tagline: 'LEGAL RESEARCH, HUMAN RIGHTS & ACCESSIBILITY',
            title: 'Advancing Disability Rights & Legal Capacity in Nepal',
            subtitle:
              'Official academic research portal, publications directory, literary archive, and policy consulting platform of Sandip Thapa.',
            primaryCta: { label: 'Explore Publications', url: '/publications' },
            secondaryCta: { label: 'Read Research Papers', url: '/research' },
          },
        },
        {
          blockId: 'sec-intro',
          type: 'TEXT_BLOCK',
          props: {
            heading: 'Short Introduction',
            content:
              'Sandip Thapa is a dedicated legal scholar, researcher, and human rights advocate based in Nepal. His work focuses on legal capacity, supported decision-making under the UN CRPD, inclusive policy formulation, and digital accessibility compliance.',
          },
        },
        {
          blockId: 'sec-featured',
          type: 'TEXT_BLOCK',
          props: {
            heading: 'Featured Article: Legal Capacity & Supported Decision-Making under UN CRPD',
            content:
              'Published: 2083 Shrawan 17, Saturday (1 August 2026, Saturday) | 18:35 NPT (UTC+05:45) | Word Count: 3,420 words | Reading Time: 18 mins. An in-depth analysis of Article 12 of the Convention on the Rights of Persons with Disabilities and its application in Nepal legal framework.',
          },
        },
        {
          blockId: 'sec-latest-articles',
          type: 'ARTICLE_LIST',
          props: {
            heading: 'Latest Articles & Essays',
            description: 'Recent academic commentary, legal critiques, and policy papers.',
            items: [
              {
                title: 'Harmonizing Nepalese Disability Legislation with International Standards',
                summary: 'Examining legislative gaps between national statutes and CRPD obligations.',
                publishedBs: '2083 Shrawan 15, Thursday',
                publishedAd: '30 July 2026',
              },
              {
                title: 'Digital Accessibility in Public Institutions: A Right, Not a Luxury',
                summary: 'Evaluating web accessibility compliance across municipal portals in Nepal.',
                publishedBs: '2083 Shrawan 10, Saturday',
                publishedAd: '25 July 2026',
              },
            ],
          },
        },
        {
          blockId: 'sec-research',
          type: 'RESEARCH_LIST',
          props: {
            heading: 'Research Projects',
            items: [
              {
                title: 'CRPD Article 12 Legal Capacity Benchmark Project',
                status: 'Ongoing Lead Project',
                timeline: '2025 - 2026',
                description:
                  'A comprehensive empirical survey analyzing judicial guardianship orders and mental health laws across 7 provinces of Nepal.',
              },
              {
                title: 'Nepal Web & Mobile Accessibility Index (NWMAI)',
                status: 'Completed Survey',
                timeline: '2024 - 2025',
                description: 'Auditing 150+ government websites against WCAG 2.1 AAA accessibility standards.',
              },
            ],
          },
        },
        {
          blockId: 'sec-working-papers',
          type: 'TEXT_BLOCK',
          props: {
            heading: 'Working Papers & Policy Briefs',
            content:
              'Draft working papers on legal reform, policy briefs submitted to parliamentary committees, and legislative recommendations.',
          },
        },
        {
          blockId: 'sec-publications',
          type: 'PUBLICATION_LIST',
          props: {
            heading: 'Academic Publications & Journal Articles',
            items: [
              {
                title: 'Legal Capacity & Decision-Making Autonomy: Rethinking Guardianship in Nepal',
                journal: 'Kathmandu Law Review, Vol. 14, Issue 2',
                citationApa: 'Thapa, S. (2026). Legal Capacity & Decision-Making Autonomy. Kathmandu Law Review.',
              },
              {
                title: 'Barriers to Inclusive Education for Children with Disabilities in Rural Nepal',
                journal: 'Journal of Human Rights & Social Justice, Vol. 9',
                citationApa: 'Thapa, S. (2025). Barriers to Inclusive Education. J. Human Rights & Social Justice.',
              },
            ],
          },
        },
        {
          blockId: 'sec-books',
          type: 'TEXT_BLOCK',
          props: {
            heading: 'Books & Monograph Chapters',
            content:
              'Authored volumes, edited collections, and handbook chapters on human rights jurisprudence, disability law, and administrative justice.',
          },
        },
        {
          blockId: 'sec-poems',
          type: 'TEXT_BLOCK',
          props: {
            heading: 'Poems & Literary Works (कविता र साहित्य)',
            content:
              'Explore original Nepali and English poetry collections, literary essays, and reflections on identity, justice, and human resilience.',
          },
        },
        {
          blockId: 'sec-translations',
          type: 'TEXT_BLOCK',
          props: {
            heading: 'Translations & Multilingual Legal Texts',
            content:
              'English to Nepali and Nepali to English translations of UN declarations, legal instruments, policy charters, and literary texts.',
          },
        },
        {
          blockId: 'sec-media',
          type: 'TEXT_BLOCK',
          props: {
            heading: 'Media, Interviews & Public Dialogues',
            content:
              'Keynote addresses, podcast episodes, television interviews, and press appearances discussing human rights and legal reforms.',
          },
        },
        {
          blockId: 'sec-services',
          type: 'TEXT_BLOCK',
          props: {
            heading: 'Professional Consulting & Research Services',
            content:
              'Services offered: Legal Research & Drafting, Certified Translation, Digital Accessibility Audits (WCAG 2.1 AAA), Disability Rights Training, and Keynote Speaking.',
          },
        },
        {
          blockId: 'sec-testimonials',
          type: 'STATS',
          props: {
            heading: 'Academic Impact & Key Metrics',
            stats: [
              { label: 'Journal Papers', value: '18+' },
              { label: 'Citations', value: '340+' },
              { label: 'Policy Audits', value: '50+' },
              { label: 'Years Experience', value: '10+' },
            ],
          },
        },
        {
          blockId: 'sec-faq-contact',
          type: 'TEXT_BLOCK',
          props: {
            heading: 'Frequently Asked Questions & Contact',
            content:
              'For academic collaborations, legal consulting inquiries, or speaking engagements, reach out via the Contact page or email direct.',
          },
        },
      ],
      sidebar: [
        {
          blockId: 'sidebar-author',
          type: 'AUTHOR_CARD',
          props: {
            name: 'Sandip Thapa',
            title: 'Legal Scholar & Human Rights Researcher',
            bio: 'Specializing in Disability Rights, Legal Capacity under UN CRPD, Inclusive Policy, and Digital Accessibility Compliance in Nepal.',
            orcid: 'https://orcid.org',
            scholar: 'https://scholar.google.com',
            linkedin: 'https://linkedin.com',
            website: 'https://thapasandip.com.np',
          },
        },
      ],
    },
  },
};

async function getBackendRenderSchema() {
  try {
    const res = await fetch('http://localhost:4000/api/v1/renderer/page?slug=/', {
      cache: 'no-store',
    });
    if (!res.ok) return DEFAULT_HOMEPAGE_FALLBACK;
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    return DEFAULT_HOMEPAGE_FALLBACK;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const schema = await getBackendRenderSchema();
  const seo = (schema?.seo || DEFAULT_HOMEPAGE_FALLBACK.seo) as Record<string, any>;

  return {
    title: seo.metaTitle || 'Sandip Thapa | Academic Research, Law & Accessibility',
    description:
      seo.metaDescription ||
      'Personal CMS Platform of Sandip Thapa covering Legal Research, Disability Rights, Human Rights, Literature, and Academic Publications.',
    alternates: {
      canonical: seo.canonicalUrl || 'https://thapasandip.com.np',
    },
    openGraph: {
      title: seo.metaTitle || 'Sandip Thapa | Academic Research, Law & Accessibility',
      description: seo.metaDescription,
      url: seo.canonicalUrl || 'https://thapasandip.com.np',
      images: seo.openGraphImage ? [{ url: seo.openGraphImage }] : [],
    },
  };
}

export default async function HomePage() {
  const schema = await getBackendRenderSchema();
  const mainBlocks = schema?.layout?.regions?.main || DEFAULT_HOMEPAGE_FALLBACK.layout.regions.main;
  const sidebarBlocks = schema?.layout?.regions?.sidebar || DEFAULT_HOMEPAGE_FALLBACK.layout.regions.sidebar;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12 my-6">
      {/* 14-Section Backend-Driven Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-12">
          {mainBlocks.map((block: any) => {
            const { type, props, blockId } = block;

            if (type === 'HERO') {
              return (
                <section key={blockId} className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
                  <span className="px-3 py-1 bg-sky-500/10 border border-sky-400/30 text-sky-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {props.tagline}
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    {props.title}
                  </h1>
                  <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                    {props.subtitle}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-4">
                    {props.primaryCta && (
                      <a href={props.primaryCta.url} className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl shadow-lg transition-all">
                        {props.primaryCta.label} →
                      </a>
                    )}
                    {props.secondaryCta && (
                      <a href={props.secondaryCta.url} className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold rounded-xl transition-all">
                        {props.secondaryCta.label}
                      </a>
                    )}
                  </div>
                </section>
              );
            }

            if (type === 'TEXT_BLOCK') {
              return (
                <section key={blockId} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-4">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">{props.heading}</h2>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{props.content}</p>
                </section>
              );
            }

            if (type === 'RESEARCH_LIST') {
              return (
                <section key={blockId} className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">{props.heading}</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {props.items?.map((item: any, idx: number) => (
                      <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 text-xs font-bold rounded">
                            {item.status}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{item.timeline}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                        <p className="text-sm text-slate-300">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (type === 'PUBLICATION_LIST') {
              return (
                <section key={blockId} className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">{props.heading}</h2>
                  <div className="space-y-4">
                    {props.items?.map((pub: any, idx: number) => (
                      <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                        <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">{pub.journal}</span>
                        <h3 className="text-lg font-bold text-white">{pub.title}</h3>
                        <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-400 border border-slate-800">
                          APA: {pub.citationApa}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (type === 'STATS') {
              return (
                <section key={blockId} className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">{props.heading}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {props.stats?.map((st: any, idx: number) => (
                      <div key={idx} className="text-center space-y-1">
                        <div className="text-3xl sm:text-4xl font-black text-sky-400">{st.value}</div>
                        <div className="text-xs text-slate-400 font-semibold uppercase">{st.label}</div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            return (
              <section key={blockId} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <h2 className="text-xl font-bold text-white">{props.heading || type}</h2>
                {props.description && <p className="text-sm text-slate-300">{props.description}</p>}
                {props.items && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {props.items.map((it: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                        <h4 className="font-bold text-slate-200 text-sm">{it.title || it.name}</h4>
                        {it.summary && <p className="text-xs text-slate-400">{it.summary}</p>}
                        {it.quote && <p className="text-xs italic text-slate-300">"{it.quote}"</p>}
                        {it.publishedBs && (
                          <div className="text-[10px] text-sky-400 pt-1 font-semibold">
                            BS: {it.publishedBs} | AD: {it.publishedAd}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Context-Aware Sidebar */}
        <aside className="space-y-6">
          {sidebarBlocks.map((sBlock: any) => {
            if (sBlock.type === 'AUTHOR_CARD') {
              return (
                <AuthorProfileCard
                  key={sBlock.blockId}
                  name={sBlock.props.name}
                  position={sBlock.props.title}
                  bio={sBlock.props.bio}
                  orcid={sBlock.props.orcid}
                  googleScholar={sBlock.props.scholar}
                  linkedIn={sBlock.props.linkedin}
                  website={sBlock.props.website}
                />
              );
            }
            return null;
          })}

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-white text-sm">Share This Platform</h3>
            <SocialShareButtons
              title="Sandip Thapa - Legal Scholar, Researcher & Human Rights Consultant"
              url="https://thapasandip.com.np"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
