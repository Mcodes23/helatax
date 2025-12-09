import { createContext, useState, useContext, useCallback } from "react"; // <--- Import useCallback

const FilingContext = createContext();

export const FilingProvider = ({ children }) => {
  const [filingData, setFilingData] = useState({
    file: null,
    parsedData: [],
    taxSummary: null,
    filingId: null,
  });

  const updateFiling = useCallback((newData) => {
    setFilingData((prev) => ({ ...prev, ...newData }));
  }, []);

  const resetFiling = useCallback(() => {
    setFilingData({
      file: null,
      parsedData: [],
      taxSummary: null,
      filingId: null,
    });
  }, []);

  return (
    <FilingContext.Provider value={{ filingData, updateFiling, resetFiling }}>
      {children}
    </FilingContext.Provider>
  );
};

export const useFiling = () => {
  return useContext(FilingContext);
};
