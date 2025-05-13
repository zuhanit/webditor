from abc import abstractmethod
from eudplib import (
    EUDDeque,
    EUDEndIf,
    EUDFunc,
    EUDFuncPtr,
    EUDIf,
    EUDMethod,
    EUDStruct,
    EUDTypedFunc,
    f_println,
)
from ..objects.wobject import WObject
from ..components.transform import TransformComponent
from typing import Literal, TypeAlias

entity_deque = EUDDeque(1650)()
EntityType: TypeAlias = Literal[
    "Unit", "Sprite", "Location", "Terrain", "Doodads", "Unknown"
]


class EntityVTable(EUDStruct):
    _fields_ = [("event_loop", EUDFuncPtr(1, 0))]


class Entity(WObject):
    _fields_ = [("_vtable", EntityVTable)]
    transform: TransformComponent
    entity_type: EntityType = "Unknown"

    def constructor(self):
        self._vtable = EntityVTable.alloc()
        self._vtable.event_loop = EUDFuncPtr(1, 0)(_event_loop)

    @abstractmethod
    def place(self) -> bytes:
        """Place unit at current position of TrasnformComponent.

        This function only used when place Entity on build time. If you want to spawn
        Entity on runtime, please use `SpawnEntity()`.
        """
        pass

    @EUDMethod
    def allocate(self):
        entity_deque.append(self)

        return super().allocate()


@EUDTypedFunc([Entity])
def _event_loop(entity: Entity):
    pass


@EUDFunc
def traverse_entity_deque():
    if EUDIf()(entity_deque.empty()):
        f_println("Deque is empty")
    EUDEndIf()

    for entity in entity_deque:
        e = Entity.cast(entity)
        e._vtable.event_loop(e)
