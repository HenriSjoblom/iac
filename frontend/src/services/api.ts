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
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.detail || `Server error: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};
