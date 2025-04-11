def reverse_tbl_dict(tbl_dict: dict[str, int]) -> dict[int, str]:
  return {v: k for k, v in tbl_dict.items()}