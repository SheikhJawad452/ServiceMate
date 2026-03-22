import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

export default function TechnicianPortfolioPage() {
  const [technicianProfile, setTechnicianProfile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    imageFile: null,
    description: "",
  });
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  const fetchDashboardData = async () => {
    setError("");
    try {
      const profileRes = await api.get("/technicians/me/profile");
      setTechnicianProfile(profileRes?.data || null);
    } catch (apiError) {
      setError(apiError?.message || "Failed to load portfolio.");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const submitPortfolio = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const title = String(portfolioForm.title || "").trim();
    if (!title) {
      const validationError = "Project title is required.";
      setError(validationError);
      toast.error(validationError);
      return;
    }

    if (!editingItem && !portfolioForm.imageFile) {
      const validationError = "Portfolio image is required.";
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setPortfolioUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", portfolioForm.description);
      if (portfolioForm.imageFile) {
        formData.append("image", portfolioForm.imageFile);
      }

      if (editingItem?._id) {
        await api.patch(`/technicians/me/portfolio/${editingItem._id}`, formData);
        setMessage("Portfolio item updated.");
        toast.success("Portfolio item updated successfully");
      } else {
        await api.post("/technicians/me/portfolio", formData);
        setMessage("Portfolio item uploaded.");
        toast.success("Portfolio item uploaded successfully");
      }

      setPortfolioForm({ title: "", imageFile: null, description: "" });
      setEditingItem(null);
      fetchDashboardData();
    } catch (apiError) {
      const messageText = apiError?.message || "Failed to save portfolio item.";
      setError(messageText);
      toast.error(messageText);
    } finally {
      setPortfolioUploading(false);
    }
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setPortfolioForm({
      title: item?.title || "",
      imageFile: null,
      description: item?.description || "",
    });
    setError("");
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setPortfolioForm({ title: "", imageFile: null, description: "" });
  };

  const deletePortfolioItem = async (itemId) => {
    setDeletingId(itemId);
    setError("");
    setMessage("");
    try {
      await api.delete(`/technicians/me/portfolio/${itemId}`);
      if (editingItem?._id === itemId) {
        cancelEditing();
      }
      setTechnicianProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          portfolio: (prev.portfolio || []).filter((item) => item?._id !== itemId),
        };
      });
      setMessage("Portfolio item deleted.");
      toast.success("Portfolio item deleted successfully");
      setDeleteConfirmItem(null);
    } catch (apiError) {
      const messageText = apiError?.message || "Failed to delete portfolio item.";
      setError(messageText);
      toast.error(messageText);
    } finally {
      setDeletingId("");
    }
  };

  const isProfileMissing = error.toLowerCase().includes("technician profile not found");

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-primary">Portfolio</h1>
          <p className="mt-1 text-sm text-slate-500">Show your recent projects and work quality to customers.</p>
          {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
          {error && !isProfileMissing ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          {isProfileMissing ? (
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
          <h2 className="text-xl font-semibold text-primary">{editingItem ? "Edit Portfolio" : "Upload Portfolio"}</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={submitPortfolio}>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Project title"
              value={portfolioForm.title}
              onChange={(event) => setPortfolioForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setPortfolioForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))
              }
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Description"
              value={portfolioForm.description}
              onChange={(event) => setPortfolioForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <div className="md:col-span-3">
              <Button type="submit" variant="accent" disabled={portfolioUploading}>
                {portfolioUploading ? (editingItem ? "Updating..." : "Uploading...") : editingItem ? "Update Portfolio" : "Upload Portfolio"}
              </Button>
              {editingItem ? (
                <Button type="button" variant="outline" className="ml-2" onClick={cancelEditing} disabled={portfolioUploading}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(technicianProfile?.portfolio || []).map((item, idx) => (
              <article key={item?._id || `${item.title}-${idx}`} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="group relative">
                  {item.imageUrl ? (
                    <img alt={item.title || "Portfolio"} className="h-32 w-full object-cover" src={item.imageUrl} />
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-slate-100 text-xs text-slate-500">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button size="sm" variant="outline" className="bg-white/95" onClick={() => startEditing(item)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/95"
                      disabled={deletingId === item?._id}
                      onClick={() => setDeleteConfirmItem(item)}
                    >
                      {deletingId === item?._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.description || "No details provided"}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {deleteConfirmItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Delete portfolio item?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure to delete this item? This action cannot be undone.
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-800">{deleteConfirmItem?.title || "Untitled item"}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{deleteConfirmItem?.description || "No description"}</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={deletingId === deleteConfirmItem?._id}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="accent"
                onClick={() => deletePortfolioItem(deleteConfirmItem?._id)}
                disabled={deletingId === deleteConfirmItem?._id}
              >
                {deletingId === deleteConfirmItem?._id ? "Deleting..." : "Delete Item"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
