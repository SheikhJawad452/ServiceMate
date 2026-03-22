import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import realAcTech from "@/assets/realImages/realAcTech.png";
import realElecTech from "@/assets/realImages/realElecTech.png";
import realPlumTech from "@/assets/realImages/realPlumTech.png";
import realWashTech from "@/assets/realImages/realWashTech.png";

const serviceCards = [
  {
    key: "ac",
    title: "AC Repair",
    desc: "Reliable AC servicing and repair support.",
    image: realAcTech,
    serviceQuery: "AC Repair",
  },
  {
    key: "electrical",
    title: "Electrical",
    desc: "Safe electrical fixes by verified experts.",
    image: realElecTech,
    serviceQuery: "Electrical",
  },
  {
    key: "plumbing",
    title: "Plumbing",
    desc: "Quick help for leakage and fitting work.",
    image: realPlumTech,
    serviceQuery: "Plumbing",
  },
  {
    key: "appliance",
    title: "Appliance Repair",
    desc: "Fast appliance diagnosis and repair.",
    image: realWashTech,
    serviceQuery: "Appliance Repair",
  },
];

export default function PopularServices() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-7xl px-6">
        <h2 className="mb-8 text-3xl font-bold text-[#1E3A8A]">Popular Services</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCards.map((item, index) => (
            <motion.article
              key={item.key}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
            >
              <Link to={`/technicians?service=${encodeURIComponent(item.serviceQuery)}`} className="block">
                <div className="aspect-[16/9] overflow-hidden bg-slate-50">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
