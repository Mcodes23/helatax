import sys
import json
import re
import openpyxl
from datetime import datetime
from openpyxl.cell.cell import MergedCell

# ==========================================
# ⚙️ CONFIGURATION & MAPPING
# ==========================================
# We use OFFICIAL KRA Validation addresses (Column D).
# The script automatically finds the "Real" writable cell (Column C) for these.
MAPPING = {
    "A_Basic_Info": {
        "PIN": "D2",            
        "RETURN_TYPE": "D3",    
        "PERIOD_FROM": "D4",    
        "PERIOD_TO": "D5",      
    },
    "D_Tax_Due": {
        "TURNOVER": "D6"        
    }
}

# ==========================================
# 🛡️ SAFE WRITING HELPERS (The Anti-Crash Logic)
# ==========================================
def validate_pin(pin):
    if not pin: return False
    return bool(re.match(r'^[A-Z]\d{9}[A-Z]$', pin))

def parse_date(date_str):
    """Converts string dates to Excel Date Objects."""
    try:
        return datetime.strptime(date_str, "%d/%m/%Y")
    except (ValueError, TypeError):
        return date_str

def get_master_cell_coordinate(ws, target_coord):
    """
    Magic Function: If we try to write to 'D2' but D2 is merged with C2,
    this returns 'C2'. Fixes the 'Ghost Cell' problem.
    """
    for merged_range in ws.merged_cells.ranges:
        if target_coord in merged_range:
            return merged_range.start_cell.coordinate
    return target_coord

def safe_write(ws, target_coord, value, description):
    """
    Writes to a cell safely. 
    1. Redirects to Master Cell if merged.
    2. Skips if it's a formula.
    """
    try:
        # 1. Resolve Merged Cells
        final_coord = get_master_cell_coordinate(ws, target_coord)
        cell = ws[final_coord]

        # 2. Safety: Don't overwrite formulas
        if cell.data_type == 'f' or str(cell.value).startswith('='):
            print(f"[SKIP] {description}: Cell {final_coord} is a formula.")
            return

        # 3. Write Data
        cell.value = value
        
        # Only log main fields to keep terminal clean
        if "Row" not in description:
            print(f"[WRITE] {description}: Wrote '{value}' to {final_coord}")

    except Exception as e:
        # Log error but DO NOT CRASH
        print(f"[ERROR] Failed to write {description} to {target_coord}: {str(e)}")

# ==========================================
# 🚀 MAIN SCRIPT
# ==========================================
def main():
    if len(sys.argv) < 4:
        print("[ERROR] Usage: main.py <template> <json> <output>")
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

        # Calculate Turnover
        income_tx = [t for t in transactions if t.get("type") == "INCOME"]
        expense_tx = [t for t in transactions if t.get("type") == "EXPENSE"]
        
        total_turnover = sum(float(t.get("amount", 0)) for t in income_tx)
        print(f"[CALC] Total Turnover: {total_turnover}")

        # -------------------------------------------
        # SHEET 1: A_Basic_Info (Identity)
        # -------------------------------------------
        if "A_Basic_Info" in wb.sheetnames:
            ws = wb["A_Basic_Info"]
            targets = MAPPING["A_Basic_Info"]

            safe_write(ws, targets["PIN"], meta.get("pin"), "KRA PIN")
            safe_write(ws, targets["RETURN_TYPE"], "Original", "Return Type")
            
            d_from = parse_date(meta.get("periodFrom"))
            d_to = parse_date(meta.get("periodTo"))
            safe_write(ws, targets["PERIOD_FROM"], d_from, "Period From")
            safe_write(ws, targets["PERIOD_TO"], d_to, "Period To")
        else:
            print("[ERROR] Sheet 'A_Basic_Info' missing!")

        # -------------------------------------------
        # SHEET 2: B_Details_of_Purchases (Expenses)
        # -------------------------------------------
        if "B_Details_of_Purchases" in wb.sheetnames and expense_tx:
            ws = wb["B_Details_of_Purchases"]
            print(f"[INFO] Filling {len(expense_tx)} purchase entries...")
            
            current_row = 3 # KRA lists start at Row 3
            
            for i, exp in enumerate(expense_tx):
                # 🟢 CRITICAL FIX: We use safe_write inside the loop too!
                # This prevents the 'MergedCell is read-only' crash.
                
                # Col A: PIN (Placeholder)
                safe_write(ws, f"A{current_row}", "P000000000P", f"Row {i} PIN")
                # Col B: Name (Placeholder)
                safe_write(ws, f"B{current_row}", "General Supplier", f"Row {i} Name")
                # Col C: Date
                safe_write(ws, f"C{current_row}", parse_date(exp.get('date')), f"Row {i} Date")
                # Col D: Inv No
                safe_write(ws, f"D{current_row}", f"INV-{i+1}", f"Row {i} Inv")
                # Col E: Desc
                safe_write(ws, f"E{current_row}", exp.get('description', 'Purchase'), f"Row {i} Desc")
                # Col F: Amount
                safe_write(ws, f"F{current_row}", float(exp.get('amount', 0)), f"Row {i} Amount")
                
                current_row += 1
                
            print(f"[SUCCESS] Filled Purchases up to Row {current_row}")

        # -------------------------------------------
        # SHEET 4: D_Tax_Due (The Calculation)
        # -------------------------------------------
        if "D_Tax_Due" in wb.sheetnames:
            ws = wb["D_Tax_Due"]
            targets = MAPPING["D_Tax_Due"]
            safe_write(ws, targets["TURNOVER"], total_turnover, "Turnover")
        else:
            print("[ERROR] Sheet 'D_Tax_Due' missing!")

        # Save
        wb.save(output_path)
        print(f"[SUCCESS] Saved to: {output_path}")

    except Exception as e:
        print(f"[CRITICAL ERROR] Script crashed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()