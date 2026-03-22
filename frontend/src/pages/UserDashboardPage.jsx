import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

const statusBadgeMap = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-blue-100 text-blue-700",
  Rejected: "bg-rose-100 text-rose-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-slate-200 text-slate-700",
};

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewForms, setReviewForms] = useState({});
  const [reviewChecks, setReviewChecks] = useState({});
  const [reviewLoadingByBooking, setReviewLoadingByBooking] = useState({});
  const [actionMessage, setActionMessage] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/bookings/my");
      setBookings(response?.data || []);
    } catch (apiError) {
      setError(apiError?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const completedBookings = bookings.filter((booking) => booking.status === "Completed");
    if (completedBookings.length === 0) return;

    const checkExistingReviews = async () => {
      const entries = await Promise.all(
        completedBookings.map(async (booking) => {
          try {
            const response = await api.get(`/reviews/check/${booking._id}`);
            return [booking._id, response];
          } catch (apiError) {
            return [booking._id, { exists: false }];
          }
        }),
      );

      const checkMap = Object.fromEntries(entries);
      setReviewChecks((prev) => ({ ...prev, ...checkMap }));
      setReviewForms((prev) => {
        const next = { ...prev };
        entries.forEach(([bookingId, payload]) => {
          if (!next[bookingId]) {
            next[bookingId] = {
              rating: String(payload?.review?.rating || 5),
              comment: payload?.review?.comment || "",
            };
          }
        });
        return next;
      });
    };

    checkExistingReviews();
  }, [bookings]);

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [bookings],
  );

  const handleReviewChange = (bookingId, field, value) => {
    setReviewForms((prev) => ({
      ...prev,
      [bookingId]: {
        rating: prev[bookingId]?.rating || "5",
        comment: prev[bookingId]?.comment || "",
        [field]: value,
      },
    }));
  };

  const submitReview = async (bookingId) => {
    const payload = reviewForms[bookingId] || { rating: "5", comment: "" };
    const rating = Number(payload.rating);
    const comment = String(payload.comment || "").trim();
    if (rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5.");
      return;
    }
    if (!comment) {
      toast.error("Comment is required.");
      return;
    }

    setActionMessage("");
    setReviewLoadingByBooking((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const existingReview = reviewChecks?.[bookingId]?.review;
      if (existingReview?.id) {
        const response = await api.patch(`/reviews/${existingReview.id}`, { rating, comment });
        setReviewChecks((prev) => ({
          ...prev,
          [bookingId]: {
            exists: true,
            review: {
              id: existingReview.id,
              rating,
              comment,
              updatedAt: response?.data?.updatedAt || new Date().toISOString(),
            },
          },
        }));
        setActionMessage("Review updated successfully.");
        toast.success("Review updated successfully");
      } else {
        const response = await api.post("/reviews", { bookingId, rating, comment });
        setReviewChecks((prev) => ({
          ...prev,
          [bookingId]: {
            exists: true,
            review: {
              id: response?.data?._id,
              rating,
              comment,
              updatedAt: response?.data?.updatedAt || new Date().toISOString(),
            },
          },
        }));
        setActionMessage("Review submitted successfully.");
        toast.success("Review submitted successfully");
      }
    } catch (apiError) {
      const message = apiError?.message || "Failed to save review.";
      setActionMessage(message);
      toast.error(message);
    } finally {
      setReviewLoadingByBooking((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-2xl font-bold text-primary">{user?.fullName || "User"} Dashboard</h1>
            </div>
            <Button variant="accent" onClick={() => logout(navigate)}>
              Logout
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <div>
            <h2 className="text-xl font-semibold text-primary">My Bookings</h2>
            <p className="mt-1 text-sm text-slate-500">Track status and add reviews for completed bookings.</p>
          </div>
          {actionMessage ? <p className="mt-3 text-sm text-primary">{actionMessage}</p> : null}
          {loading ? <p className="mt-4 text-sm text-slate-500">Loading bookings...</p> : null}
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          {!loading && !error && sortedBookings.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No bookings found.</p>
          ) : null}

          <div className="mt-5 space-y-4">
            {sortedBookings.map((booking) => {
              const reviewState = reviewForms[booking._id] || {};
              const isCompleted = booking.status === "Completed";
              const existingReview = reviewChecks?.[booking._id]?.review || null;
              const hasExistingReview = Boolean(reviewChecks?.[booking._id]?.exists && existingReview?.id);

              return (
                <article key={booking._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {booking?.service?.serviceName || "Service"} with{" "}
                        {booking?.technician?.user?.fullName || "Technician"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(booking.scheduledDate).toLocaleDateString()} | {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusBadgeMap[booking.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {isCompleted ? (
                    <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[140px_1fr_auto]">
                      <select
                        className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                        value={reviewState.rating ?? String(existingReview?.rating || 5)}
                        onChange={(event) => handleReviewChange(booking._id, "rating", event.target.value)}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Bad</option>
                      </select>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        placeholder={hasExistingReview ? "Update your review" : "Write a quick review"}
                        value={reviewState.comment ?? existingReview?.comment ?? ""}
                        onChange={(event) => handleReviewChange(booking._id, "comment", event.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => submitReview(booking._id)}
                        disabled={Boolean(reviewLoadingByBooking[booking._id])}
                      >
                        {reviewLoadingByBooking[booking._id]
                          ? "Saving..."
                          : hasExistingReview
                            ? "Edit Review"
                            : "Add Review"}
                      </Button>

                      {hasExistingReview ? (
                        <div className="sm:col-span-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                          Review already submitted. You can edit it anytime.
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
