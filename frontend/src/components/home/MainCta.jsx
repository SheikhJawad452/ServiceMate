import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MainCta() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-10 py-12 shadow-md">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">Need Help Now?</h2>
              <p className="mt-2 text-white/80">Book a technician instantly</p>
            </div>
            <Button asChild className="rounded-xl bg-white px-6 py-3 font-semibold text-orange-600 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100">
              <Link to="/technicians">Find Technician</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
