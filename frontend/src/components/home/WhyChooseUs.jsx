import { motion } from "framer-motion";
import { Clock3, Lock, ShieldCheck, Wallet } from "lucide-react";

const whyChooseUs = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    desc: "Trusted technicians with verified profiles.",
  },
  {
    icon: Wallet,
    title: "Transparent Pricing",
    desc: "Clear pricing with no hidden charges.",
  },
  {
    icon: Clock3,
    title: "Quick Service",
    desc: "Faster booking and on-time support.",
  },
  {
    icon: Lock,
    title: "Secure Platform",
    desc: "Safe payments and reliable assistance.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-7xl px-6">
        <h2 className="mb-8 text-3xl font-bold text-[#1E3A8A]">Why Choose Us</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-[2px] hover:shadow-md"
            >
              <item.icon className="h-5 w-5 text-[#F97316]" />
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
