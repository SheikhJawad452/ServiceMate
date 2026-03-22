export const getTechnicianRating = (technician) => Number(technician?.avgRating || technician?.averageRating || 0);

export const getTechnicianCity = (technician) => technician?.location?.city || technician?.user?.location?.city || "N/A";

export const getTechnicianName = (technician) => technician?.user?.fullName || "Technician";

export const getTechnicianService = (technician) =>
  Array.isArray(technician?.services) && technician.services.length > 0
    ? technician.services[0]?.serviceName || "Home Service Expert"
    : "Home Service Expert";

export const sortTechniciansByRating = (technicians = []) =>
  technicians.slice().sort((a, b) => getTechnicianRating(b) - getTechnicianRating(a));
