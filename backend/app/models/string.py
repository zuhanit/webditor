from pydantic import BaseModel


class String(BaseModel):
  id: int
  content: str
