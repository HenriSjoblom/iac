import type { SavingsRequest, SavingsResponse } from "../types/savings";

const API_BASE_URL = "http://localhost:8000";

export const calculateSavings = async (
  data: SavingsRequest
): Promise<SavingsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/calculate-savings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
};
