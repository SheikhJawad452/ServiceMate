import { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import useNavigateWithLoader from "@/hooks/useNavigateWithLoader";
import { api } from "@/services/api";

const INDIA_ISO_CODE = "IN";

export default function CompleteProfilePage() {
  const navigate = useNavigateWithLoader();
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    state: "",
    city: "",
    phone: "",
    experienceYears: "",
  });
  const [useManualState, setUseManualState] = useState(false);
  const [useManualCity, setUseManualCity] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  useEffect(() => {
    const india = Country.getCountryByCode(INDIA_ISO_CODE);
    if (india) {
      setStates(State.getStatesOfCountry(india.isoCode));
    }
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }
    setCities(City.getCitiesOfState(INDIA_ISO_CODE, selectedState));
  }, [selectedState]);

  useEffect(() => {
    const loadProfile = async () => {
      setFetchingProfile(true);
      try {
        const response = await api.get("/user/profile");
        const userProfile = response?.data?.user || {};
        const technicianProfile = response?.data?.technicianProfile || null;
        const location = userProfile?.location || {};
        const nextForm = {
          fullName: userProfile?.fullName || "",
          email: userProfile?.email || "",
          state: location?.state || "",
          city: location?.city || "",
          phone: userProfile?.phone || "",
          experienceYears: technicianProfile?.experienceYears !== undefined ? String(technicianProfile.experienceYears) : "",
        };
        setForm(nextForm);

        const matchedState = State.getStatesOfCountry(INDIA_ISO_CODE).find((stateItem) => stateItem.name === nextForm.state);
        if (matchedState) {
          setSelectedState(matchedState.isoCode);
          setUseManualState(false);
          const stateCities = City.getCitiesOfState(INDIA_ISO_CODE, matchedState.isoCode);
          const cityExists = stateCities.some((cityItem) => cityItem.name === nextForm.city);
          setUseManualCity(Boolean(nextForm.city) && !cityExists);
          setSelectedCity(cityExists ? nextForm.city : "");
        } else {
          setSelectedState("");
          setSelectedCity("");
          setUseManualState(Boolean(nextForm.state));
          setUseManualCity(Boolean(nextForm.city));
        }

        const profileExists = Boolean(nextForm.state || nextForm.city || nextForm.phone || nextForm.experienceYears);
        setHasExistingProfile(profileExists);
      } catch (apiError) {
        setHasExistingProfile(false);
      } finally {
        setFetchingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;

    if (name === "state") {
      setSelectedState(value);
      setSelectedCity("");
      setUseManualCity(false);
      setForm((prev) => ({ ...prev, state: "", city: "" }));
      return;
    }

    if (name === "city") {
      setSelectedCity(value);
      setForm((prev) => ({ ...prev, city: value }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectedStateName = states.find((stateItem) => stateItem.isoCode === selectedState)?.name || "";

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const finalState = (useManualState ? form.state : selectedStateName).trim();
    const finalCity = (useManualState || useManualCity ? form.city : selectedCity).trim();

    if (!finalState || !finalCity) {
      const validationMessage = "State and city are required.";
      setError(validationMessage);
      toast.error(validationMessage);
      return;
    }

    setLoading(true);
    try {
      await api.post("/user/profile", {
        fullName: form.fullName.trim(),
        state: finalState,
        city: finalCity,
        phone: form.phone.trim() || undefined,
        experienceYears:
          user?.role === "technician" && form.experienceYears !== ""
            ? Number(form.experienceYears)
            : undefined,
      });
      toast.success("Profile completed successfully 🎉");
      setHasExistingProfile(true);
      navigate("/dashboard", { replace: true });
    } catch (apiError) {
      const errorMessage = apiError?.message || "Failed to complete profile.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-primary">{hasExistingProfile ? "Update Profile" : "Complete Profile"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {hasExistingProfile ? "Review and update your profile details." : "Add your location to continue."}
        </p>
        {fetchingProfile ? <p className="mt-3 text-xs text-slate-500">Loading profile data...</p> : null}

        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Personal Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
                  required
                />
                <p className="text-xs text-slate-500">You can update your name once every 24 hours.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  placeholder="Email"
                  className="w-full rounded-xl border border-gray-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none"
                  disabled
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Location Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="state" className="text-sm font-medium text-slate-700">
                  State
                </label>
                {useManualState ? (
                  <input
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={onChange}
                    placeholder="Enter state"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
                    required
                  />
                ) : (
                  <select
                    id="state"
                    name="state"
                    value={selectedState}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((stateItem) => (
                      <option key={stateItem.isoCode} value={stateItem.isoCode}>
                        {stateItem.name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setUseManualState((prev) => !prev);
                    setForm((prev) => ({ ...prev, state: "", city: "" }));
                    setSelectedState("");
                    setSelectedCity("");
                    setUseManualCity(false);
                  }}
                  className="text-xs font-medium text-[#1E3A8A] hover:text-[#1D4ED8]"
                >
                  {useManualState ? "Use dropdown state list" : "Enter state manually"}
                </button>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="city" className="text-sm font-medium text-slate-700">
                  City
                </label>
                {!useManualState && !useManualCity ? (
                  <select
                    id="city"
                    name="city"
                    value={selectedCity}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedState}
                    required
                  >
                    <option value="">{selectedState ? "Select City" : "Select state first"}</option>
                    {cities.map((cityItem) => (
                      <option key={`${cityItem.name}-${cityItem.stateCode}`} value={cityItem.name}>
                        {cityItem.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    placeholder="Enter city"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
                    required
                  />
                )}
                {!useManualState ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUseManualCity((prev) => !prev);
                      setSelectedCity("");
                      setForm((prev) => ({ ...prev, city: "" }));
                    }}
                    className="text-xs font-medium text-[#1E3A8A] hover:text-[#1D4ED8]"
                  >
                    {useManualCity ? "Use city dropdown" : "Enter city manually"}
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Contact</h2>
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </section>

          {user?.role === "technician" ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Professional Details</h2>
              <div className="space-y-1.5">
                <label htmlFor="experienceYears" className="text-sm font-medium text-slate-700">
                  Experience (in years)
                </label>
                <input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  min="0"
                  value={form.experienceYears}
                  onChange={onChange}
                  placeholder="Enter your experience in years"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
                />
              </div>
            </section>
          ) : null}

          {error ? <p className="text-xs text-red-500">{error}</p> : null}

          <Button
            type="submit"
            className="w-full bg-[#F97316] text-white hover:bg-[#EA580C]"
            disabled={loading || fetchingProfile}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </main>
  );
}
