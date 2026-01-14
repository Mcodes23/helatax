import sys
import json
import shutil
import os
import uuid
from openpyxl import load_workbook

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GENERATED_DIR = os.path.join(BASE_DIR, "../generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

def safe_write(ws, coord, value, is_number=False):
    # Convert to number if flag is set, otherwise string
    if is_number:
        try:
            val_str = str(value).replace(',', '').strip()
            final_val = float(val_str) if '.' in val_str else int(val_str)
        except:
            final_val = 0
    else:
        final_val = str(value) if value is not None else ""

    for range_ in ws.merged_cells.ranges:
        if coord in range_:
            ws[range_.start_cell.coordinate] = final_val
            return 
    ws[coord] = final_val

def process_return(template_path, data_path):
    try:
        with open(data_path, 'r') as f:
            data = json.load(f)

        filename = f"return_{data.get('pin', 'user')}_{uuid.uuid4().hex[:6]}.xlsm"
        output_path = os.path.join(GENERATED_DIR, filename)
        shutil.copy(template_path, output_path)
        
        wb = load_workbook(output_path, keep_vba=True)

        # Section A: Identity (Col B)
        if "A_Basic_Info" in wb.sheetnames:
            ws = wb["A_Basic_Info"]
            safe_write(ws, 'B3', data.get('pin', ''))
            safe_write(ws, 'B4', 'Original')
            safe_write(ws, 'B5', data.get('fromDate', ''))
            safe_write(ws, 'B6', data.get('toDate', ''))

        # Section B: Purchases (Col A)
        if "B_Details_of_Purchases" in wb.sheetnames:
            ws = wb["B_Details_of_Purchases"]
            start_row = 3
            purchases = data.get('purchases', [])
            
            for i, p in enumerate(purchases):
                r = start_row + i
                safe_write(ws, f"A{r}", p.get('supplierPin'))
                safe_write(ws, f"B{r}", p.get('supplierName'))
                safe_write(ws, f"C{r}", p.get('invoiceDate'))
                safe_write(ws, f"D{r}", p.get('invoiceNo'))
                safe_write(ws, f"E{r}", p.get('description'))
                # Write Amount as NUMBER
                safe_write(ws, f"F{r}", p.get('amount', 0), is_number=True)

        # Section D: Tax Due (Col C)
        if "D_Tax_Due" in wb.sheetnames:
            ws = wb["D_Tax_Due"]
            # Write Turnover as NUMBER
            safe_write(ws, 'C4', data.get('turnover', 0), is_number=True)

        wb.save(output_path)
        print(filename)

    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        process_return(sys.argv[1], sys.argv[2])
    else:
        print("ERROR: Missing arguments")