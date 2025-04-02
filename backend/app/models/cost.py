from pydantic import BaseModel, Field


class Cost(BaseModel):
  mineral: int = Field(default=0, ge=0)
  gas: int = Field(default=0, ge=0)
  time: int = Field(default=0, ge=0)