'use client';

import { policiesForPdf } from '@/lib/itinerary-policies';
import type { ItinerarySections } from '@/components/crm/types';

function PolicyBlock({ title, body }: { title: string; body: string }) {
  const lines = body.split('\n').filter((l) => l.trim());
  const [head, ...rest] = lines;
  const isTitleLine = head && head.length < 80 && !head.startsWith('•') && !head.match(/^\d+\./);
  const bodyLines = isTitleLine ? rest : lines;

  return (
    <div className="itin-policy pdf-avoid-break">
      <div className="pdf-keep-together">
        <h3 className="itin-policy-title">{title}</h3>
        {isTitleLine && head !== title ? <p className="itin-policy-p" style={{ fontWeight: 700 }}>{head}</p> : null}
      </div>
      <div className="itin-policy-body">
        {bodyLines.map((line, i) => {
          const t = line.trim();
          if (!t) return null;
          if (t.startsWith('•') || t.match(/^\d+\./)) {
            return (
              <p key={i} className="itin-policy-bullet">
                {t.replace(/^•\s*/, '')}
              </p>
            );
          }
          return (
            <p key={i} className="itin-policy-p">
              {t}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default function ItineraryPdfPolicies({ sections }: { sections: ItinerarySections }) {
  const p = policiesForPdf(sections);
  return (
    <section className="itin-section itin-policies">
      <h2 className="itin-section-title">Policies &amp; important information</h2>
      <p className="itin-policies-intro">
        Please read the following carefully before confirming your Kashmir tour package with us.
      </p>
      <PolicyBlock title="Disclaimer" body={p.disclaimer} />
      <PolicyBlock title="Terms &amp; conditions" body={p.terms_conditions} />
      <PolicyBlock title="Cancellation &amp; refund" body={p.cancellation_policy} />
      <PolicyBlock title="How to reach" body={p.how_to_reach} />
    </section>
  );
}
