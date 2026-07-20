from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class TemplateCreate(BaseModel):
    name: str
    examType: str
    numItems: int
    numChoices: int
    classroom_id: int
    layout_data: Optional[Dict[str, Any]] = None

class AnswerKeyUpdate(BaseModel):
    answer_key: List[str]
    confirmed: bool = False
    regrade: bool = False
    
class TemplateResponse(BaseModel):
    id: int
    name: str
    exam_type: Optional[str]
    num_items: int
    num_choices: int
    layout_blueprint: Optional[Dict[str, Any]] = None 
    answer_key: List[str] = []

    class Config:
        from_attributes = True

class QuotaMetrics(BaseModel):
    current: int
    limit: int
    remaining: int
    percent_used: float

class StorageUsageResponse(BaseModel):
    scans: QuotaMetrics
    records: QuotaMetrics

    class Config:
        from_attributes = True