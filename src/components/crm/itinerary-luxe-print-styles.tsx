/** Executive dossier itinerary PDF — navy & gold, timeline days, card layout (distinct from hero template). */
export function ItineraryLuxePrintStyles() {
  return (
    <style>{`
      .itinerary-pdf-root {
        --itin-navy: #0c1929;
        --itin-navy-mid: #1a3050;
        --itin-gold: #b8860b;
        --itin-gold-light: #f5ecd6;
        --itin-ink: #1a1a1a;
        --itin-muted: #5c5c5c;
        --itin-line: #d8dce3;
        font-family: Georgia, "Times New Roman", Times, ui-serif, serif;
        color: var(--itin-ink);
        background: #fff;
      }
      .itinerary-pdf-root * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .itin-doc.itinerary-pdf-pro {
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
        color: var(--itin-ink);
        background: #fff;
        font-size: 11px;
        line-height: 1.5;
      }

      /* Letterhead */
      .itin-letterhead {
        position: relative;
        overflow: hidden;
        padding: 14px 18px;
        background: #0c1929 !important;
        background-color: #0c1929 !important;
        color: #fff;
        border-bottom: 3px solid #b8860b !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .itin-letterhead-bg {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        object-position: center;
        z-index: 1;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .itin-letterhead-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        width: 100%; height: 100%;
        background-color: rgba(12, 25, 41, 0.75);
        background: linear-gradient(105deg, rgba(12, 25, 41, 0.92) 0%, rgba(12, 25, 41, 0.68) 60%, rgba(12, 25, 41, 0.45) 100%);
        z-index: 2;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .itin-letterhead-content {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .itin-letterhead-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
      .itin-letterhead-logo {
        width: 52px; height: 52px; object-fit: contain;
        background: #fff; border-radius: 6px; padding: 4px; flex-shrink: 0;
      }
      .itin-letterhead-brand { margin: 0; font-size: 15px; font-weight: 800; letter-spacing: 0.02em; line-height: 1.25; color: #fff; }
      .itin-letterhead-tag { margin: 3px 0 0; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; color: #f5ecd6; opacity: 0.95; }
      .itin-letterhead-right { text-align: right; font-size: 12px; line-height: 1.5; opacity: 0.95; flex-shrink: 0; color: #fff; }
      .itin-letterhead-right p { margin: 0 0 3px; }
      .itin-chip--rate {
        background: #0c1929 !important;
        color: #fff !important;
        font-weight: 700 !important;
        border: 1px solid #b8860b !important;
      }

      /* Cover title */
      .itin-cover {
        padding: 20px 18px 18px;
        border-bottom: 1px solid var(--itin-line);
        background: linear-gradient(180deg, #fafbfc 0%, #fff 100%);
      }
      .itin-cover-eyebrow {
        margin: 0 0 6px; font-size: 9px; font-weight: 800; letter-spacing: 0.22em;
        text-transform: uppercase; color: var(--itin-gold);
      }
      .itin-cover-title {
        margin: 0; font-size: 22px; font-weight: 800; color: var(--itin-navy);
        letter-spacing: -0.02em; line-height: 1.2;
      }
      .itin-cover-meta { margin: 10px 0 0; display: flex; flex-wrap: wrap; gap: 8px; }
      .itin-chip {
        display: inline-block; padding: 5px 12px; font-size: 12px; font-weight: 700;
        background: var(--itin-navy); color: #fff; border-radius: 6px; letter-spacing: 0.02em;
      }
      .itin-chip--gold { background: var(--itin-gold-light); color: var(--itin-navy); border: 1px solid var(--itin-gold); }

      /* Client facts row */
      .itin-facts {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
        margin: 16px 0 0; border: 1px solid var(--itin-line); border-radius: 8px; overflow: hidden;
      }
      .itin-facts--4 { grid-template-columns: repeat(2, 1fr); }
      @media (min-width: 500px) { .itin-facts--4 { grid-template-columns: repeat(4, 1fr); } }
      .itin-fact {
        padding: 10px 12px; border-right: 1px solid var(--itin-line); background: #fff;
      }
      .itin-fact:last-child { border-right: none; }
      .itin-fact-label {
        font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;
        color: var(--itin-gold); margin-bottom: 3px;
      }
      .itin-fact-value { font-size: 12px; font-weight: 700; color: var(--itin-ink); word-break: break-word; }

      /* Sections */
      .itin-section { margin-top: 22px; padding: 0 2px; }
      .itin-section-title {
        margin: 0 0 12px; padding: 0 0 8px 12px;
        border-left: 4px solid var(--itin-gold);
        font-size: 13.5px; font-weight: 800; letter-spacing: 0.08em;
        text-transform: uppercase; color: var(--itin-navy);
      }

      /* Hotel cards */
      .itin-hotel-cards { display: flex; flex-direction: column; gap: 10px; }
      .itin-hotel-card {
        display: flex; gap: 14px; align-items: stretch;
        border: 1px solid var(--itin-line); border-radius: 8px; overflow: hidden;
        background: #fafbfc;
      }
      .itin-hotel-card-img {
        width: 150px; min-width: 150px; height: 100px; flex-shrink: 0;
        background: #e8eaed; overflow: hidden; aspect-ratio: 16 / 9;
      }
      .itin-hotel-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .itin-hotel-card-body { padding: 12px 14px 12px 0; flex: 1; min-width: 0; }
      .itin-hotel-night {
        font-size: 8px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
        color: var(--itin-gold); margin: 0 0 4px;
      }
      .itin-hotel-name { margin: 0; font-size: 13px; font-weight: 800; color: var(--itin-navy); }
      .itin-hotel-loc { margin: 3px 0 0; font-size: 10px; color: var(--itin-muted); }
      .itin-hotel-meta { margin: 8px 0 0; font-size: 11px; color: var(--itin-ink); line-height: 1.45; }
      .itin-hotel-dates { margin: 4px 0 0; font-size: 11px; font-weight: 700; color: var(--itin-navy-mid); }

      /* Highlight gallery */
      .itin-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .itin-gallery-item { border-radius: 8px; overflow: hidden; border: 1px solid var(--itin-line); aspect-ratio: 16 / 9; }
      .itin-gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; background: #e8eaed; }
      .itin-gallery-cap { margin: 0; padding: 6px 8px; font-size: 9px; font-weight: 600; color: var(--itin-muted); background: #fafbfc; }

      /* Day-by-day plan: Single Unified Crisp White Cards */
      .itin-timeline {
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
        padding-left: 0 !important;
      }
      .itin-timeline::before { display: none !important; }

      .itin-day-card {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        position: relative;
      }

      .itin-day-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid #f1f5f9;
      }

      .itin-day-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 10px;
        border-radius: 6px;
        background: var(--itin-navy);
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .itin-day-header-text {
        flex: 1;
        min-width: 0;
      }

      .itin-day-title {
        margin: 0;
        font-size: 14.5px;
        font-weight: 800;
        color: var(--itin-navy);
        line-height: 1.35;
      }

      .itin-day-route {
        margin: 3px 0 0;
        font-size: 10.5px;
        font-weight: 600;
        color: var(--itin-gold);
      }

      .itin-day-card-content {
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }

      .itin-day-card-img {
        width: 160px;
        min-width: 160px;
        height: 110px;
        border-radius: 8px;
        aspect-ratio: 16 / 10;
        overflow: hidden;
        flex-shrink: 0;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
      }

      .itin-day-card-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .itin-day-card-text {
        flex: 1;
        min-width: 0;
      }

      .itin-day-para {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.6;
        color: var(--itin-muted);
        white-space: pre-wrap;
      }
      .itin-day-para:last-child {
        margin-bottom: 0;
      }

      /* Stay strip under day card */
      .itin-day-card-stay {
        margin-top: 12px;
        padding: 8px 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 11px;
      }
      .itin-day-card-stay-img {
        width: 48px;
        height: 36px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        background: #e2e8f0;
      }
      .itin-day-card-stay-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      /* Fallback destination & legacy stay styles */
      .itin-dest-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
      .itin-dest {
        display: flex; gap: 12px; padding: 10px; background: #ffffff;
        border: 1px solid #e2e8f0; border-radius: 8px;
      }
      .itin-dest-img {
        width: 140px; min-width: 140px; height: 95px; border-radius: 6px;
        aspect-ratio: 16 / 9; overflow: hidden; flex-shrink: 0; background: #e8eaed;
      }
      .itin-dest-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .itin-dest-name { margin: 0; font-size: 12.5px; font-weight: 800; color: var(--itin-navy); }
      .itin-dest-route { margin: 3px 0 0; font-size: 9.5px; font-weight: 600; color: var(--itin-gold); }
      .itin-dest-desc { margin: 6px 0 0; font-size: 12px; line-height: 1.55; color: var(--itin-muted); white-space: pre-wrap; }

      .itin-stay {
        margin-top: 10px; display: flex; gap: 12px; padding: 10px;
        background: #fff; border: 1px solid var(--itin-line); border-radius: 8px;
      }
      .itin-stay-img {
        width: 140px; min-width: 140px; height: 95px; border-radius: 6px;
        aspect-ratio: 16 / 9; overflow: hidden; flex-shrink: 0;
      }
      .itin-stay-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .itin-stay-label { margin: 0; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--itin-gold); }
      .itin-stay-name { margin: 4px 0 0; font-size: 12px; font-weight: 700; color: var(--itin-navy); }

      .itin-day-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
      .itin-day-photo { border-radius: 6px; overflow: hidden; border: 1px solid var(--itin-line); aspect-ratio: 16 / 9; }
      .itin-day-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

      /* Inclusions */
      .itin-inc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: stretch; }
      .itin-inc-box {
        display: flex; flex-direction: column; height: 100%;
        padding: 12px 14px; border-radius: 8px; border: 1px solid var(--itin-line);
      }
      .itin-inc-box--yes { background: #f0f7f4; border-color: #b8d4c8; }
      .itin-inc-box--no { background: #fafafa; }
      .itin-inc-head { margin: 0 0 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
      .itin-inc-box--yes .itin-inc-head { color: #166534; }
      .itin-inc-box--no .itin-inc-head { color: #991b1b; }
      .itin-inc-list { margin: 0; padding: 0; list-style: none; flex: 1; }
      .itin-inc-list li {
        position: relative; padding-left: 16px; margin-bottom: 6px;
        font-size: 12px; line-height: 1.5;
      }
      .itin-inc-box--yes .itin-inc-list li::before { content: "✓"; position: absolute; left: 0; color: #166534; font-weight: 800; }
      .itin-inc-box--no .itin-inc-list li::before { content: "×"; position: absolute; left: 0; color: #991b1b; font-weight: 800; }
      .itin-transfers { margin-top: 12px; padding: 12px; background: #f8f9fb; border-radius: 8px; border: 1px dashed var(--itin-line); }
      .itin-transfers-title { margin: 0 0 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--itin-navy); }

      /* Policies */
      .itin-policies { margin-top: 22px; padding: 16px; background: #f8f9fb; border-radius: 8px; border: 1px solid var(--itin-line); }
      .itin-policies-intro { margin: 0 0 14px; font-size: 11px; color: var(--itin-muted); line-height: 1.5; }
      .itin-policy { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--itin-line); }
      .itin-policy:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
      .itin-policy-title { margin: 0 0 6px; font-size: 13px; font-weight: 700; text-transform: none; color: var(--itin-navy); }
      .itin-policy-body { font-size: 12px; line-height: 1.65; color: var(--itin-muted); }
      .itin-policy-p { margin: 0 0 8px; }
      .itin-policy-bullet { margin: 0 0 8px; padding-left: 14px; position: relative; }
      .itin-policy-bullet::before { content: "•"; position: absolute; left: 0; color: var(--itin-gold); font-weight: 700; }

      /* Payment footer */
      .itin-pay-footer {
        margin-top: 24px; padding: 18px; background: var(--itin-navy); color: #fff;
        border-radius: 8px;
      }
      .itin-pay-title { margin: 0 0 10px; font-size: 13.5px; font-weight: 800; text-transform: none; color: var(--itin-gold-light); }
      .itin-pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; font-size: 12px; }
      .itin-pay-grid dt { font-weight: 700; opacity: 0.85; margin: 0; }
      .itin-pay-grid dd { margin: 0 0 6px; font-weight: 600; }
      .itin-pay-thanks { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; opacity: 0.9; line-height: 1.5; }

      .pdf-avoid-break { page-break-inside: avoid; }
      .pdf-keep-together { break-inside: avoid !important; page-break-inside: avoid !important; }
      .itin-letterhead { page-break-inside: avoid; }

      /* PDF capture + print: block layout (html2canvas-safe) */
      .itinerary-pdf-exporting .itinerary-pdf-export-wrap,
      .itin-pdf-sandbox {
        width: 718px !important; max-width: 718px !important;
        padding: 0 !important; margin: 0 !important;
      }
      .itinerary-pdf-exporting .itin-doc,
      .itin-pdf-sandbox .itin-doc {
        width: 718px !important; max-width: 718px !important; margin: 0 !important;
        box-sizing: border-box !important;
      }
      .itinerary-pdf-exporting .itin-letterhead,
      .itin-pdf-sandbox .itin-letterhead {
        display: block !important; overflow: hidden !important;
      }
      .itinerary-pdf-exporting .itin-letterhead-left,
      .itin-pdf-sandbox .itin-letterhead-left {
        display: block !important; margin-bottom: 10px !important;
      }
      .itinerary-pdf-exporting .itin-letterhead-right,
      .itin-pdf-sandbox .itin-letterhead-right {
        display: block !important; text-align: left !important;
      }
      .itinerary-pdf-exporting .itin-facts,
      .itin-pdf-sandbox .itin-facts {
        display: table !important; width: 100% !important;
        table-layout: fixed !important;
      }
      .itinerary-pdf-exporting .itin-fact,
      .itin-pdf-sandbox .itin-fact {
        display: table-cell !important; border-right: 1px solid var(--itin-line) !important;
      }
      .itinerary-pdf-exporting .itin-hotel-card,
      .itin-pdf-sandbox .itin-hotel-card {
        display: block !important; overflow: hidden !important;
      }
      .itinerary-pdf-exporting .itin-hotel-card-img,
      .itin-pdf-sandbox .itin-hotel-card-img {
        float: left !important; width: 150px !important; height: 108px !important;
        margin: 0 12px 8px 0 !important;
      }
      .itinerary-pdf-exporting .itin-hotel-card-body,
      .itin-pdf-sandbox .itin-hotel-card-body {
        display: block !important; overflow: hidden !important; padding: 12px 12px 12px 0 !important;
      }
      .itinerary-pdf-exporting .itin-dest,
      .itin-pdf-sandbox .itin-dest {
        display: block !important; overflow: hidden !important;
      }
      .itinerary-pdf-exporting .itin-dest-img,
      .itin-pdf-sandbox .itin-dest-img {
        float: left !important; width: 140px !important; height: 100px !important;
        margin: 0 12px 8px 0 !important;
      }
      .itinerary-pdf-exporting .itin-stay,
      .itin-pdf-sandbox .itin-stay {
        display: block !important; overflow: hidden !important;
      }
      .itinerary-pdf-exporting .itin-stay-img,
      .itin-pdf-sandbox .itin-stay-img {
        float: left !important; width: 140px !important; height: 100px !important;
        margin: 0 12px 8px 0 !important;
      }
      .itinerary-pdf-exporting .itin-day-card,
      .itin-pdf-sandbox .itin-day-card {
        display: block !important; background: #ffffff !important; border: 1px solid #e2e8f0 !important;
        margin-bottom: 14px !important; page-break-inside: avoid !important; break-inside: avoid !important;
      }
      .itinerary-pdf-exporting .itin-day-card-content,
      .itin-pdf-sandbox .itin-day-card-content {
        display: block !important;
      }
      .itinerary-pdf-exporting .itin-day-card-img,
      .itin-pdf-sandbox .itin-day-card-img {
        float: left !important; width: 150px !important; height: 105px !important;
        margin: 0 14px 8px 0 !important;
      }
      .itinerary-pdf-exporting .itin-day-card-text,
      .itin-pdf-sandbox .itin-day-card-text {
        overflow: hidden !important;
      }
      .itinerary-pdf-exporting .itin-day-card-stay,
      .itin-pdf-sandbox .itin-day-card-stay {
        clear: both !important; display: block !important;
      }
      .itinerary-pdf-exporting .itin-timeline-item,
      .itin-pdf-sandbox .itin-timeline-item {
        display: block !important; position: relative !important;
      }
      .itinerary-pdf-exporting .itin-timeline-item::before,
      .itin-pdf-sandbox .itin-timeline-item::before { display: none !important; }
      .itinerary-pdf-exporting .itin-gallery,
      .itin-pdf-sandbox .itin-gallery {
        display: block !important; font-size: 0 !important;
      }
      .itinerary-pdf-exporting .itin-gallery-item,
      .itin-pdf-sandbox .itin-gallery-item {
        display: inline-block !important; width: 48% !important; vertical-align: top !important;
        margin: 0 2% 10px 0 !important; font-size: 11px !important;
      }
      .itinerary-pdf-exporting .itin-inc-grid,
      .itin-pdf-sandbox .itin-inc-grid {
        display: block !important;
      }
      .itinerary-pdf-exporting .itin-inc-box,
      .itin-pdf-sandbox .itin-inc-box {
        display: block !important; width: 100% !important; margin-bottom: 10px !important;
      }
      .itinerary-pdf-exporting .itin-day-photos,
      .itin-pdf-sandbox .itin-day-photos {
        display: block !important; font-size: 0 !important;
      }
      .itinerary-pdf-exporting .itin-day-photo,
      .itin-pdf-sandbox .itin-day-photo {
        display: inline-block !important; width: 31% !important; margin-right: 2% !important;
        font-size: 11px !important; vertical-align: top !important;
      }
      .itinerary-pdf-exporting .itin-pay-grid,
      .itin-pdf-sandbox .itin-pay-grid {
        display: block !important;
      }
      .itinerary-pdf-exporting .itin-pay-grid dt,
      .itin-pdf-sandbox .itin-pay-grid dt {
        display: inline !important; margin-right: 6px !important;
      }
      .itinerary-pdf-exporting .itin-pay-grid dd,
      .itin-pdf-sandbox .itin-pay-grid dd {
        display: inline !important; margin-right: 16px !important;
      }

      .itin-day, .itin-hotel-card, .itin-dest, .itin-stay {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      @media print {
        @page { size: A4 portrait; margin: 10mm; }
        body { background: #fff !important; }
        .noPrint { display: none !important; }
        .itinerary-pdf-export-wrap {
          max-width: none !important; width: 100% !important; padding: 0 !important;
        }
        .itin-doc { width: 100% !important; max-width: 100% !important; }
        .itin-letterhead { display: block !important; }
        .itin-hotel-card, .itin-dest, .itin-stay { overflow: hidden !important; }
        .itin-hotel-card-img, .itin-dest-img, .itin-stay-img { float: left !important; }
      }

      @media (max-width: 640px) {
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itin-facts { grid-template-columns: 1fr 1fr; }
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itin-inc-grid,
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itin-gallery { grid-template-columns: 1fr; }
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itin-hotel-card { flex-direction: column; }
        .itinerary-pdf-root:not(.itinerary-pdf-exporting) .itin-hotel-card-img { width: 100%; min-width: 0; height: 140px; }
      }
    `}</style>
  );
}
