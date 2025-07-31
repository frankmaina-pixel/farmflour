import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  Supplier, 
  MaizePurchase, 
  GrindingRecord, 
  Customer, 
  FlourSale, 
  Inventory,
  AppSettings,
  Transport,
  Delivery 
} from '@/types';

interface AppState {
  suppliers: Supplier[];
  purchases: MaizePurchase[];
  grindings: GrindingRecord[];
  customers: Customer[];
  sales: FlourSale[];
  inventory: Inventory;
  settings: AppSettings;
  transports: Transport[];
  deliveries: Delivery[];
  isAuthenticated: boolean;
}

type AppAction = 
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'ADD_PURCHASE'; payload: MaizePurchase }
  | { type: 'ADD_GRINDING'; payload: GrindingRecord }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'ADD_SALE'; payload: FlourSale }
  | { type: 'ADD_TRANSPORT'; payload: Transport }
  | { type: 'UPDATE_TRANSPORT'; payload: { id: string; updates: Partial<Transport> } }
  | { type: 'ADD_DELIVERY'; payload: Delivery }
  | { type: 'UPDATE_INVENTORY'; payload: Partial<Inventory> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_AUTH'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

const initialState: AppState = {
  suppliers: [],
  purchases: [],
  grindings: [],
  customers: [],
  sales: [],
  inventory: {
    maizeStockKg: 0,
    flourStockKg: 0,
    lastUpdated: new Date()
  },
  settings: {
    lowStockThreshold: 50,
    defaultFlourPrice: 100,
    businessName: 'FarmFlour Mill',
    ownerName: 'Farm Owner',
    notifications: true
  },
  transports: [],
  deliveries: [],
  isAuthenticated: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'ADD_PURCHASE':
      const newMaizeStock = state.inventory.maizeStockKg + action.payload.amountKg;
      return { 
        ...state, 
        purchases: [...state.purchases, action.payload],
        inventory: { ...state.inventory, maizeStockKg: newMaizeStock, lastUpdated: new Date() }
      };
    case 'ADD_GRINDING':
      const updatedMaizeStock = state.inventory.maizeStockKg - action.payload.maizeAmountKg;
      const updatedFlourStock = state.inventory.flourStockKg + action.payload.flourYieldKg;
      return { 
        ...state, 
        grindings: [...state.grindings, action.payload],
        inventory: { 
          ...state.inventory, 
          maizeStockKg: Math.max(0, updatedMaizeStock),
          flourStockKg: updatedFlourStock,
          lastUpdated: new Date() 
        }
      };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'ADD_SALE':
      const newFlourStock = Math.max(0, state.inventory.flourStockKg - action.payload.quantityKg);
      return { 
        ...state, 
        sales: [...state.sales, action.payload],
        inventory: { ...state.inventory, flourStockKg: newFlourStock, lastUpdated: new Date() }
      };
    case 'UPDATE_INVENTORY':
      return { ...state, inventory: { ...state.inventory, ...action.payload, lastUpdated: new Date() } };
    case 'ADD_TRANSPORT':
      return { ...state, transports: [...state.transports, action.payload] };
    case 'UPDATE_TRANSPORT':
      return { 
        ...state, 
        transports: state.transports.map(transport => 
          transport.id === action.payload.id 
            ? { ...transport, ...action.payload.updates }
            : transport
        )
      };
    case 'ADD_DELIVERY':
      return { ...state, deliveries: [...state.deliveries, action.payload] };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_AUTH':
      return { ...state, isAuthenticated: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('farmflour-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('farmflour-data', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};