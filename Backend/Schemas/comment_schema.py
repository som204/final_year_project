

from pydantic import BaseModel


class CommentCreate(BaseModel):
    report_id: int
    user_id: int
    comment_text: str
    model_config = {
        "from_attributes": True
    }