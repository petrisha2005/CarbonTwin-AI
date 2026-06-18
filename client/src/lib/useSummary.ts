import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type { Summary } from "./types";

export function useSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<Summary>("/carbon/summary");
      setSummary(data);
    } catch (err: any) {
      setError(err.message ?? "Could not load summary");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, error, refresh, setSummary };
}
