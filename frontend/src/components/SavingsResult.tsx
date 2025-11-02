import type { SavingsResponse } from "../types/savings";
import { formatCurrency } from "../utils/formatters";

interface SavingsResultProps {
  result: SavingsResponse;
}

export default function SavingsResult({ result }: SavingsResultProps) {
  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
      <h3 className="text-lg font-semibold text-green-800 mb-3">
        Calculation Results
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Amount Needed:
          </span>
          <span className="text-sm font-bold text-gray-900">
            {formatCurrency(result.amount_needed)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-green-200">
          <span className="text-sm font-medium text-gray-700">
            Monthly Savings Required:
          </span>
          <span className="text-lg font-bold text-green-700">
            {formatCurrency(result.monthly_saving)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-green-200">
          <span className="text-sm font-medium text-gray-700">
            Months Remaining:
          </span>
          <span className="text-sm font-bold text-gray-900">
            {result.months_remaining}
          </span>
        </div>
      </div>
    </div>
  );
}
