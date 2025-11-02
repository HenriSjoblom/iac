export interface SavingsRequest {
  goal_amount: number;
  current_savings: number;
  years_to_save: number;
}

export interface SavingsResponse {
  amount_needed: number;
  monthly_saving: number;
  months_remaining: number;
}
