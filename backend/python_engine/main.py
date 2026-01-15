import sys
import json
import openpyxl
import io

# ==========================================
# CONSOLE ENCODING FIX (Prevents Windows Crashes)
# ==========================================
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

# ==========================================
# HELPERS
# ==========================================
def find_sheet_by_keyword(wb, keyword):
    """Finds a sheet that contains the keyword (case-insensitive)"""
    # 1. Try exact match
    if keyword in wb.sheetnames:
        return wb[keyword]
        
    # 2. Try partial match
    for sheet_name in wb.sheetnames:
        if keyword.lower() in sheet_name.lower():
            return wb[sheet_name]
    return None

def unlock_sheet(ws):
    """Removes protection so we can write"""
    try:
        ws.protection.sheet = False
        ws.protection.enable() == False
    except:
        pass

def resolve_master_cell(ws, coord):
    """Handles merged cells (returns the top-left cell of a merge range)"""
    for rng in ws.merged_cells.ranges:
        if coord in rng:
            return rng.start_cell.coordinate
    return coord

def strict_write(ws, coord, value):
    """Writes value to cell safely"""
    if value is None:
        return
    
    try:
        final_coord = resolve_master_cell(ws, coord)
        ws[final_coord].value = value
        
        # Safe print for logs
        safe_val = str(value).encode('ascii', 'ignore').decode('ascii')
        print(f"   [WRITE] {ws.title}!{final_coord} = '{safe_val}'")
    except Exception as e:
        print(f"   [WRITE ERROR] Could not write to {coord}: {e}")

# ==========================================
# MAIN ENGINE
# ==========================================
def main():
    if len(sys.argv) < 4:
        print("Usage: main.py <template> <data> <output>")
        sys.exit(1)

    template_path = sys.argv[1]
    json_path = sys.argv[2]
    output_path = sys.argv[3]

    try:
        print(f"STARTING UNIVERSAL AUTOFILL...")
        print(f"   Template: {template_path}")
        
        # Load Workbook (keep_vba=True is essential for .xlsm)
        wb = openpyxl.load_workbook(template_path, keep_vba=True)

        # 1. Read the Instructions
        with open(json_path, "r", encoding='utf-8') as f:
            payload = json.load(f)
        
        instructions = payload.get("instructions", [])
        print(f"   Received {len(instructions)} write instructions.")

        # 2. Execute Instructions
        found_sheets = {} # Cache found sheets
        
        for instr in instructions:
            sheet_key = instr.get("sheet_keyword")
            cell = instr.get("cell")
            val = instr.get("value")

            # Find the sheet dynamically (with caching)
            if sheet_key in found_sheets:
                ws = found_sheets[sheet_key]
            else:
                ws = find_sheet_by_keyword(wb, sheet_key)
                if ws:
                    found_sheets[sheet_key] = ws
                    unlock_sheet(ws)

            if ws:
                strict_write(ws, cell, val)
            else:
                print(f"   [SKIP] Sheet matching '{sheet_key}' not found.")

        # 3. Save
        print(f"   Saving to: {output_path}")
        wb.save(output_path)
        print(f"   SUCCESS! File generated.")

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()