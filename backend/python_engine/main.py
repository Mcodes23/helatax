import sys
import json
import openpyxl
from datetime import datetime
import re

# ==========================================
# ⚙️ AGGRESSIVE CONFIGURATION
# ==========================================
SHEET_BASIC_INFO = "A_Basic_Info"
SHEET_TAX_DUE = "D_Tax_Due"
TARGET_COLUMN_INDEX = 3 # Column C

def clean_text(text):
    """Removes special chars like *, spaces, newlines for easier matching."""
    if not text: return ""
    # Remove * and extra spaces
    return re.sub(r'[^a-zA-Z0-9]', '', str(text)).lower()

def find_row_aggressive(ws, search_keyword):
    """
    Scans the first 20 rows and 5 columns.
    Matches loosely (e.g. "Personal" will match "Personal Identification Number *").
    """
    search_clean = clean_text(search_keyword)
    print(f"   [SEARCHING] Looking for '{search_keyword}' (Cleaned: '{search_clean}')")

    for row in ws.iter_rows(min_row=1, max_row=20, max_col=5):
        for cell in row:
            cell_text = clean_text(cell.value)
            if search_clean in cell_text:
                print(f"   [FOUND] '{search_keyword}' found at {cell.coordinate} (Row {cell.row})")
                return cell.row
    
    print(f"   [FAILED] Could not find '{search_keyword}' in first 20 rows.")
    return None

def write_cell(ws, row, value, label):
    """Writes to Column C (3) at the given row."""
    try:
        cell = ws.cell(row=row, column=TARGET_COLUMN_INDEX)
        # Safety check
        if cell.data_type == 'f' or str(cell.value).startswith('='):
            print(f"[SKIP] {label}: C{row} is a formula.")
            return
        
        cell.value = value
        print(f"[WRITE] {label}: Wrote '{value}' to C{row}")
    except Exception as e:
        print(f"[ERROR] {label}: {e}")

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%d/%m/%Y")
    except:
        return date_str

def main():
    if len(sys.argv) < 4:
        print("[ERROR] Arguments missing")
        sys.exit(1)

    template_path = sys.argv[1]
    json_path = sys.argv[2]
    output_path = sys.argv[3]

    try:
        print(f"[INFO] Loading Template: {template_path}")
        wb = openpyxl.load_workbook(template_path, keep_vba=True)

        with open(json_path, "r") as f:
            data = json.load(f)
        
        meta = data.get("meta", {})
        transactions = data.get("transactions", [])

        # Turnover Calc
        total_turnover = sum(
            float(t.get("amount", 0)) for t in transactions if t.get("type") == "INCOME"
        )

        # ----------------------------------------------------
        # 1. SHEET A_Basic_Info
        # ----------------------------------------------------
        if SHEET_BASIC_INFO in wb.sheetnames:
            ws = wb[SHEET_BASIC_INFO]
            print(f"--- Processing {SHEET_BASIC_INFO} ---")

            # Search keywords simplified to single words to avoid mismatch
            row_pin = find_row_aggressive(ws, "Personal")  # Matches "Personal Identification..."
            if row_pin: write_cell(ws, row_pin, meta.get("pin"), "PIN")

            row_type = find_row_aggressive(ws, "Type")     # Matches "Type of Return"
            if row_type: write_cell(ws, row_type, "Original", "Return Type")

            row_from = find_row_aggressive(ws, "From")     # Matches "Return Period From"
            if row_from: write_cell(ws, row_from, parse_date(meta.get("periodFrom")), "Date From")

            row_to = find_row_aggressive(ws, "To")         # Matches "Return Period To"
            if row_to: write_cell(ws, row_to, parse_date(meta.get("periodTo")), "Date To")

        # ----------------------------------------------------
        # 2. SHEET D_Tax_Due
        # ----------------------------------------------------
        if SHEET_TAX_DUE in wb.sheetnames:
            ws = wb[SHEET_TAX_DUE]
            print(f"--- Processing {SHEET_TAX_DUE} ---")

            row_turnover = find_row_aggressive(ws, "Turnover") # Matches "Turnover for the Period"
            if row_turnover: write_cell(ws, row_turnover, total_turnover, "Turnover")

        wb.save(output_path)
        print(f"[SUCCESS] Saved to {output_path}")

    except Exception as e:
        print(f"[CRITICAL ERROR] {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()