import { motion } from "framer-motion";
import AuthNavbar from "@/components/common/AuthNavbar";
import acTechnicianImage from "@/assets/acTech.svg";
import electricianImage from "@/assets/electrician2.svg";
import plumberImage from "@/assets/realPlumber.svg";
import washingMachineTechnicianImage from "@/assets/washingMachine-techinician.svg";

const floatingItems = [
  {
    src: plumberImage,
    alt: "Plumber",
    className: "left-[12%] top-[16%] h-24 w-24 lg:h-28 lg:w-28 rounded-xl",
    duration: 8.5,
    delay: 0,
  },
  {
    src: electricianImage,
    alt: "Electrician",
    className: "right-[16%] top-[24%] h-20 w-20 lg:h-24 lg:w-24 rounded-xl",
    duration: 9.5,
    delay: 0.4,
  },
  {
    src: acTechnicianImage,
    alt: "AC Technician",
    className: "left-[20%] bottom-[14%] h-20 w-20 lg:h-24 lg:w-24 rounded-xl",
    duration: 10.2,
    delay: 0.2,
  },
  {
    src: washingMachineTechnicianImage,
    alt: "Washing Machine Technician",
    className: "right-[14%] bottom-[18%] h-20 w-20 lg:h-24 lg:w-24 rounded-xl",
    duration: 9.1,
    delay: 0.35,
  },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="relative min-h-screen bg-slate-50">
      <AuthNavbar />
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[1200px] items-center justify-center p-6 md:p-8">
        <div className="grid w-full max-w-[1200px] overflow-hidden rounded-3xl bg-white shadow-2xl lg:min-h-[70vh] lg:max-h-[85vh] lg:grid-cols-2">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] p-8 text-white sm:p-10 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-16 top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-20 right-20 h-52 w-52 rounded-full bg-[#F97316]/25 blur-3xl" />
            {floatingItems.map((item) => (
              <motion.img
                key={item.alt}
                src={item.src}
                alt={item.alt}
                className={`absolute select-none object-contain opacity-20 lg:opacity-25 ${item.className}`}
                loading="lazy"
                decoding="async"
                draggable={false}
                animate={{ y: [-12, 10, -12], rotate: [-2, 2, -2] }}
                transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">ServiceMate</p>
            </div>
            <div className="relative z-10 max-w-md">
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl">Find Trusted Local Services</h2>
              <p className="mt-4 text-base text-blue-100">
                Book verified technicians near you in minutes with a smooth and reliable experience.
              </p>
            </div>
          </section>

          <section className="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 sm:pb-8">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full max-w-md"
            >
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
              <div className="mt-4">{children}</div>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}
