from fastapi import FastAPI
from typing import Union
from pydantic import BaseModel


class Item(BaseModel):
  name: str
  description: Union[str, None] = None
  price: float
  tax: Union[float, None] = None


app = FastAPI()


@app.get("/")
async def root():
  return {"message": "Hello World"}


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Union[str, None] = None):
  return {"item_id": item_id, "q": q}


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
  return {"item_name": item.name, "item.price": item.price}
