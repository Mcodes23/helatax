import sys
import json
import pandas as pd
import openpyxl
from openpyxl.utils.exceptions import InvalidFileException

# ==========================================
# 🔧 CONFIGURATION (ADJUST THIS FOR YOUR FORM)
# ==========================================
# Open your KRA Excel Template and find the cell 
# where "Total Gross Turnover" should go.
# Example: 'E24', 'D10', etc.
TARGET_SHEET_NAME = "D_Tax_Due"  # <--- Correct Sheet Name
TARGET_CELL_TURNOVER = "D6"  # <--- CHANGE THIS to match your specific KRA Excel file
# ==========================================

def main():
    try:
        # 1. Get Arguments from Node.js
        # argv[0] is script name, argv[1] is template path, argv[2] is data path, argv[3] is output path
        if len(sys.argv) < 4:
            print("Error: Missing arguments. Usage: main.py <template> <json_data> <output>")
            sys.exit(1)

        template_path = sys.argv[1]
        json_data_path = sys.argv[2]
        output_path = sys.argv[3]

        print(f"Loading Template: {template_path}")

        # 2. Load the KRA Excel Template
        # keep_vba=True is CRITICAL to preserve Macros (.xlsm)
        try:
            wb = openpyxl.load_workbook(template_path, keep_vba=True)
        except InvalidFileException:
            print("Error: The file uploaded is not a valid Excel file.")
            sys.exit(1)

        # 3. Load the User's Data (JSON)
        with open(json_data_path, 'r') as f:
            raw_data = json.load(f)
        
        # Convert to Pandas DataFrame for easy math
        df = pd.DataFrame(raw_data)

        # 4. Calculate Total Sales (Turnover)
        # We filter for 'INCOME' and sum the 'amount'
        if not df.empty and 'type' in df.columns and 'amount' in df.columns:
            # Ensure amount is numeric
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
            
            # Filter: Only INCOME
            income_df = df[df['type'] == 'INCOME']
            
            # Calculate Total
            total_turnover = income_df['amount'].sum()
        else:
            total_turnover = 0

        print(f"Calculated Total Turnover: {total_turnover}")

        # 5. Inject into Excel
        if TARGET_SHEET_NAME in wb.sheetnames:
            ws = wb[TARGET_SHEET_NAME]
            
            # Write the value!
            ws[TARGET_CELL_TURNOVER] = total_turnover
            print(f"Injected {total_turnover} into Sheet '{TARGET_SHEET_NAME}' Cell '{TARGET_CELL_TURNOVER}'")
            
        else:
            # Fallback: specific sheet not found, try the active one
            print(f"Sheet '{TARGET_SHEET_NAME}' not found. Writing to active sheet.")
            ws = wb.active
            ws[TARGET_CELL_TURNOVER] = total_turnover

        # 6. Save the Result
        wb.save(output_path)
        print(f"Saved filled return to: {output_path}")

    except Exception as e:
        print(f"Python Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()