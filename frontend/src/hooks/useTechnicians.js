import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { sortTechniciansByRating } from "@/utils/technicianUtils";

export default function useTechnicians() {
  const [rawTechnicians, setRawTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await api.get("/technicians");
        const list = Array.isArray(response?.data) ? response.data : [];
        setRawTechnicians(list);
      } catch {
        setRawTechnicians([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  const technicians = useMemo(() => sortTechniciansByRating(rawTechnicians), [rawTechnicians]);

  return { technicians, loading };
}
