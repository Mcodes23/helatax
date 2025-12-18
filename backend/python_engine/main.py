import sys
import json
import openpyxl
from datetime import datetime

# ==========================================
# ⚙️ CONFIGURATION (KRA MASTER INPUT CELLS)
# ==========================================
MAPPING = {
    "A_Basic_Info": {
        "PIN": "C2",
        "RETURN_TYPE": "C3",
        "PERIOD_FROM": "C4",
        "PERIOD_TO": "C5",
    },
    "D_Tax_Due": {
        "TURNOVER": "C6"
    }
}

# ==========================================
# 🛡️ HELPERS
# ==========================================
def parse_date(value):
    """Accepts YYYY-MM-DD or DD/MM/YYYY → returns datetime"""
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(str(value), fmt)
        except ValueError:
            continue
    return value  # fallback (Excel will handle)

def resolve_master_cell(ws, coord):
    """Return top-left cell of merged range if applicable"""
    for rng in ws.merged_cells.ranges:
        if coord in rng:
            return rng.start_cell.coordinate
    return coord

def safe_write(ws, coord, value, label):
    """Force-write to KRA input cells only"""
    try:
        final_coord = resolve_master_cell(ws, coord)
        ws[final_coord].value = value
        print(f"[WRITE] {label}: {value} → {ws.title}!{final_coord}")
    except Exception as e:
        print(f"[ERROR] {label} failed at {coord}: {str(e)}")

# ==========================================
# 🚀 MAIN
# ==========================================
def main():
    if len(sys.argv) < 4:
        print("Usage: main.py <template.xlsm> <data.json> <output.xlsm>")
        sys.exit(1)

    template_path = sys.argv[1]
    json_path = sys.argv[2]
    output_path = sys.argv[3]

    try:
        print(f"[LOAD] {template_path}")
        wb = openpyxl.load_workbook(template_path, keep_vba=True)

        with open(json_path, "r") as f:
            payload = json.load(f)

        meta = payload.get("meta", {})
        transactions = payload.get("transactions", [])

        # ----------------------------------
        # Calculate Gross Turnover (INCOME)
        # ----------------------------------
        total_turnover = sum(
            float(t.get("amount", 0))
            for t in transactions
            if t.get("type") == "INCOME"
        )

        print(f"[CALC] Gross Turnover: {total_turnover}")

        # ----------------------------------
        # A_Basic_Info
        # ----------------------------------
        if "A_Basic_Info" not in wb.sheetnames:
            raise Exception("Sheet A_Basic_Info missing")

        ws_info = wb["A_Basic_Info"]
        m = MAPPING["A_Basic_Info"]

        safe_write(ws_info, m["PIN"], meta.get("pin"), "KRA PIN")
        safe_write(ws_info, m["RETURN_TYPE"], "Original", "Return Type")
        safe_write(ws_info, m["PERIOD_FROM"], parse_date(meta.get("periodFrom")), "Period From")
        safe_write(ws_info, m["PERIOD_TO"], parse_date(meta.get("periodTo")), "Period To")

        # ----------------------------------
        # D_Tax_Due (INPUT ONLY)
        # ----------------------------------
        if "D_Tax_Due" not in wb.sheetnames:
            raise Exception("Sheet D_Tax_Due missing")

        ws_tax = wb["D_Tax_Due"]
        safe_write(ws_tax, MAPPING["D_Tax_Due"]["TURNOVER"], total_turnover, "Turnover")

        # ----------------------------------
        # SAVE
        # ----------------------------------
        wb.save(output_path)
        print(f"[SUCCESS] Saved valid KRA return → {output_path}")

    except Exception as e:
        print(f"[CRITICAL] {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
