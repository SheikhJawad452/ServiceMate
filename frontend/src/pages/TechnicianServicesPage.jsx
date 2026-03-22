import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

const serviceSuggestions = [
  "Plumbing",
  "AC Repair",
  "Electrician",
  "Cleaning",
  "Washing Machine Repair",
  "Fridge Repair",
];

export default function TechnicianServicesPage() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    description: "",
    price: "",
  });
  const [editingServiceId, setEditingServiceId] = useState("");
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);

  const fetchDashboardData = async () => {
    setError("");
    try {
      const servicesRes = await api.get("/services/mine");
      setServices(servicesRes?.data || []);
    } catch (apiError) {
      setError(apiError?.message || "Failed to load services.");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredServiceSuggestions = useMemo(() => {
    const query = serviceForm.serviceName.trim().toLowerCase();
    if (!query) return serviceSuggestions;
    return serviceSuggestions.filter((item) => item.toLowerCase().includes(query));
  }, [serviceForm.serviceName]);

  const submitService = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        serviceName: serviceForm.serviceName,
        description: serviceForm.description,
        price: Number(serviceForm.price),
      };
      if (editingServiceId) {
        await api.patch(`/services/${editingServiceId}`, payload);
        setMessage("Service updated.");
      } else {
        await api.post("/services", payload);
        setMessage("Service added.");
      }
      setServiceForm({ serviceName: "", description: "", price: "" });
      setEditingServiceId("");
      setShowServiceSuggestions(false);
      fetchDashboardData();
    } catch (apiError) {
      setError(apiError?.message || "Failed to save service.");
    }
  };

  const startEditService = (service) => {
    setEditingServiceId(service._id);
    setServiceForm({
      serviceName: service.serviceName || "",
      description: service.description || "",
      price: String(service.price ?? ""),
    });
    setShowServiceSuggestions(false);
  };

  const deleteService = async (serviceId) => {
    setMessage("");
    setError("");
    try {
      await api.delete(`/services/${serviceId}`);
      setMessage("Service deleted.");
      fetchDashboardData();
    } catch (apiError) {
      setError(apiError?.message || "Failed to delete service.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-primary">Manage Services</h1>
          <p className="mt-1 text-sm text-slate-500">Add, update, or delete services and pricing.</p>
          {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <form className="grid gap-3 md:grid-cols-[1fr_1.5fr_140px_auto]" onSubmit={submitService}>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Service name"
                value={serviceForm.serviceName}
                onChange={(event) => {
                  setServiceForm((prev) => ({ ...prev, serviceName: event.target.value }));
                  setShowServiceSuggestions(true);
                }}
                onFocus={() => setShowServiceSuggestions(true)}
                onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 120)}
                required
              />
              {showServiceSuggestions && filteredServiceSuggestions.length > 0 ? (
                <div className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg transition-all duration-200">
                  {filteredServiceSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setServiceForm((prev) => ({ ...prev, serviceName: item }));
                        setShowServiceSuggestions(false);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Description"
              value={serviceForm.description}
              onChange={(event) => setServiceForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="number"
              min="0"
              placeholder="Price"
              value={serviceForm.price}
              onChange={(event) => setServiceForm((prev) => ({ ...prev, price: event.target.value }))}
              required
            />
            <Button type="submit" variant="accent">
              {editingServiceId ? "Update" : "Add"}
            </Button>
          </form>

          <div className="mt-4 space-y-3">
            {services.map((service) => (
              <article
                key={service._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
              >
                <div>
                  <p className="font-semibold text-slate-800">{service.serviceName}</p>
                  <p className="text-sm text-slate-500">{service.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-accent">₹{service.price ?? 0}</span>
                  <Button size="sm" variant="outline" onClick={() => startEditService(service)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteService(service._id)}>
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
