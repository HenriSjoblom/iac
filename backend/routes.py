from fastapi import APIRouter, HTTPException
from models import SavingsRequest, SavingsResponse

router = APIRouter()


@router.post("/api/calculate-savings", response_model=SavingsResponse)
async def calculate_savings(request: SavingsRequest):
    """
    Calculates the monthly savings needed to reach a goal.
    """

    if (
        request.goal_amount < 0
        or request.current_savings < 0
        or request.years_to_save < 0
    ):
        raise HTTPException(
            status_code=400,
            detail="All values (goal_amount, current_savings, years_to_save) must be non-negative",
        )

    # Calculate remaining amount needed
    amount_needed = request.goal_amount - request.current_savings
    if amount_needed < 0:
        amount_needed = 0

    # Calculate total months
    total_months = request.years_to_save * 12

    # Calculate monthly savings
    monthly_saving = 0
    if total_months > 0:
        monthly_saving = amount_needed / total_months
    elif amount_needed > 0:
        monthly_saving = amount_needed

    return {
        "amount_needed": round(amount_needed, 2),
        "monthly_saving": round(monthly_saving, 2),
        "months_remaining": int(total_months),
    }


@router.get("/health")
def read_root():
    return {"status": "ok"}
