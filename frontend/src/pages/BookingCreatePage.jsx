import { CalendarDays, Clock3, Info, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useNavigateWithLoader from "@/hooks/useNavigateWithLoader";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

const timeSlots = [
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
];

export default function BookingCreatePage() {
  const navigate = useNavigateWithLoader();
  const [searchParams] = useSearchParams();
  const technicianId = searchParams.get("technicianId") || "";

  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    serviceId: "",
    date: "",
    slot: "",
    contactNumber: "",
    country: "",
    state: "",
    city: "",
    addressLine: "",
    postalCode: "",
    mapUrl: "",
    note: "",
  });

  useEffect(() => {
    if (!technicianId) {
      setLoading(false);
      setError("Missing technicianId in URL.");
      return;
    }
    const controller = new AbortController();
    const loadTechnician = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/technicians/${technicianId}`, { signal: controller.signal });
        const data = response?.data || null;
        setTechnician(data);
        setForm((prev) => ({
          ...prev,
          country: data?.location?.country || "",
          state: data?.location?.state || "",
          city: data?.location?.city || "",
        }));
      } catch (apiError) {
        if (apiError.name !== "CanceledError") {
          setError(apiError?.message || "Unable to load technician details.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadTechnician();
    return () => controller.abort();
  }, [technicianId]);

  useEffect(() => {
    const controller = new AbortController();
    const loadUserProfile = async () => {
      try {
        const profileResponse = await api.get("/user/profile", { signal: controller.signal });
        const profilePhone = profileResponse?.data?.user?.phone || "";
        if (profilePhone) {
          const normalizedPhone = String(profilePhone).replace(/\D/g, "");
          setForm((prev) => ({ ...prev, contactNumber: normalizedPhone }));
        }
      } catch {
        // Keep field editable and empty if profile fetch fails.
      }
    };

    loadUserProfile();
    return () => controller.abort();
  }, []);

  const selectedService = useMemo(
    () => (technician?.services || []).find((item) => item._id === form.serviceId),
    [form.serviceId, technician],
  );

  const onInputChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!selectedService || !form.slot) {
      setError("Please select a service and time slot.");
      return;
    }
    const normalizedPhone = String(form.contactNumber || "").trim();
    if (!/^[0-9]{10,15}$/.test(normalizedPhone)) {
      setError("Please enter a valid contact number (10 to 15 digits).");
      return;
    }
    const normalizedMapUrl = String(form.mapUrl || "").trim();
    if (normalizedMapUrl && !/^https?:\/\/\S+$/i.test(normalizedMapUrl)) {
      setError("Please provide a valid Google Maps URL.");
      return;
    }

    const [startTime, endTime] = form.slot.split("|");
    setSubmitting(true);
    setError("");
    try {
      await api.post("/bookings", {
        technician: technicianId,
        service: form.serviceId,
        scheduledDate: form.date,
        startTime,
        endTime,
        location: {
          country: form.country,
          state: form.state,
          city: form.city,
          addressLine: form.addressLine,
          postalCode: form.postalCode,
        },
        phone: normalizedPhone,
        mapUrl: normalizedMapUrl || undefined,
        notes: form.note,
        totalPrice: Number(selectedService?.price || 0),
      });
      navigate("/user/dashboard", { replace: true });
    } catch (apiError) {
      setError(apiError?.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 text-sm text-slate-600">Loading booking form...</main>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50 px-4 py-10 text-slate-900 sm:px-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Book Technician</h1>
        <p className="mt-1 text-sm text-slate-600">
          {technician?.user?.fullName ? `Booking with ${technician.user.fullName}` : "Complete your booking details."}
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Select service</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              value={form.serviceId}
              onChange={(event) => onInputChange("serviceId", event.target.value)}
              required
            >
              <option value="">Choose service</option>
              {(technician?.services || []).map((service) => (
                <option key={service._id} value={service._id}>
                  {service.serviceName} - ₹{service.price ?? 0}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays className="h-4 w-4 text-primary" /> Select date
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
                type="date"
                value={form.date}
                onChange={(event) => onInputChange("date", event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock3 className="h-4 w-4 text-primary" /> Select time slot
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
                value={form.slot}
                onChange={(event) => onInputChange("slot", event.target.value)}
                required
              >
                <option value="">Choose time slot</option>
                {timeSlots.map((slot) => (
                  <option key={`${slot.start}-${slot.end}`} value={`${slot.start}|${slot.end}`}>
                    {slot.start} - {slot.end}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="flex items-start gap-2 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            Note: If the technician is busy during the selected time, they may contact you to reschedule. Please
            provide your working contact number below.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Contact Number</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              type="tel"
              inputMode="numeric"
              placeholder="Enter your phone number"
              value={form.contactNumber}
              onChange={(event) => onInputChange("contactNumber", event.target.value.replace(/\D/g, ""))}
              required
            />
            <p className="mt-1 text-xs text-slate-500">Use 10 to 15 digits.</p>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <MapPin className="h-4 w-4 text-primary" /> Address
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
                placeholder="Country"
                value={form.country}
                onChange={(event) => onInputChange("country", event.target.value)}
                required
              />
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
                placeholder="State"
                value={form.state}
                onChange={(event) => onInputChange("state", event.target.value)}
                required
              />
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
                placeholder="City"
                value={form.city}
                onChange={(event) => onInputChange("city", event.target.value)}
                required
              />
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
                placeholder="Postal code"
                value={form.postalCode}
                onChange={(event) => onInputChange("postalCode", event.target.value)}
                required
              />
            </div>
            <input
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              placeholder="Street address"
              value={form.addressLine}
              onChange={(event) => onInputChange("addressLine", event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Note</label>
            <textarea
              className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              placeholder="Add any booking note"
              value={form.note}
              onChange={(event) => onInputChange("note", event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Location (Google Maps URL) — Optional
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              type="url"
              placeholder="Paste your location link (optional)"
              value={form.mapUrl}
              onChange={(event) => onInputChange("mapUrl", event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="text-slate-600">Estimated total</span>
            <strong className="text-accent">₹{selectedService?.price ?? 0}</strong>
          </div>
          <p className="text-xs text-slate-500">
            Note: The displayed price is an estimated amount. The final cost will be determined on-site based on the
            actual work required.
          </p>

          <div className="flex gap-3">
            <Button asChild className="flex-1" variant="outline">
              <Link to={technicianId ? `/technician/${technicianId}` : "/technicians"}>Cancel</Link>
            </Button>
            <Button className="flex-1" variant="accent" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Booking"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
