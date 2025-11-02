import { useSavingsCalculator } from "./hooks/useSavingsCalculator";
import SavingsForm from "./components/SavingsForm";
import SavingsResult from "./components/SavingsResult";
import ErrorMessage from "./components/ErrorMessage";

export default function App() {
  const { result, loading, error, calculate } = useSavingsCalculator();

  const handleCalculate = (
    goalAmount: number,
    currentSavings: number,
    yearsToSave: number
  ) => {
    calculate(goalAmount, currentSavings, yearsToSave);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Savings Calculator
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Calculate how much you need to save monthly to reach your goal
          </p>
        </div>

        <SavingsForm onSubmit={handleCalculate} loading={loading} />

        <ErrorMessage message={error} />

        {result && <SavingsResult result={result} />}
      </div>
    </div>
  );
}
