import logging
import sys
import rich.table

from logging.handlers import RotatingFileHandler
from rich.logging import RichHandler
from rich.console import Console
from rich.text import Text

RICH_FORMAT = "[%(filename)s:%(lineno)s] >> %(message)s"
FILE_HANDLER_FORMAT = (
  "[%(asctime)s]\t%(levelname)s\t[%(filename)s:%(funcName)s:%(lineno)s]\t>> %(message)s"
)


def setup_logging(level=logging.INFO, log_file="logs/app.log"):
  print("Logging is set up")
  file_handler = RotatingFileHandler(
    log_file, maxBytes=10_000_000, backupCount=5, encoding="utf-8"
  )
  file_handler.setFormatter(logging.Formatter(FILE_HANDLER_FORMAT))
  console = Console(width=150, highlight=True, soft_wrap=False)
  console_handler = RichHandler(
    console=console, show_path=True, markup=True, rich_tracebacks=True
  )

  logging.basicConfig(
    level=level,
    format=RICH_FORMAT,
    datefmt="[%X]",
    handlers=[console_handler, file_handler],
  )

  def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
      sys.__excepthook__(exc_type, exc_value, exc_traceback)
      return
    logger = logging.getLogger("exception")
    logger.error("Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback))

  for uvicorn_logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
    uvicorn_logger = logging.getLogger(uvicorn_logger_name)
    uvicorn_logger.handlers = [console_handler]
    uvicorn_logger.setLevel(level)

  sys.excepthook = handle_exception


def get_logger(name: str) -> logging.Logger:
  return logging.getLogger(name)


def log_rich_table(table: "rich.table.Table", level=logging.INFO, logger_name="app"):
  console = getattr(logging, "rich_console", Console())
  logger = logging.getLogger(logger_name)
  with console.capture() as capture:
    console.print(table)

  logger.log(level, Text.from_ansi(capture.get()))
