from io import BytesIO
from eudplib import GetChkTokenized
from app.services.mapdata.chk import CHK, CHKBuilder
from app.services.mapdata.io import build_map, get_chk_data, get_chkt, get_map
from eudplib.core.mapdata.chktok import CHK as EPCHK
from eudplib.maprw.loadmap import LoadMap
from rich.console import Console
from rich.table import Table

def check(original: EPCHK, serialized: EPCHK):
  print("Start check")
  original.optimize()
  
  print(
  f"Size Comparison,\
  Original: {len(original.savechk())},\
  Serialized: {len(serialized.savechk())}"
  )
  
  original_section_list = original.enumsection()
  serialized_section_list = serialized.enumsection()
  missing = [s for s in original_section_list if s not in serialized_section_list]
  missed: bool = len(missing) != 0
  
  print(f"Missing Section: {missing if missed else 'None'}")
  
  print("Section size comparison started")
  
  USED_SECTION = (
      "VER", "VCOD", "OWNR", "SIDE", "COLR", "ERA", "DIM", "MTXM",
      "UNIT", "PUNI", "UNIx", "PUPx", "UPGx", "THG2", "MASK", "MRGN",
      "STRx", "SPRP", "FORC", "PTEx", "TECx", "MBRF", "TRIG", "UPRP"
  )
  NOT_EQUAL_SECTION = []

  console = Console()
  length_equal_table = Table(show_header=True, header_style="bold magenta")
  length_equal_table.add_column("Section Name")
  length_equal_table.add_column("Original Length")
  length_equal_table.add_column("Serialized Length")
  length_equal_table.add_column("Matching?")

  for section_name in USED_SECTION:
    o = original.getsection(section_name)
    s = serialized.getsection(section_name)
    is_equal: bool = len(o) == len(s)

    if not is_equal:
      length_equal_table.add_row(
        f"[red][bold]{section_name}",
        f"[red][bold]{str(len(o))}",
        f"[red][bold]{str(len(s))}",
        "[red][bold]NO"
      )
      NOT_EQUAL_SECTION.append(section_name)
    else:
      length_equal_table.add_row(section_name, str(len(o)), str(len(s)), "YES")
      
    
  console.print(length_equal_table)
  if len(NOT_EQUAL_SECTION) != 0:
    print(f"Total unmatched sections {NOT_EQUAL_SECTION}")
  
  content_equal_table = Table(show_header=True, header_style="bold magenta")
  content_equal_table.add_column("Section Name")
  content_equal_table.add_column("Equal?")

  for section_name in USED_SECTION:
    o = original.getsection(section_name)
    s = serialized.getsection(section_name)
    is_equal: bool = o == s

    if not is_equal:
      content_equal_table.add_row(
        f"[red][bold]{section_name}",
        "[red][bold]NO"
      )
    else:
      content_equal_table.add_row(
        f"{section_name}",
        "YES"
      )
  console.print(content_equal_table)

def build(filename: str):
  output_filename = "backend/example/output/" + filename
  filename = "backend/example/" + filename

  with open(filename, "rb") as f:
    chkt = get_chkt(BytesIO(f.read()))
    chk = CHK(chkt)
    map = get_map(chk)
    
    serializer = CHKBuilder(map)
    serialized_result = serializer.to_bytes()
    
    LoadMap(filename)
    original_chk = GetChkTokenized()

    chkt.loadchk(serialized_result)

    check(original_chk, chkt)
     
    """
    You can set delete=False to get file, but filename will be randomized UUID.
    I recommend save map by with open("YOUR_PATH_TO_SAVE_MAP") as f: and save by mandatory.
    """
    map_bytes = build_map(map)
    with open(output_filename, "wb") as outf:
      outf.write(map_bytes)
  
build("hello12345.scx")