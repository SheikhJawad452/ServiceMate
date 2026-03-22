import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

const statusClassMap = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  rejected: "bg-slate-200 text-slate-700",
};

const BOOKING_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const bookingSkeletons = [1, 2, 3];

export default function TechnicianBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [downloadLoadingId, setDownloadLoadingId] = useState("");
  const [statusActionLoading, setStatusActionLoading] = useState({ bookingId: "", action: "" });
  const [completeModalBooking, setCompleteModalBooking] = useState(null);
  const [completingBooking, setCompletingBooking] = useState(false);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [billItems, setBillItems] = useState([{ name: "", price: "" }]);
  const [profileMissing, setProfileMissing] = useState(false);

  const fetchDashboardData = async () => {
    setError("");
    setProfileMissing(false);
    setBookingsLoading(true);
    try {
      const bookingsRes = await api.get("/bookings/technician");
      setBookings(bookingsRes?.data || []);
      try {
        await api.get("/technicians/me/profile");
      } catch (profileError) {
        if (String(profileError?.message || "").toLowerCase().includes("technician profile not found")) {
          setProfileMissing(true);
        }
      }
    } catch (apiError) {
      setError(apiError?.message || "Failed to load bookings.");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const normalizeStatus = (status) => String(status || "").toLowerCase();

  const bookingCounts = useMemo(() => {
    let pending = 0;
    let ongoing = 0;
    let completed = 0;
    let cancelled = 0;

    bookings.forEach((item) => {
      const status = normalizeStatus(item.status);
      if (status === "pending") pending += 1;
      if (status === "accepted" || status === "in-progress") ongoing += 1;
      if (status === "completed") completed += 1;
      if (status === "cancelled") cancelled += 1;
    });

    return {
      all: bookings.length,
      pending,
      ongoing,
      completed,
      cancelled,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeTab === "all") return bookings;
    if (activeTab === "pending") {
      return bookings.filter((item) => normalizeStatus(item.status) === "pending");
    }
    if (activeTab === "ongoing") {
      return bookings.filter((item) => {
        const status = normalizeStatus(item.status);
        return status === "accepted" || status === "in-progress";
      });
    }
    if (activeTab === "completed") {
      return bookings.filter((item) => normalizeStatus(item.status) === "completed");
    }
    if (activeTab === "cancelled") {
      return bookings.filter((item) => normalizeStatus(item.status) === "cancelled");
    }
    return bookings;
  }, [activeTab, bookings]);

  const updateBookingStatus = async (bookingId, status) => {
    setMessage("");
    setStatusActionLoading({ bookingId, action: status });
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      setMessage(`Booking ${status.toLowerCase()} successfully.`);
      fetchDashboardData();
    } catch (apiError) {
      setError(apiError?.message || "Failed to update booking status.");
    } finally {
      setStatusActionLoading({ bookingId: "", action: "" });
    }
  };

  const openCompleteModal = (booking) => {
    setCompleteModalBooking(booking);
    const baseServicePrice = Number(booking?.service?.price ?? booking?.totalPrice ?? 0);
    setServiceCharge(Number.isFinite(baseServicePrice) ? baseServicePrice : 0);
    setBillItems([{ name: "", price: "" }]);
    setError("");
  };

  const closeCompleteModal = () => {
    setCompleteModalBooking(null);
    setServiceCharge(0);
    setBillItems([{ name: "", price: "" }]);
    setCompletingBooking(false);
  };

  const updateBillItem = (index, key, value) => {
    setBillItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)));
  };

  const addBillItem = () => {
    setBillItems((prev) => [...prev, { name: "", price: "" }]);
  };

  const removeBillItem = (index) => {
    setBillItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };

  const additionalItemsTotal = useMemo(
    () =>
      billItems.reduce((sum, item) => {
        const value = Number(item.price);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0),
    [billItems],
  );

  const autoTotalAmount = useMemo(
    () => Number(serviceCharge || 0) + additionalItemsTotal,
    [serviceCharge, additionalItemsTotal],
  );

  const completeBookingWithBill = async () => {
    if (!completeModalBooking) return;
    const normalizedServiceCharge = Number(serviceCharge);
    if (!Number.isFinite(normalizedServiceCharge) || normalizedServiceCharge < 0) {
      setError("Service charge is required.");
      return;
    }

    const cleanedItems = billItems.map((item) => ({ name: String(item.name || "").trim(), price: Number(item.price) }));
    const hasInvalidItem = cleanedItems.some((item) => !item.name || Number.isNaN(item.price) || item.price < 0);
    if (hasInvalidItem) {
      setError("Each item must include valid name and amount.");
      return;
    }

    setCompletingBooking(true);
    setError("");
    try {
      await api.patch(`/bookings/complete/${completeModalBooking._id}`, {
        serviceCharge: normalizedServiceCharge,
        items: cleanedItems,
      });
      toast.success("Booking marked as completed with final bill.");
      closeCompleteModal();
      fetchDashboardData();
    } catch (apiError) {
      setError(apiError?.message || "Failed to complete booking.");
      toast.error(apiError?.message || "Failed to complete booking.");
    } finally {
      setCompletingBooking(false);
    }
  };

  const downloadBookingDetailsPdf = async (booking) => {
    setDownloadLoadingId(booking._id);
    toast.success("Downloading...");
    try {
      const response = await api.get(`/bookings/${booking._id}/pdf`, { responseType: "blob" });
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");

      if (isMobile) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `booking-${booking._id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.URL.revokeObjectURL(url);
    } catch (apiError) {
      setError(apiError?.message || "Failed to download booking PDF.");
      toast.error(apiError?.message || "Failed to download booking PDF.");
    } finally {
      setDownloadLoadingId("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-primary">Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">Track requests by status and update booking progress.</p>
          {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          {profileMissing ? (
            <p className="mt-2 text-sm text-red-600">
              Technician profile not found. Create a profile first.{" "}
              <Link
                to="/complete-profile"
                className="cursor-pointer font-medium text-orange-500 transition hover:text-orange-600 hover:underline"
              >
                Click here
              </Link>{" "}
              to register →
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <div className="mt-1 flex flex-wrap gap-2">
            {BOOKING_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} ({bookingCounts[tab.key] ?? 0})
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {bookingsLoading
              ? bookingSkeletons.map((item) => (
                  <div key={item} className="animate-pulse rounded-xl border border-slate-200 p-4 shadow-md">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-56 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-64 rounded bg-slate-200" />
                  </div>
                ))
              : null}

            {!bookingsLoading && filteredBookings.length === 0 ? (
              <p className="text-sm text-slate-500">
                {activeTab === "all" ? "No bookings available" : "No bookings found in this category"}
              </p>
            ) : null}

            {!bookingsLoading
              ? filteredBookings.map((booking) => {
                  const status = normalizeStatus(booking.status);
                  const statusClass = statusClassMap[status] || "bg-slate-100 text-slate-700";
                  const address = [
                    booking?.location?.addressLine,
                    booking?.location?.city,
                    booking?.location?.state,
                    booking?.location?.country,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <article
                      key={booking._id}
                      className="rounded-xl border border-slate-200 p-4 shadow-md transition duration-300 hover:scale-[1.01] hover:shadow-lg"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800">{booking?.user?.fullName || "Customer"}</p>
                          <p className="text-sm text-slate-600">{booking?.service?.serviceName || "Service"}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {new Date(booking.scheduledDate).toLocaleDateString()} | {booking.startTime} -{" "}
                            {booking.endTime}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">Contact: {booking?.phone || "Not provided"}</p>
                          <p className="mt-1 text-sm text-slate-500">{address || "Address not provided"}</p>
                          {booking?.mapUrl ? (
                            <a
                              className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
                              href={booking.mapUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Location
                            </a>
                          ) : null}
                          <p className="mt-1 text-sm font-semibold text-accent">₹{booking?.totalPrice ?? 0}</p>
                          {status === "completed" && booking?.finalAmount !== undefined ? (
                            <p className="mt-1 text-sm font-semibold text-emerald-700">
                              Final Amount: ₹{booking.finalAmount}
                            </p>
                          ) : null}
                          {status === "completed" && Array.isArray(booking?.billItems) && booking.billItems.length > 0 ? (
                            <div className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                              <p className="font-semibold text-slate-700">Final Bill</p>
                              <ul className="mt-1 space-y-1">
                                <li className="flex justify-between gap-2">
                                  <span>Service Charge</span>
                                  <span>₹{booking?.serviceCharge ?? 0}</span>
                                </li>
                                {booking.billItems.map((item, idx) => (
                                  <li key={`${item.name}-${idx}`} className="flex justify-between gap-2">
                                    <span>{item.name}</span>
                                    <span>₹{item.price}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}>
                          {status}
                        </span>
                      </div>

                      {status === "accepted" || status === "in-progress" || status === "completed" ? (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={downloadLoadingId === booking._id}
                            onClick={() => downloadBookingDetailsPdf(booking)}
                          >
                            {downloadLoadingId === booking._id ? "Downloading..." : "Download Details"}
                          </Button>
                        </div>
                      ) : null}

                      {status === "pending" ? (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={statusActionLoading.bookingId === booking._id}
                            onClick={() => updateBookingStatus(booking._id, "Rejected")}
                          >
                            {statusActionLoading.bookingId === booking._id && statusActionLoading.action === "Rejected"
                              ? "Rejecting..."
                              : "Reject"}
                          </Button>
                          <Button
                            size="sm"
                            variant="accent"
                            disabled={statusActionLoading.bookingId === booking._id}
                            onClick={() => updateBookingStatus(booking._id, "Accepted")}
                          >
                            {statusActionLoading.bookingId === booking._id && statusActionLoading.action === "Accepted"
                              ? "Accepting..."
                              : "Accept"}
                          </Button>
                        </div>
                      ) : null}

                      {status === "accepted" || status === "in-progress" ? (
                        <div className="mt-3">
                          <Button size="sm" variant="accent" onClick={() => openCompleteModal(booking)}>
                            Mark as completed
                          </Button>
                        </div>
                      ) : null}
                    </article>
                  );
                })
              : null}
          </div>
        </section>
      </div>

      {completeModalBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Complete Booking & Add Final Bill</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add bill items for {completeModalBooking?.user?.fullName || "customer"}.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Service Charge</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  type="number"
                  min="0"
                  value={serviceCharge}
                  onChange={(event) => setServiceCharge(event.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">You can adjust the service charge based on actual work.</p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Line Items</label>
                  <Button size="sm" variant="outline" type="button" onClick={addBillItem}>
                    + Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {billItems.map((item, index) => (
                    <div key={`bill-item-${index}`} className="grid grid-cols-[1fr_140px_auto] gap-2">
                      <input
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Item Name"
                        value={item.name}
                        onChange={(event) => updateBillItem(index, "name", event.target.value)}
                      />
                      <input
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        type="number"
                        min="0"
                        placeholder="Amount"
                        value={item.price}
                        onChange={(event) => updateBillItem(index, "price", event.target.value)}
                      />
                      <Button size="sm" variant="outline" type="button" onClick={() => removeBillItem(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-600">Service Charge:</span>
                  <span className="font-medium">₹{serviceCharge}</span>
                </p>
                <p className="mt-1 flex justify-between">
                  <span className="text-slate-600">Additional Items:</span>
                  <span className="font-medium">₹{additionalItemsTotal}</span>
                </p>
                <div className="mt-2 border-t border-slate-300 pt-2">
                  <p className="flex justify-between font-semibold text-primary">
                    <span>Total Amount:</span>
                    <span>₹{autoTotalAmount}</span>
                  </p>
                </div>
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={closeCompleteModal} disabled={completingBooking}>
                Cancel
              </Button>
              <Button variant="accent" onClick={completeBookingWithBill} disabled={completingBooking}>
                {completingBooking ? "Saving..." : "Confirm Completion"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
