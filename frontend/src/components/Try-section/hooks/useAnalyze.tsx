import { useMutation } from "@tanstack/react-query";

export function useAnalyze(onSuccess: (data: any) => void) {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/analysis-recommendation/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Analyze request failed");
      return res.json();
    },
    onSuccess,
    onError: () => {
      console.error("Analyze failed");
    },
  });
}
