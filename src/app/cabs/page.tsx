import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { Car, MapPin, Clock, Phone } from "lucide-react";
import { CAB_PLANS } from "@/data/cabs";

const VEHICLE_TYPES = [
  {
    name: "Sedan",
    seats: "4–5 Seater",
    bestFor: "Couples & Small Families",
    examples: "Etios / Dzire / Similar",
  },
  {
    name: "SUV",
    seats: "6–7 Seater",
    bestFor: "Families & Groups",
    examples: "Innova / Ertiga / Similar",
  },
  {
    name: "Tempo Traveller",
    seats: "12–14 Seater",
    bestFor: "Large Groups & Corporate Trips",
    examples: "Luxury Traveller",
  },
];

export default function CabsPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal width="100%">
            <div className="text-center mb-12">
              <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">
                Cabs & Transfers
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Private Cabs for Your Kashmir Trip
              </h1>
              <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full" />
              <p className="text-gray-800 mt-4 max-w-2xl mx-auto">
                Door-to-door private cabs with professional local drivers. Airport pickups, day trips and
                full tour cab packages – all in one place.
              </p>
            </div>
          </ScrollReveal>

          {/* Vehicle Types */}
          <ScrollReveal width="100%">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {VEHICLE_TYPES.map((v) => (
                <div
                  key={v.name}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-2"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <Car size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{v.name}</h2>
                  </div>
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">Seats:</span> {v.seats}
                  </p>
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">Best for:</span> {v.bestFor}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    <span className="font-semibold">Examples:</span> {v.examples}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Cab Plans */}
          <ScrollReveal width="100%">
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                  Best-Selling Routes
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mt-1">
                  Popular Cab Plans
                </h2>
              </div>
              <p className="text-sm md:text-base text-teal-700 bg-teal-50 border border-teal-100 px-4 py-2 rounded-xl">
                Note: Prices are indicative and vary by season. Contact us for today&apos;s best deal.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {CAB_PLANS.map((plan, index) => (
              <ScrollReveal key={plan.name} delay={index * 0.1}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-700 mt-1 flex items-center gap-1">
                        <Clock size={14} /> {plan.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-wide text-gray-700">Starting from</p>
                      <p className="text-lg font-bold text-teal-600">{plan.startingFrom}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800">{plan.description}</p>
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">Ideal for:</span> {plan.idealFor}
                  </p>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <MapPin size={14} /> Route overview
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plan.routes.map((r) => (
                        <span
                          key={r}
                          className="px-2.5 py-1 text-[11px] rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA */}
          <ScrollReveal width="100%" delay={0.2}>
            <div className="mt-16 bg-teal-600 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Need a Cab for Your Kashmir Trip?</h2>
                <p className="text-sm md:text-base text-teal-50">
                  Share your dates and route. We&apos;ll suggest the best vehicle type, send you prices and help
                  you finalize everything on WhatsApp or call.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-700 text-sm font-semibold hover:bg-teal-50 transition-colors"
                >
                  <Phone size={16} /> Request Cab Quote
                </Link>
                <a
                  href="https://wa.me/917006796123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/60 text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Our WhatsApp: +91 7006796123
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}


