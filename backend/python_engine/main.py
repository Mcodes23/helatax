import sys
import json
import os
import xlwings as xw
from datetime import datetime

def parse_date(date_str):
    if not date_str: return None
    try:
        dt = datetime.strptime(str(date_str), "%d/%m/%Y")
        return dt.date()
    except:
        return date_str

def main():
    if len(sys.argv) < 4:
        print("[ERROR] Arguments missing")
        sys.exit(1)

    template_path = os.path.abspath(sys.argv[1])
    json_path = os.path.abspath(sys.argv[2])
    output_path = os.path.abspath(sys.argv[3])

    # [FIX] Removed Emoji to prevent UnicodeEncodeError on Windows
    print("--- Starting xlwings Engine ---")
    
    try:
        # 1. Load Data
        with open(json_path, "r") as f:
            data = json.load(f)
        
        meta = data.get("meta", {})
        transactions = data.get("transactions", [])

        # 2. Calculate Turnover
        income_tx = [t for t in transactions if t.get("type") == "INCOME"]
        total_turnover = sum(float(t.get("amount", 0)) for t in income_tx)
        print(f"[CALC] Turnover: {total_turnover}")

        # 3. Launch Excel
        # visible=False runs it in background. 
        # If it hangs, change to visible=True to see if there is a popup blocking it.
        app = xw.App(visible=False) 
        
        try:
            print(f"[EXCEL] Opening template...")
            wb = app.books.open(template_path)

            # ---------------------------------------------
            # SHEET A: Basic Info
            # ---------------------------------------------
            sheet_names = [s.name for s in wb.sheets]
            
            if "A_Basic_Info" in sheet_names:
                ws = wb.sheets["A_Basic_Info"]
                # Writing to D column (Excel handles the merge automatically)
                ws.range("D2").value = meta.get("pin")
                ws.range("D3").value = "Original"
                ws.range("D4").value = parse_date(meta.get("periodFrom")) 
                ws.range("D5").value = parse_date(meta.get("periodTo"))
                print("[WRITE] Basic Info Filled")

            # ---------------------------------------------
            # SHEET D: Tax Due
            # ---------------------------------------------
            if "D_Tax_Due" in sheet_names:
                ws = wb.sheets["D_Tax_Due"]
                ws.range("D6").value = total_turnover
                print("[WRITE] Turnover Filled")

            # 4. Save and Close
            wb.save(output_path)
            print(f"[SUCCESS] Saved to: {output_path}")
            wb.close()

        except Exception as e:
            print(f"[ERROR] Excel Operation Failed: {e}")
        finally:
            # Ensure Excel closes so it doesn't get stuck in Task Manager
            app.quit() 

    except Exception as e:
        print(f"[CRITICAL] Script Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()