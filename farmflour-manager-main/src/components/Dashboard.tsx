import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Package, TrendingUp, Wheat, Users } from 'lucide-react';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { state } = useApp();

  // Calculate financial summary for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyPurchases = state.purchases.filter(p => 
    new Date(p.purchaseDate) >= startOfMonth
  );
  const monthlyGrindings = state.grindings.filter(g => 
    new Date(g.grindingDate) >= startOfMonth
  );
  const monthlySales = state.sales.filter(s => 
    new Date(s.saleDate) >= startOfMonth
  );

  const totalPurchaseCost = monthlyPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalGrindingCost = monthlyGrindings.reduce((sum, g) => sum + g.grindingCost, 0);
  const totalRevenue = monthlySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const monthlyProfit = totalRevenue - totalPurchaseCost - totalGrindingCost;

  // Check for low stock alerts
  const lowMaizeStock = state.inventory.maizeStockKg < state.settings.lowStockThreshold;
  const lowFlourStock = state.inventory.flourStockKg < state.settings.lowStockThreshold;

  return (
    <div className="space-y-6">
      {/* Header - Responsive typography */}
      <div className="text-center px-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2">
          {state.settings.businessName}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">Welcome back, {state.settings.ownerName}</p>
      </div>

      {/* Alerts */}
      {(lowMaizeStock || lowFlourStock) && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
            <CardTitle className="text-destructive">Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowMaizeStock && (
              <p className="text-sm">⚠️ Maize stock is low: {state.inventory.maizeStockKg}kg remaining</p>
            )}
            {lowFlourStock && (
              <p className="text-sm">⚠️ Flour stock is low: {state.inventory.flourStockKg}kg remaining</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics - Ultra responsive grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 mx-auto mb-2 text-primary" />
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Monthly Profit</p>
            <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-foreground break-words">
              KES {monthlyProfit.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 mx-auto mb-2 text-secondary" />
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Revenue</p>
            <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-foreground break-words">
              KES {totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
            <Wheat className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 mx-auto mb-2 text-accent" />
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Maize Stock</p>
            <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-foreground">
              {state.inventory.maizeStockKg}kg
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 mx-auto mb-2 text-primary-glow" />
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Flour Stock</p>
            <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-foreground">
              {state.inventory.flourStockKg}kg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Responsive grid for all screen sizes */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
          <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
                onClick={() => onNavigate('purchases')}>
            <CardContent className="p-4 sm:p-6 lg:p-8 xl:p-10 text-center">
              <Wheat className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-16 xl:w-16 mx-auto mb-3 sm:mb-4 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg xl:text-xl mb-1 sm:mb-2">Record Maize Purchase</h3>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Add new maize inventory</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
                onClick={() => onNavigate('grinding')}>
            <CardContent className="p-4 sm:p-6 lg:p-8 xl:p-10 text-center">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-16 xl:w-16 mx-auto mb-3 sm:mb-4 text-secondary" />
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg xl:text-xl mb-1 sm:mb-2">Process Grinding</h3>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Convert maize to flour</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
                onClick={() => onNavigate('sales')}>
            <CardContent className="p-4 sm:p-6 lg:p-8 xl:p-10 text-center">
              <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-16 xl:w-16 mx-auto mb-3 sm:mb-4 text-accent" />
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg xl:text-xl mb-1 sm:mb-2">Record Sale</h3>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Sell flour to customers</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
                onClick={() => onNavigate('reports')}>
            <CardContent className="p-4 sm:p-6 lg:p-8 xl:p-10 text-center">
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-16 xl:w-16 mx-auto mb-3 sm:mb-4 text-primary-glow" />
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg xl:text-xl mb-1 sm:mb-2">View Reports</h3>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Financial analysis</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <div className="space-y-2">
          {/* Recent Sales */}
          {monthlySales.slice(-3).reverse().map((sale) => (
            <Card key={sale.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{sale.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    Sold {sale.quantityKg}kg flour for KES {sale.totalAmount}
                  </p>
                </div>
                <Badge variant="secondary">
                  {new Date(sale.saleDate).toLocaleDateString()}
                </Badge>
              </CardContent>
            </Card>
          ))}
          
          {monthlySales.length === 0 && (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                No recent sales this month
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};