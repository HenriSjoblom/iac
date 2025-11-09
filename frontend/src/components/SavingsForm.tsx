import { useState } from "react";

interface SavingsFormProps {
  onSubmit: (
    goalAmount: number,
    currentSavings: number,
    yearsToSave: number
  ) => void;
  loading: boolean;
}

export default function SavingsForm({ onSubmit, loading }: SavingsFormProps) {
  const [goalAmount, setGoalAmount] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [yearsToSave, setYearsToSave] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      parseFloat(goalAmount),
      parseFloat(currentSavings),
      parseFloat(yearsToSave)
    );
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {/* Goal Amount Input */}
      <div>
        <label
          htmlFor="goalAmount"
          className="block text-sm font-medium text-gray-700"
        >
          Goal Amount (€)
        </label>
        <div className="mt-1">
          <input
            id="goalAmount"
            name="goalAmount"
            type="number"
            step="100"
            required
            className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="10000"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
          />
        </div>
      </div>

      {/* Current Savings Input */}
      <div>
        <label
          htmlFor="currentSavings"
          className="block text-sm font-medium text-gray-700"
        >
          Current Savings (€)
        </label>
        <div className="mt-1">
          <input
            id="currentSavings"
            name="currentSavings"
            type="number"
            step="100"
            required
            className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="500"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(e.target.value)}
          />
        </div>
      </div>

      {/* Years Input */}
      <div>
        <label
          htmlFor="yearsToSave"
          className="block text-sm font-medium text-gray-700"
        >
          Years to Save
        </label>
        <div className="mt-1">
          <input
            id="yearsToSave"
            name="yearsToSave"
            type="number"
            step="1"
            required
            className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="2"
            value={yearsToSave}
            onChange={(e) => setYearsToSave(e.target.value)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {loading ? "Calculating..." : "Calculate Savings"}
        </button>
      </div>
    </form>
  );
}
