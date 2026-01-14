import sys
import json
import shutil
import os
import uuid
from openpyxl import load_workbook

# 1. SETUP
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GENERATED_DIR = os.path.join(BASE_DIR, "../generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

# 2. SAFE WRITE HELPER
def safe_write(ws, coord, value):
    val_str = str(value) if value is not None else ""
    for range_ in ws.merged_cells.ranges:
        if coord in range_:
            ws[range_.start_cell.coordinate] = val_str
            return 
    ws[coord] = val_str

# 3. MAIN LOGIC
def process_return(template_path, data_path):
    try:
        # Load Data
        with open(data_path, 'r') as f:
            data = json.load(f)

        # Output Filename
        filename = f"return_{data.get('pin', 'user')}_{uuid.uuid4().hex[:6]}.xlsm"
        output_path = os.path.join(GENERATED_DIR, filename)
        
        # Copy Template
        shutil.copy(template_path, output_path)
        wb = load_workbook(output_path, keep_vba=True)

        # --- SECTION A: IDENTITY (Col B) ---
        if "A_Basic_Info" in wb.sheetnames:
            ws_info = wb["A_Basic_Info"]
            safe_write(ws_info, 'B3', data.get('pin', 'A000000000Z'))
            safe_write(ws_info, 'B4', 'Original')
            safe_write(ws_info, 'B5', data.get('fromDate', '01/01/2024'))
            safe_write(ws_info, 'B6', data.get('toDate', '31/01/2024'))

        # --- SECTION B: PURCHASES (Col A) ---
        if "B_Details_of_Purchases" in wb.sheetnames:
            ws_purchases = wb["B_Details_of_Purchases"]
            start_row = 3
            purchases = data.get('purchases', [])
            
            for i, p in enumerate(purchases):
                r = start_row + i
                
                # --- SMART DEFAULTS (Fix for missing data in trader_dataset) ---
                # If 'supplierPin' is missing, use a dummy to ensure row is visible
                pin = p.get('supplierPin') or "P000000000Z" 
                # If 'supplierName' is missing, use 'description' or 'General Supplier'
                name = p.get('supplierName') or p.get('description') or "General Supplier"
                inv_date = p.get('invoiceDate') or data.get('fromDate')
                inv_no = p.get('invoiceNo') or f"INV-{i+1:03d}"
                desc = p.get('description') or "Goods"
                amount = str(p.get('amount', '0'))

                # Write to Columns A-F (Shifted Logic)
                safe_write(ws_purchases, f"A{r}", pin)      # PIN
                safe_write(ws_purchases, f"B{r}", name)     # Name
                safe_write(ws_purchases, f"C{r}", inv_date) # Date
                safe_write(ws_purchases, f"D{r}", inv_no)   # Invoice
                safe_write(ws_purchases, f"E{r}", desc)     # Desc
                safe_write(ws_purchases, f"F{r}", amount)   # Amount

        # --- SECTION D: TAX DUE (Col C) ---
        if "D_Tax_Due" in wb.sheetnames:
            ws_tax = wb["D_Tax_Due"]
            safe_write(ws_tax, 'C4', str(data.get('turnover', '0')))

        wb.save(output_path)
        
        # PRINT ONLY FILENAME FOR NODE.JS
        print(filename)

    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        process_return(sys.argv[1], sys.argv[2])
    else:
        print("ERROR: Missing arguments")