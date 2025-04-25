from .component import Component

class Position2D():
  x: int
  y: int
  

class TransformComponent(Component):
  position: Position2D