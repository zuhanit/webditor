from eudplib import EUDFuncPtr, EUDMethod, EUDTypedFunc, EUDVariable
from .entity import Entity, EntityVTable


class Unit(Entity):
    _fields_ = [
        "ptr",
        ["on_burrow", EUDFuncPtr(1, 0)()],
        ["event_tick", EUDFuncPtr(1, 0)()],
    ]
    entity_type = "Unit"

    def constructor(self, index: int):
        super().constructor()

        _unit_ptr = 0x59CCA8 if index == 0 else 0x59CCA8 + 336 * (1700 - index)
        self.ptr = EUDVariable(_unit_ptr)

        """
    VTable allocating phase
    
    Dynamic dispatch is not supported yet(see https://cafe.naver.com/edac/135393).
    """
        self._vtable: EntityVTable = EntityVTable.alloc()
        self._vtable.event_loop = EUDFuncPtr(1, 0)(_event_loop)

    def place(self): ...

    @EUDMethod
    def allocate(self):
        super().allocate()


@EUDTypedFunc([Unit])
def _event_loop(self: Unit):
    self.event_tick(self)
    self.on_burrow(self)
