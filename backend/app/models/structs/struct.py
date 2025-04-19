from pydantic import BaseModel, Field


class Struct(BaseModel):
  current: int = Field(default=0, ge=0)
  max: int = Field(default=0, ge=0)