import { useQuery } from "@tanstack/react-query";

interface PollingResponse {
  success: boolean;
  complete: boolean;
  routine: { routine: any };
  tips: string;
}

export function usePollingResults(analysisId: string | null) {
  return useQuery<PollingResponse>({
    queryKey: ["pollResults", analysisId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/analysis-recommendation/ai-results/${analysisId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch analysis results");
      }
      const data = await res.json();
      console.log("Polling response", data);
      return data;
    },
    enabled: !!analysisId,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.complete ? false : 2000;
    },
    retry: false,
  });
}
