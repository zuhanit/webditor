from eudplib import EUDMethod, EUDStruct


class WObject(EUDStruct):
    @EUDMethod
    def allocate(self): ...
