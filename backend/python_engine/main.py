import sys
import json
# Wrap import in try-except to debug installation issues
try:
    import openpyxl
    from datetime import datetime
except ImportError:
    print("CRITICAL ERROR: 'openpyxl' library not found. Run: pip install openpyxl")
    sys.exit(1)

# ==========================================
# 🧠 HELPER FUNCTIONS
# ==========================================
def get_master_cell(ws, cell_address):
    for merged_range in ws.merged_cells.ranges:
        if cell_address in merged_range:
            return merged_range.start_cell.coordinate
    return cell_address

def force_write(ws, cell_address, value, label):
    try:
        if value is None:
            print(f"SKIP: No value for {label}")
            return
        master_coord = get_master_cell(ws, cell_address)
        ws[master_coord].value = value
        print(f"FORCE WRITE: {label} -> {master_coord} = {value}")
    except Exception as e:
        print(f"ERROR writing {label}: {str(e)}")

def find_input_cell(ws, label_text):
    label_clean = label_text.lower().replace("*", "").strip()
    for row in ws.iter_rows(min_row=1, max_row=30, max_col=2):
        for cell in row:
            if cell.value and label_clean in str(cell.value).lower().strip():
                target_cell = ws.cell(row=cell.row, column=3) 
                return get_master_cell(ws, target_cell.coordinate)
    return None

def parse_date(date_str):
    if not date_str: return None
    try:
        return datetime.strptime(str(date_str), "%d/%m/%Y")
    except:
        return date_str

# ==========================================
# 🚀 MAIN SCRIPT
# ==========================================
def main():
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding='utf-8')

    if len(sys.argv) < 4:
        print("ERROR: Missing arguments")
        sys.exit(1)

    template_path = sys.argv[1]
    json_path = sys.argv[2]
    output_path = sys.argv[3]

    try:
        print("LOADING: " + template_path)
        wb = openpyxl.load_workbook(template_path, keep_vba=True)
        
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        meta = data.get("meta", {})
        transactions = data.get("transactions", [])

        # 1. Calculate Turnover
        income_tx = [t for t in transactions if t.get("type") == "INCOME"]
        total_turnover = sum(float(t.get("amount", 0)) for t in income_tx)
        print("CALCULATED TURNOVER: " + str(total_turnover))

        # 2. Fill Basic Info (Targeting Row 3 based on Inspector)
        if "A_Basic_Info" in wb.sheetnames:
            ws = wb["A_Basic_Info"]
            
            # PIN -> Row 3
            force_write(ws, "C3", meta.get("pin"), "PIN")
            
            # Return Type -> Row 4
            force_write(ws, "C4", "Original", "Return Type")
            
            # Date From -> Row 5
            force_write(ws, "C5", parse_date(meta.get("periodFrom")), "Period From")
            
            # Date To -> Row 6
            force_write(ws, "C6", parse_date(meta.get("periodTo")), "Period To")
        else:
            print("WARNING: Sheet A_Basic_Info missing (Are you using the Mock file?)")

        # 3. Fill Turnover (Smart Search)
        if "D_Tax_Due" in wb.sheetnames:
            ws = wb["D_Tax_Due"]
            target = find_input_cell(ws, "Turnover for the Period")
            if target:
                force_write(ws, target, total_turnover, "Turnover")
            else:
                print("SEARCH FAILED: Defaulting Turnover to C6")
                force_write(ws, "C6", total_turnover, "Turnover (Fallback)")

        wb.save(output_path)
        print("SUCCESS: File generated")

    except Exception as e:
        print("CRITICAL FAILURE: " + str(e))
        sys.exit(1)

if __name__ == "__main__":
    main()