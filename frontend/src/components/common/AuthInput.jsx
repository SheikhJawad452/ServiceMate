export default function AuthInput({ label, error, className = "", ...props }) {
  return (
    <div>
      {label ? (
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor={props.id || props.name}>
          {label}
        </label>
      ) : null}
      <input
        {...props}
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-300 placeholder:text-slate-400 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/35 ${className}`}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
