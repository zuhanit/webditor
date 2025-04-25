from eudplib import EUDFunc, f_simpleprint
from .entities.entity import traverse_entity_deque


@EUDFunc
def main_loop():
  f_simpleprint("Main Loop Start")
  traverse_entity_deque()
  f_simpleprint("Main Loop End")
  