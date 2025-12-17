import sys
import json
from datetime import datetime

import openpyxl
from openpyxl.cell.cell import MergedCell


# ==========================================
# 🔧 Helper Functions
# ==========================================

def parse_date(date_str):
    """
    Parse a date in 'DD/MM/YYYY' format into a datetime object.
    Returns None if the input is falsy or cannot be parsed.
    """
    if not date_str:
        return None
    if isinstance(date_str, datetime):
        return date_str
    try:
        return datetime.strptime(str(date_str), "%d/%m/%Y")
    except Exception:
        return None


def get_master_cell(ws, coord):
    """
    Given a worksheet and a target coordinate (e.g. 'D6'):
      - If the coordinate falls inside a merged range, return the
        top-left (master) cell of that merged range (e.g. 'C6').
      - Otherwise, return the original coordinate.
    """
    if not ws.merged_cells.ranges:
        return coord

    for merged_range in ws.merged_cells.ranges:
        # Membership works with the coordinate string, e.g. "D6"
        if coord in merged_range:
            master = merged_range.start_cell.coordinate
            if master != coord:
                print(f"[MERGE] {coord} is merged; using master {master}")
            return master

    return coord


def safe_write(ws, coord, value, description=""):
    """
    Safely write a value to a coordinate:
      - Resolves merged cells using get_master_cell (always writes to master).
      - Skips writing if the final cell is a read-only MergedCell placeholder.
      - Skips writing if the final cell currently contains a formula
        (data_type == 'f' or value starts with '=').
      - Ignores None values.
    """
    if coord is None:
        return

    master_coord = get_master_cell(ws, coord)
    cell = ws[master_coord]

    # Do not write into read-only merged placeholders
    if isinstance(cell, MergedCell):
        print(f"[SKIP] {master_coord} is a MergedCell placeholder; cannot write.")
        return

    # Protect formula cells (e.g., tax calculations)
    if cell.data_type == "f" or (isinstance(cell.value, str) and cell.value.startswith("=")):
        print(f"[SKIP] {master_coord} contains a formula; not overwriting.")
        return

    if value is None:
        print(f"[SKIP] {master_coord} value is None; nothing to write.")
        return

    try:
        cell.value = value
        label = f" ({description})" if description else ""
        print(f"[WRITE]{label} -> {master_coord}: {value}")
    except Exception as exc:
        print(f"[FAIL] Could not write to {master_coord}: {exc}")


# ==========================================
# 🚀 Sheet Fillers (A & D only)
# ==========================================

def fill_basic_info(wb, meta):
    """
    Fill 'A_Basic_Info' sheet with:
      - PIN          -> Row 2 (Target D2 -> Master C2)
      - Type of Return (Original) -> Row 3 (D3 -> C3)
      - Period From  -> Row 4 (D4 -> C4)
      - Period To    -> Row 5 (D5 -> C5)
    All writes use safe_write so merged cells are handled correctly.
    """
    sheet_name = "A_Basic_Info"
    if sheet_name not in wb.sheetnames:
        print(f"[WARN] Sheet '{sheet_name}' not found; skipping basic info.")
        return

    ws = wb[sheet_name]
    print(f"--- Filling {sheet_name} ---")

    pin = meta.get("pin")
    period_from = parse_date(meta.get("periodFrom"))
    period_to = parse_date(meta.get("periodTo"))

    # Always use "Original" unless explicitly overridden
    return_type = meta.get("returnType", "Original")

    safe_write(ws, "D2", pin, "PIN")
    safe_write(ws, "D3", return_type, "Type of Return")
    safe_write(ws, "D4", period_from, "Period From")
    safe_write(ws, "D5", period_to, "Period To")


def fill_tax_due(wb, total_turnover):
    """
    Fill 'D_Tax_Due' sheet with:
      - Turnover for the Period -> Row 6 (Target D6 -> Master C6)

    IMPORTANT:
      - This function ONLY writes the Turnover input.
      - It does NOT touch tax rate, tax due, or net tax payable cells,
        which are handled by Excel formulas.
    """
    sheet_name = "D_Tax_Due"
    if sheet_name not in wb.sheetnames:
        print(f"[WARN] Sheet '{sheet_name}' not found; skipping tax due.")
        return

    ws = wb[sheet_name]
    print(f"--- Filling {sheet_name} ---")

    safe_write(ws, "D6", total_turnover, "Turnover for the Period")


# ==========================================
# 🏁 Main Entry Point
# ==========================================

def main():
    # Expect: script.py template_path json_data_path output_path
    if len(sys.argv) != 4:
        print(
            "[ERROR] Invalid arguments.\n"
            "Usage: python main.py <template_path> <json_data_path> <output_path>"
        )
        sys.exit(1)

    template_path = sys.argv[1]
    json_path = sys.argv[2]
    output_path = sys.argv[3]

    try:
        print(f"[INFO] Loading Excel template: {template_path}")
        wb = openpyxl.load_workbook(template_path, keep_vba=True, data_only=False)

        print(f"[INFO] Loading JSON data: {json_path}")
        with open(json_path, "r", encoding="utf-8") as f:
            payload = json.load(f)

        meta = payload.get("meta", {})
        transactions = payload.get("transactions", []) or []

        # 1. Calculate total turnover from INCOME transactions
        total_turnover = 0.0
        income_txs = [t for t in transactions if t.get("type") == "INCOME"]
        for t in income_txs:
            raw_amount = t.get("amount", 0)
            try:
                total_turnover += float(raw_amount)
            except Exception:
                print(f"[WARN] Could not parse income amount '{raw_amount}', treating as 0.")

        print(f"[CALC] Total Turnover (INCOME sum): {total_turnover}")

        # 2. Fill required sheets only
        fill_basic_info(wb, meta)
        fill_tax_due(wb, total_turnover)

        # 3. Save result
        wb.save(output_path)
        print(f"[SUCCESS] Filled return saved to: {output_path}")

    except Exception as exc:
        print(f"[CRITICAL ERROR] {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()