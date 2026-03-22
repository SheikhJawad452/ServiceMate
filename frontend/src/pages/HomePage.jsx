import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/home/HeroSection";
import MainCta from "@/components/home/MainCta";
import PopularServices from "@/components/home/PopularServices";
import StartupFooter from "@/components/home/StartupFooter";
import TopTechnicians from "@/components/home/TopTechnicians";
import TrustStrip from "@/components/home/TrustStrip";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import { useAuth } from "@/context/AuthContext";
import useTechnicians from "@/hooks/useTechnicians";

function UserHome() {
  const { technicians, loading } = useTechnicians();

  return (
    <>
      <HeroSection />
      <TrustStrip technicians={technicians} />
      <PopularServices />
      <WhyChooseUs />
      {loading ? (
        <section className="py-16">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Loading top technicians...
            </div>
          </div>
        </section>
      ) : (
        <TopTechnicians technicians={technicians} />
      )}
      <MainCta />
      <StartupFooter />
    </>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const isTechnician = user?.role === "technician";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50 text-slate-900">
      {isTechnician ? (
        <section className="py-16">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <h1 className="text-2xl font-bold text-primary">Technician workspace moved</h1>
              <p className="mt-2 text-slate-600">Use your new unified workspace to manage bookings, services, and portfolio.</p>
              <div className="mt-4">
                <Button asChild variant="accent">
                  <Link to="/technician">Go to Workspace</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <UserHome />
      )}
    </main>
  );
}
