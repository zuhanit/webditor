from pydantic import BaseModel
import abc

class SCBaseRawModel(BaseModel, abc.ABC):
    @property
    @abc.abstractmethod
    def to_webditor(self) -> "SCBaseWebditorModel":
        pass

    @classmethod
    @abc.abstractmethod
    def from_webditor(cls, webditor: "SCBaseWebditorModel") -> "SCBaseRawModel":
        pass

class SCBaseWebditorModel(BaseModel, abc.ABC):
    @property
    @abc.abstractmethod
    def to_raw(self) -> SCBaseRawModel:
        pass

    @classmethod
    @abc.abstractmethod
    def from_raw(cls, raw: SCBaseRawModel) -> "SCBaseWebditorModel":
        pass