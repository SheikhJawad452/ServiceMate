import { Country, State, City } from "country-state-city";
import { useMemo } from "react";

const INDIA_ISO_CODE = "IN";

export default function IndianLocationSelect({ stateIsoValue, cityValue, onStateChange, onCityChange }) {
  const states = useMemo(() => {
    const india = Country.getCountryByCode(INDIA_ISO_CODE);
    return india ? State.getStatesOfCountry(india.isoCode) : [];
  }, []);

  const cityOptions = useMemo(
    () => (stateIsoValue ? City.getCitiesOfState(INDIA_ISO_CODE, stateIsoValue) : []),
    [stateIsoValue],
  );

  const handleStateChange = (event) => {
    const isoCode = event.target.value;
    const state = states.find((item) => item.isoCode === isoCode);
    onStateChange({ isoCode, name: state?.name || "" });
    onCityChange("");
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="state">
          State
        </label>
        <select
          id="state"
          name="state"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-300 hover:border-orange-300 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/35"
          value={stateIsoValue}
          onChange={handleStateChange}
          required
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="city">
          City
        </label>
        <select
          id="city"
          name="city"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-300 hover:border-orange-300 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/35 disabled:cursor-not-allowed disabled:opacity-60"
          value={cityValue}
          onChange={(event) => onCityChange(event.target.value)}
          disabled={!stateIsoValue}
          required
        >
          <option value="">{stateIsoValue ? "Select City" : "Select state first"}</option>
          {cityOptions.map((city) => (
            <option key={`${city.name}-${city.stateCode}`} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
