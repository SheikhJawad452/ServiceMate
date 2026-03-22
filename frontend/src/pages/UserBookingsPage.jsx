import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

const statusBadgeMap = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [downloadLoadingId, setDownloadLoadingId] = useState("");
  const [confirmCancelBooking, setConfirmCancelBooking] = useState(null);
  const [reviewChecks, setReviewChecks] = useState({});
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/bookings/user");
      setBookings(response?.data || []);
    } catch (apiError) {
      const message = apiError?.message || "Failed to load bookings.";
      setError(message);
      toast.error(message);
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

    const checkReviews = async () => {
      const results = await Promise.all(
        completedBookings.map(async (booking) => {
          try {
            const response = await api.get(`/reviews/check/${booking._id}`);
            return [booking._id, response];
          } catch (error) {
            return [booking._id, { exists: false }];
          }
        }),
      );
      setReviewChecks((prev) => ({ ...prev, ...Object.fromEntries(results) }));
    };

    checkReviews();
  }, [bookings]);

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)),
    [bookings],
  );

  const cancelBooking = async (booking) => {
    setActionLoadingId(booking._id);
    try {
      await api.patch(`/bookings/cancel/${booking._id}`);
      setBookings((prev) =>
        prev.map((item) =>
          item._id === booking._id
            ? { ...item, status: "Cancelled", cancelledBy: item?.user?._id || item?.user || null }
            : item,
        ),
      );
      toast.success("Booking cancelled successfully");
    } catch (apiError) {
      toast.error(apiError?.message || "Failed to cancel booking.");
    } finally {
      setActionLoadingId("");
      setConfirmCancelBooking(null);
    }
  };

  const downloadBookingDetailsPdf = async (booking) => {
    setDownloadLoadingId(booking._id);
    try {
      const response = await api.get(`/bookings/${booking._id}/pdf`, { responseType: "blob" });
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `booking-details-${booking._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (apiError) {
      toast.error(apiError?.message || "Failed to download booking PDF.");
    } finally {
      setDownloadLoadingId("");
    }
  };

  const renderStars = (ratingValue) => {
    const rating = Number(ratingValue || 0);
    return (
      <div className="flex items-center gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={`star-${index}`} className={index < rating ? "opacity-100" : "opacity-30"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const openReviewModal = (booking, mode) => {
    const reviewInfo = reviewChecks[booking._id];
    const review = reviewInfo?.review;
    setReviewModal({
      bookingId: booking._id,
      mode,
      reviewId: review?.id || null,
    });
    setReviewForm({
      rating: String(review?.rating || 5),
      comment: review?.comment || "",
    });
  };

  const submitReview = async () => {
    if (!reviewModal) return;

    const rating = Number(reviewForm.rating);
    const comment = String(reviewForm.comment || "").trim();
    if (rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5.");
      return;
    }
    if (!comment) {
      toast.error("Comment is required.");
      return;
    }

    setReviewSubmitting(true);
    try {
      if (reviewModal.mode === "edit" && reviewModal.reviewId) {
        const response = await api.patch(`/reviews/${reviewModal.reviewId}`, { rating, comment });
        setReviewChecks((prev) => ({
          ...prev,
          [reviewModal.bookingId]: {
            exists: true,
            review: {
              id: reviewModal.reviewId,
              rating,
              comment,
              updatedAt: response?.data?.updatedAt || new Date().toISOString(),
            },
          },
        }));
        toast.success("Review updated successfully");
      } else {
        const response = await api.post("/reviews", {
          bookingId: reviewModal.bookingId,
          rating,
          comment,
        });
        setReviewChecks((prev) => ({
          ...prev,
          [reviewModal.bookingId]: {
            exists: true,
            review: {
              id: response?.data?._id,
              rating,
              comment,
              updatedAt: response?.data?.updatedAt || new Date().toISOString(),
            },
          },
        }));
        toast.success("Review submitted successfully");
      }
      setReviewModal(null);
    } catch (apiError) {
      toast.error(apiError?.message || "Failed to save review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-primary">My Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">Track your service bookings and manage pending requests.</p>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading bookings...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!loading && !error && sortedBookings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            No bookings found.
          </div>
        ) : null}

        <div className="space-y-4">
          {sortedBookings.map((booking) => {
            const isPendingOrAccepted = booking.status === "Pending" || booking.status === "Accepted";
            const canDownloadDetails = booking.status === "Accepted" || booking.status === "Completed";
            const isExpanded = expandedId === booking._id;
            const isCompleted = booking.status === "Completed";
            const reviewInfo = reviewChecks[booking._id];
            const hasReview = Boolean(reviewInfo?.exists);
            return (
              <article key={booking._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{booking?.service?.serviceName || "Service"}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Technician: {booking?.technician?.user?.fullName || "N/A"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(booking.scheduledDate).toLocaleDateString()} | {booking.startTime} - {booking.endTime}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">Price: ₹{booking?.totalPrice ?? 0}</p>
                    {booking?.status === "Completed" && booking?.finalAmount !== undefined ? (
                      <p className="mt-1 text-sm font-semibold text-emerald-700">Final Amount: ₹{booking.finalAmount}</p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusBadgeMap[booking.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? "" : booking._id)}
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </Button>
                  {isPendingOrAccepted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoadingId === booking._id}
                      onClick={() => setConfirmCancelBooking(booking)}
                    >
                      {actionLoadingId === booking._id ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                  ) : null}
                  {canDownloadDetails ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={downloadLoadingId === booking._id}
                      onClick={() => downloadBookingDetailsPdf(booking)}
                    >
                      {downloadLoadingId === booking._id ? "Downloading..." : "Download Details"}
                    </Button>
                  ) : null}
                  {isCompleted && !hasReview ? (
                    <Button variant="outline" size="sm" onClick={() => openReviewModal(booking, "add")}>
                      Add Review
                    </Button>
                  ) : null}
                  {isCompleted && hasReview ? (
                    <>
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        Review already submitted
                      </span>
                      <Button variant="outline" size="sm" onClick={() => openReviewModal(booking, "edit")}>
                        Edit Review
                      </Button>
                    </>
                  ) : null}
                </div>

                {isExpanded ? (
                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-700">Location:</span>{" "}
                      {[booking?.location?.addressLine, booking?.location?.city, booking?.location?.state, booking?.location?.country]
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium text-slate-700">Note:</span> {booking?.notes || "No notes"}
                    </p>
                    {booking?.mapUrl ? (
                      <p className="mt-1">
                        <span className="font-medium text-slate-700">Location Link:</span>{" "}
                        <a
                          href={booking.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          View Location
                        </a>
                      </p>
                    ) : null}
                    {booking?.status === "Completed" &&
                    Array.isArray(booking?.billItems) &&
                    booking.billItems.length > 0 ? (
                      <div className="mt-2 rounded-md border border-slate-200 bg-white p-2">
                        <p className="font-medium text-slate-700">Final Bill</p>
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
                    {isCompleted && hasReview ? (
                      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
                        <p className="font-medium text-slate-700">Your Review</p>
                        <div className="mt-1">{renderStars(reviewInfo?.review?.rating)}</div>
                        <p className="mt-1 text-slate-600">{reviewInfo?.review?.comment || "No comment provided."}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {confirmCancelBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-900">Cancel Booking?</h3>
            <p className="mt-2 text-sm text-slate-600">Are you sure you want to cancel this booking?</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmCancelBooking(null)}
                disabled={actionLoadingId === confirmCancelBooking._id}
              >
                No
              </Button>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => cancelBooking(confirmCancelBooking)}
                disabled={actionLoadingId === confirmCancelBooking._id}
              >
                {actionLoadingId === confirmCancelBooking._id ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {reviewModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-900">
              {reviewModal.mode === "edit" ? "Edit Review" : "Add Review"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">Rate your service experience.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="review-rating">
                  Rating
                </label>
                <select
                  id="review-rating"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: event.target.value }))}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Bad</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="review-comment">
                  Comment
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Share your experience"
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewModal(null)} disabled={reviewSubmitting}>
                Cancel
              </Button>
              <Button variant="accent" onClick={submitReview} disabled={reviewSubmitting}>
                {reviewSubmitting ? "Saving..." : reviewModal.mode === "edit" ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
