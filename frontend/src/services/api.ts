import type { SavingsRequest, SavingsResponse } from "../types/savings";


export const calculateSavings = async (
  data: SavingsRequest
): Promise<SavingsResponse> => {
  const response = await fetch('/api/calculate-savings', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
};
