from pydantic import BaseModel


class SavingsRequest(BaseModel):
    goal_amount: float
    current_savings: float
    years_to_save: float


class SavingsResponse(BaseModel):
    amount_needed: float
    monthly_saving: float
    months_remaining: int
