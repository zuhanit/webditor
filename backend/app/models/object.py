from pydantic import BaseModel


class Object(BaseModel):
  id: int = 0
  name: str = ""
