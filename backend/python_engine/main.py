import sys
import json
import pandas as pd
import openpyxl
from openpyxl.utils.exceptions import InvalidFileException
from datetime import datetime

def main():
    try:
        # 1. Validation
        if len(sys.argv) < 4:
            print("[ERROR] Missing arguments.")
            sys.exit(1)

        template_path = sys.argv[1]
        json_data_path = sys.argv[2]
        output_path = sys.argv[3]

        print(f"[INFO] Loading Template: {template_path}")

        # 2. Load Workbook (Keep VBA Macros)
        try:
            wb = openpyxl.load_workbook(template_path, keep_vba=True)
        except InvalidFileException:
            print("[ERROR] Invalid Excel file.")
            sys.exit(1)

        # 3. Load Data Packet
        with open(json_data_path, 'r') as f:
            data_packet = json.load(f)
        
        # Extract the two parts we sent from Node.js
        transactions = data_packet.get("transactions", [])
        meta = data_packet.get("meta", {})

        # 4. Calculate Turnover
        df = pd.DataFrame(transactions)
        total_turnover = 0
        if not df.empty and 'type' in df.columns and 'amount' in df.columns:
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
            total_turnover = df[df['type'] == 'INCOME']['amount'].sum()
        
        print(f"[CALC] Total Turnover: {total_turnover}")

        # =======================================================
        # 🟢 FINAL CONFIGURATION: ALL FIELDS MAPPED TO COLUMN C
        # =======================================================

        # --- SHEET 1: A_Basic_Info ---
        if "A_Basic_Info" in wb.sheetnames:
            ws = wb["A_Basic_Info"]
            
            # PIN -> Cell C2
            ws["C2"] = meta.get("pin", "A000000000Z")
            print(f"[WRITE] PIN -> C2")

            # Return Type -> Cell C3
            ws["C3"] = meta.get("returnType", "Original")
            print("[WRITE] Type -> C3")

            # Dates -> Cell C4 & C5
            # We try to convert them to real Excel dates, else strings
            try:
                d_from = datetime.strptime(meta.get("periodFrom"), "%d/%m/%Y")
                d_to = datetime.strptime(meta.get("periodTo"), "%d/%m/%Y")
                ws["C4"] = d_from
                ws["C5"] = d_to
                print(f"[WRITE] Dates {d_from} - {d_to} -> C4, C5")
            except:
                ws["C4"] = meta.get("periodFrom")
                ws["C5"] = meta.get("periodTo")
                print("[WRITE] Dates (String) -> C4, C5")

        else:
            print("[ERROR] Sheet 'A_Basic_Info' missing!")

        # --- SHEET 2: D_Tax_Due ---
        if "D_Tax_Due" in wb.sheetnames:
            ws = wb["D_Tax_Due"]
            
            # Turnover -> Cell C6
            ws["C6"] = total_turnover
            print(f"[WRITE] Turnover {total_turnover} -> C6")
            
        else:
            print("[ERROR] Sheet 'D_Tax_Due' missing!")

        # 6. Save (Must be .xlsm)
        wb.save(output_path)
        print(f"[SUCCESS] Saved to: {output_path}")

    except Exception as e:
        print(f"[CRITICAL ERROR] {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()