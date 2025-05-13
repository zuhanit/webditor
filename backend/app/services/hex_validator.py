from pydantic import PlainValidator, PlainSerializer, errors, WithJsonSchema
from typing import Any
from typing_extensions import Annotated


def hex_bytes_validator(o: Any) -> bytes:
  if isinstance(o, bytes):
    return o
  elif isinstance(o, bytearray):
    return bytes(o)
  elif isinstance(o, str):
    return bytes.fromhex(o)
  raise errors.BytesError()


HexBytes = Annotated[
  bytes,
  PlainValidator(hex_bytes_validator),
  PlainSerializer(lambda b: b.hex()),
  WithJsonSchema({"type": "string"}),
]
