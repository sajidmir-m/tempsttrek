export const DEFAULT_ITINERARY_POLICIES = {
  disclaimer: `Important notice

This itinerary is prepared for planning and quotation purposes. Hotel names, room categories, and timings are subject to confirmation at the time of booking. Final confirmation with voucher and invoice will be shared on email/WhatsApp after advance receipt.`,

  terms_conditions: `Terms & conditions

1. Check-in / check-out: Standard hotel check-in 2:00 PM; check-out 12:00 PM unless otherwise agreed in writing.
2. Airport reporting: Guests must report at the airport at least 2 hours before domestic departure.
3. Vehicle usage: The dedicated vehicle remains with the group for the confirmed route and dates. Delays caused by guest preference may affect the day plan.
4. Houseboat / hotel services: Any complaint regarding room, meal, or service must be reported to our office or hotel duty manager during the stay — not after checkout.
5. Unforeseen events: We are not liable for delays due to weather, road closures, strikes, or government restrictions. Alternate arrangements will be offered where possible.
6. Personal expenses: Entry tickets, pony rides, gondola, rafting, tips, laundry, and meals not mentioned in inclusions are payable directly by guests.
7. Identification: Valid government photo ID is mandatory for all guests at hotels and for air travel.`,

  cancellation_policy: `Cancellation & refund policy

• 30 days or more before travel date: 25% of total package cost.
• 15–29 days before travel date: 50% of total package cost.
• 14 days or less / no-show: 100% of total package cost.
• Advance deposit (minimum 30%): Non-refundable once hotels and transport are blocked.
• Refunds, if applicable, are processed within 7–14 working days to the original payment mode.`,

  how_to_reach: `How to reach Kashmir

By air — Srinagar International Airport (SXR) with direct and connecting flights from major Indian cities.

By rail — Jammu Tawi Railway Station, then road transfer to Srinagar (approx. 8–10 hours).

By road — Srinagar is connected via NH-44 from Jammu; self-drive and volvo services available from Delhi and Chandigarh.

Our representative will meet guests at Srinagar airport / agreed pickup point as per the confirmed arrival details.`,
};

export function policiesForPdf(sections: {
  disclaimer?: string;
  terms_conditions?: string;
  cancellation_policy?: string;
  how_to_reach?: string;
}) {
  return {
    disclaimer: sections.disclaimer?.trim() || DEFAULT_ITINERARY_POLICIES.disclaimer,
    terms_conditions: sections.terms_conditions?.trim() || DEFAULT_ITINERARY_POLICIES.terms_conditions,
    cancellation_policy: sections.cancellation_policy?.trim() || DEFAULT_ITINERARY_POLICIES.cancellation_policy,
    how_to_reach: sections.how_to_reach?.trim() || DEFAULT_ITINERARY_POLICIES.how_to_reach,
  };
}
