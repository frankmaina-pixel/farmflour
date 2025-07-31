import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { state } = useApp();
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Calculate date ranges
  const now = new Date();
  let startDate: Date;
  
  switch (timePeriod) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      startDate = weekStart;
      break;
    case 'monthly':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  // Filter data by time period
  const periodPurchases = state.purchases.filter(p => 
    new Date(p.purchaseDate) >= startDate
  );
  const periodGrindings = state.grindings.filter(g => 
    new Date(g.grindingDate) >= startDate
  );
  const periodSales = state.sales.filter(s => 
    new Date(s.saleDate) >= startDate
  );

  // Calculate financial metrics
  const totalPurchaseCost = periodPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalGrindingCost = periodGrindings.reduce((sum, g) => sum + g.grindingCost, 0);
  const totalRevenue = periodSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = totalPurchaseCost + totalGrindingCost;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Calculate operational metrics
  const totalMaizePurchased = periodPurchases.reduce((sum, p) => sum + p.amountKg, 0);
  const totalMaizeProcessed = periodGrindings.reduce((sum, g) => sum + g.maizeAmountKg, 0);
  const totalFlourProduced = periodGrindings.reduce((sum, g) => sum + g.flourYieldKg, 0);
  const totalFlourSold = periodSales.reduce((sum, s) => sum + s.quantityKg, 0);
  const averageYield = totalMaizeProcessed > 0 ? (totalFlourProduced / totalMaizeProcessed) * 100 : 0;

  // Top customers
  const customerSales = state.customers.map(customer => {
    const customerPeriodSales = periodSales.filter(s => s.customerId === customer.id);
    const totalAmount = customerPeriodSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalQuantity = customerPeriodSales.reduce((sum, s) => sum + s.quantityKg, 0);
    return {
      ...customer,
      totalAmount,
      totalQuantity,
      salesCount: customerPeriodSales.length
    };
  }).filter(c => c.totalAmount > 0).sort((a, b) => b.totalAmount - a.totalAmount);

  // Top suppliers
  const supplierPurchases = state.suppliers.map(supplier => {
    const supplierPeriodPurchases = periodPurchases.filter(p => p.supplierId === supplier.id);
    const totalCost = supplierPeriodPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalQuantity = supplierPeriodPurchases.reduce((sum, p) => sum + p.amountKg, 0);
    return {
      ...supplier,
      totalCost,
      totalQuantity,
      purchaseCount: supplierPeriodPurchases.length
    };
  }).filter(s => s.totalCost > 0).sort((a, b) => b.totalCost - a.totalCost);

  // Export functionality
  const exportToCSV = () => {
    const reportData = {
      period: timePeriod,
      dateRange: `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`,
      financialSummary: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit,
        profitMargin
      },
      operationalSummary: {
        maizePurchased: totalMaizePurchased,
        maizeProcessed: totalMaizeProcessed,
        flourProduced: totalFlourProduced,
        flourSold: totalFlourSold,
        averageYield
      },
      activityCounts: {
        purchases: periodPurchases.length,
        grindings: periodGrindings.length,
        sales: periodSales.length
      }
    };

    // Create CSV content
    let csvContent = "FarmFlour Financial Report\n";
    csvContent += `Period: ${reportData.period}\n`;
    csvContent += `Date Range: ${reportData.dateRange}\n\n`;
    
    csvContent += "FINANCIAL SUMMARY\n";
    csvContent += "Metric,Amount\n";
    csvContent += `Revenue,KES ${reportData.financialSummary.revenue.toFixed(2)}\n`;
    csvContent += `Total Expenses,KES ${reportData.financialSummary.expenses.toFixed(2)}\n`;
    csvContent += `Net Profit,KES ${reportData.financialSummary.netProfit.toFixed(2)}\n`;
    csvContent += `Profit Margin,${reportData.financialSummary.profitMargin.toFixed(1)}%\n\n`;
    
    csvContent += "OPERATIONAL SUMMARY\n";
    csvContent += "Metric,Amount\n";
    csvContent += `Maize Purchased,${reportData.operationalSummary.maizePurchased}kg\n`;
    csvContent += `Maize Processed,${reportData.operationalSummary.maizeProcessed}kg\n`;
    csvContent += `Flour Produced,${reportData.operationalSummary.flourProduced}kg\n`;
    csvContent += `Flour Sold,${reportData.operationalSummary.flourSold}kg\n`;
    csvContent += `Average Yield,${reportData.operationalSummary.averageYield.toFixed(1)}%\n\n`;
    
    if (customerSales.length > 0) {
      csvContent += "TOP CUSTOMERS\n";
      csvContent += "Rank,Customer Name,Total Sales,Total Amount,Sales Count\n";
      customerSales.slice(0, 5).forEach((customer, index) => {
        csvContent += `${index + 1},${customer.name},${customer.totalQuantity}kg,KES ${customer.totalAmount.toFixed(2)},${customer.salesCount}\n`;
      });
      csvContent += "\n";
    }
    
    if (supplierPurchases.length > 0) {
      csvContent += "TOP SUPPLIERS\n";
      csvContent += "Rank,Supplier Name,Total Purchases,Total Cost,Purchase Count\n";
      supplierPurchases.slice(0, 5).forEach((supplier, index) => {
        csvContent += `${index + 1},${supplier.name},${supplier.totalQuantity}kg,KES ${supplier.totalCost.toFixed(2)},${supplier.purchaseCount}\n`;
      });
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `farmflour-report-${timePeriod}-${now.toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="flex items-center space-x-4">
          <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-lg font-bold">KES {totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              KES {netProfit.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-accent" />
            <p className="text-sm text-muted-foreground">Profit Margin</p>
            <p className={`text-lg font-bold ${profitMargin >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-primary-glow" />
            <p className="text-sm text-muted-foreground">Avg Yield</p>
            <p className="text-lg font-bold">{averageYield.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Maize Purchases</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-primary rounded-full"></div>
                <span className="font-medium">KES {totalPurchaseCost.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Grinding Costs</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-2 bg-secondary rounded-full"></div>
                <span className="font-medium">KES {totalGrindingCost.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between items-center font-bold">
              <span>Total Expenses</span>
              <span>KES {totalExpenses.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Maize Purchased</p>
              <p className="text-xl font-bold">{totalMaizePurchased}kg</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Maize Processed</p>
              <p className="text-xl font-bold">{totalMaizeProcessed}kg</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Flour Produced</p>
              <p className="text-xl font-bold">{totalFlourProduced}kg</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Flour Sold</p>
              <p className="text-xl font-bold">{totalFlourSold}kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      {customerSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top Customers ({timePeriod})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customerSales.slice(0, 5).map((customer, index) => (
                <div key={customer.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.salesCount} sales • {customer.totalQuantity}kg
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">KES {customer.totalAmount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Suppliers */}
      {supplierPurchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers ({timePeriod})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supplierPurchases.slice(0, 5).map((supplier, index) => (
                <div key={supplier.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.purchaseCount} purchases • {supplier.totalQuantity}kg
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">KES {supplier.totalCost.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Purchases</p>
              <p className="text-2xl font-bold text-primary">{periodPurchases.length}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Grinding Sessions</p>
              <p className="text-2xl font-bold text-secondary">{periodGrindings.length}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Sales</p>
              <p className="text-2xl font-bold text-accent">{periodSales.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};