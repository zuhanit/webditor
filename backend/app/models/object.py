from pydantic import BaseModel, Field


class Object(BaseModel):
  id: int = 0
  name: str = Field(default="")
