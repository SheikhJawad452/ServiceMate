import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchAdminData = async () => {
    setError("");
    try {
      const [usersRes, bookingsRes, reportsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/bookings"),
        api.get("/admin/reports"),
      ]);
      setUsers(usersRes?.data || []);
      setBookings(bookingsRes?.data || []);
      setReports(reportsRes?.data || []);
    } catch (apiError) {
      setError(apiError?.message || "Failed to load admin dashboard data.");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const updateReportStatus = async (reportId, status) => {
    setMessage("");
    setError("");
    try {
      await api.patch(`/admin/reports/${reportId}`, { status });
      setMessage("Report updated.");
      fetchAdminData();
    } catch (apiError) {
      setError(apiError?.message || "Failed to update report.");
    }
  };

  const updateUserStatus = async (userId, action) => {
    setMessage("");
    setError("");
    try {
      if (action === "block") {
        await api.patch(`/admin/users/${userId}/block`);
        setMessage("User blocked.");
        toast.success("User blocked");
      } else {
        await api.patch(`/admin/users/${userId}/activate`);
        setMessage("User activated.");
        toast.success("User activated");
      }
      await fetchAdminData();
    } catch (apiError) {
      setError(apiError?.message || "Failed to update user status.");
      toast.error(apiError?.message || "Failed to update user status.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Admin panel</p>
              <h1 className="text-2xl font-bold text-primary">{user?.fullName || "Admin"} Dashboard</h1>
            </div>
            <Button variant="accent" onClick={() => logout(navigate)}>
              Logout
            </Button>
          </div>
          {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-primary">Manage Users</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account._id} className="border-b border-slate-100">
                    <td className="px-2 py-2 font-medium">{account.fullName}</td>
                    <td className="px-2 py-2">{account.email}</td>
                    <td className="px-2 py-2 capitalize">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        {account.role}
                      </span>
                    </td>
                    <td className="px-2 py-2">{account.isActive ? "Active" : "Inactive"}</td>
                    <td className="px-2 py-2">
                      {account.isActive ? (
                        <Button
                          size="sm"
                          className="bg-red-600 text-white hover:bg-red-700"
                          onClick={() => updateUserStatus(account._id, "block")}
                        >
                          Block user
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={() => updateUserStatus(account._id, "activate")}
                        >
                          Activate user
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-primary">View Bookings</h2>
          <div className="mt-4 space-y-3">
            {bookings.map((booking) => (
              <article key={booking._id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold text-slate-800">
                  {booking?.service?.serviceName || "Service"} • {booking?.user?.fullName || "User"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(booking.scheduledDate).toLocaleDateString()} | {booking.startTime} - {booking.endTime}
                </p>
                <p className="mt-1 text-sm text-slate-600">Status: {booking.status}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-primary">Reports</h2>
          <div className="mt-4 space-y-3">
            {reports.length === 0 ? <p className="text-sm text-slate-500">No reports found.</p> : null}
            {reports.map((report) => (
              <article key={report._id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold text-slate-800">{report.category}</p>
                <p className="mt-1 text-sm text-slate-600">{report.description}</p>
                <p className="mt-1 text-xs text-slate-500">Status: {report.status}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateReportStatus(report._id, "under_review")}>
                    Mark Under Review
                  </Button>
                  <Button size="sm" variant="accent" onClick={() => updateReportStatus(report._id, "resolved")}>
                    Resolve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateReportStatus(report._id, "dismissed")}>
                    Dismiss
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
