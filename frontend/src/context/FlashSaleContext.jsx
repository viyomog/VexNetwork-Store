import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const FlashSaleContext = createContext();

export const useFlashSale = () => useContext(FlashSaleContext);

export const FlashSaleProvider = ({ children }) => {
  const [flashSale, setFlashSale] = useState({ active: false });

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/public/flash-sale`);
        setFlashSale(res.data);
      } catch (err) {
        console.error('Failed to load flash sale');
      }
    };
    fetchFlashSale();
    
    // Poll every 60 seconds to keep it updated
    const interval = setInterval(fetchFlashSale, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FlashSaleContext.Provider value={{ flashSale }}>
      {children}
    </FlashSaleContext.Provider>
  );
};
