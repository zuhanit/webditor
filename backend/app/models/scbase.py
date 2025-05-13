from pydantic import BaseModel
import abc


class CHKModel(BaseModel, abc.ABC):
  @property
  @abc.abstractmethod
  def to_webditor(self) -> "WebditorModel":
    pass

  @classmethod
  @abc.abstractmethod
  def from_webditor(cls, webditor: "WebditorModel") -> "CHKModel":
    pass


class WebditorModel(BaseModel, abc.ABC):
  @property
  @abc.abstractmethod
  def to_raw(self) -> CHKModel:
    pass

  @classmethod
  @abc.abstractmethod
  def from_raw(cls, raw: CHKModel) -> "WebditorModel":
    pass
