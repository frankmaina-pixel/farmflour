export interface Supplier {
  id: string;
  name: string;
  contact: string;
  location: string;
  createdAt: Date;
}

export interface MaizePurchase {
  id: string;
  supplierId: string;
  supplierName: string;
  amountKg: number;
  pricePerKg: number;
  totalCost: number;
  purchaseDate: Date;
  notes?: string;
}

export interface GrindingRecord {
  id: string;
  purchaseId: string;
  maizeAmountKg: number;
  flourYieldKg: number;
  yieldPercentage: number;
  grindingDate: Date;
  grindingCost: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  location?: string;
  createdAt: Date;
}

export interface FlourSale {
  id: string;
  customerId: string;
  customerName: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  saleDate: Date;
  paymentMethod: 'cash' | 'mobile_money' | 'credit';
  notes?: string;
}

export interface Inventory {
  maizeStockKg: number;
  flourStockKg: number;
  lastUpdated: Date;
}

export interface FinancialSummary {
  totalPurchaseCost: number;
  totalGrindingCost: number;
  totalSalesRevenue: number;
  totalProfit: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
}

export interface Transport {
  id: string;
  type: 'maize_purchase' | 'flour_delivery';
  referenceId: string; // purchaseId or saleId
  referenceName: string; // supplier/customer name
  itemType: 'maize' | 'flour';
  quantity: number;
  origin: string;
  destination: string;
  transportProvider: string;
  transportCost: number;
  status: 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  departureDate?: Date;
  estimatedArrival: Date;
  actualArrival?: Date;
  trackingNumber?: string;
  driverName?: string;
  driverContact?: string;
  vehicleNumber?: string;
  createdAt: Date;
  notes?: string;
}

export interface Delivery {
  id: string;
  transportId: string;
  receivedBy: string;
  receivedDate: Date;
  actualQuantity: number;
  expectedQuantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  damageClaims?: string;
  photos?: string[];
  signature?: string;
  notes?: string;
}

export interface AppSettings {
  lowStockThreshold: number;
  defaultFlourPrice: number;
  businessName: string;
  ownerName: string;
  notifications: boolean;
}