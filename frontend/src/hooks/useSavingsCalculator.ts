import { useState } from "react";
import { calculateSavings } from "../services/api";
import type { SavingsResponse } from "../types/savings";

export const useSavingsCalculator = () => {
  const [result, setResult] = useState<SavingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculate = async (
    goalAmount: number,
    currentSavings: number,
    yearsToSave: number
  ) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await calculateSavings({
        goal_amount: goalAmount,
        current_savings: currentSavings,
        years_to_save: yearsToSave,
      });
      console.log("Calculation result:", data);
      setResult(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to calculate. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, calculate };
};
