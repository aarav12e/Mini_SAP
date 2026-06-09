import React, { createContext, useContext, useState, useCallback } from 'react';

const ERPContext = createContext(null);

export const TCODE_MAP = {
  'S000': 'home', 'HOME': 'home',
  // HR
  'PA30': 'hr', 'PA40': 'hr', 'PA61': 'hr', 'PC00': 'hr', 'PT60': 'hr',
  // Finance
  'FB01': 'finance', 'FB50': 'finance', 'F-02': 'finance', 'FBL1N': 'finance', 'FBL5N': 'finance', 'FS10N': 'finance',
  // Inventory
  'MM01': 'inventory', 'MB1A': 'inventory', 'MB1C': 'inventory', 'MB52': 'inventory', 'MB51': 'inventory', 'MIGO': 'inventory',
  // Sales
  'VA01': 'sales', 'VA02': 'sales', 'VA03': 'sales', 'VF01': 'sales', 'VF03': 'sales', 'VL01N': 'sales',
  // Customer / Vendor
  'XD01': 'customers', 'XD02': 'customers', 'XD03': 'customers',
  'XK01': 'vendors', 'XK02': 'vendors', 'XK03': 'vendors',
  // Workbench
  'SE11': 'se11', 'SE16': 'se16n', 'SE16N': 'se16n',
  'SE38': 'se38', 'SE80': 'se80',
  'SE37': 'se37', 'SE24': 'se24',
  'SE91': 'se91',
  'SM37': 'sm37', 'SM50': 'sm50',
  'ST22': 'st22',
  'SU01': 'su01',
  // Reporting
  'S_ALR_87': 'report', 'MC.1': 'report',
};

export const ERPProvider = ({ children }) => {
  const [currentTcode, setCurrentTcode] = useState('S000');
  const [currentScreen, setCurrentScreen] = useState('home');
  const [statusMsg, setStatusMsg] = useState({ text: 'System ready.', type: 'info' });
  const [navExpanded, setNavExpanded] = useState({ hr: false, fi: false, mm: false, sd: false, wb: false, rep: false, admin: false });

  const navigate = useCallback((tcode) => {
    const tc = tcode.toUpperCase();
    const screen = TCODE_MAP[tc];
    if (screen) {
      setCurrentTcode(tc);
      setCurrentScreen(screen);
      setStatusMsg({ text: `Transaction ${tc} called.`, type: 'info' });
    } else {
      setStatusMsg({ text: `Transaction ${tc} not found in system. Check T-code.`, type: 'error' });
    }
  }, []);

  const setStatus = useCallback((text, type = 'info') => {
    setStatusMsg({ text, type });
  }, []);

  const toggleNav = useCallback((key) => {
    setNavExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <ERPContext.Provider value={{
      currentTcode, currentScreen, statusMsg,
      navExpanded, navigate, setStatus, toggleNav, setCurrentScreen, setCurrentTcode
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => useContext(ERPContext);
