import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Phone, MapPin, Calendar, DollarSign, Package, Receipt } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SalesModule: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    contact: '',
    location: ''
  });

  // Sale form state
  const [saleForm, setSaleForm] = useState({
    customerId: '',
    quantityKg: '',
    pricePerKg: state.settings.defaultFlourPrice.toString(),
    paymentMethod: 'cash' as const,
    notes: ''
  });

  const handleAddCustomer = () => {
    if (!customerForm.name || !customerForm.contact) {
      toast({ title: "Error", description: "Name and contact are required", variant: "destructive" });
      return;
    }

    const newCustomer = {
      id: Date.now().toString(),
      name: customerForm.name,
      contact: customerForm.contact,
      location: customerForm.location,
      createdAt: new Date()
    };

    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
    setCustomerForm({ name: '', contact: '', location: '' });
    setShowAddCustomer(false);
    toast({ title: "Success", description: "Customer added successfully" });
  };

  const handleAddSale = () => {
    if (!saleForm.customerId || !saleForm.quantityKg || !saleForm.pricePerKg) {
      toast({ title: "Error", description: "Customer, quantity, and price are required", variant: "destructive" });
      return;
    }

    const customer = state.customers.find(c => c.id === saleForm.customerId);
    if (!customer) {
      toast({ title: "Error", description: "Customer not found", variant: "destructive" });
      return;
    }

    const quantityKg = parseFloat(saleForm.quantityKg);
    const pricePerKg = parseFloat(saleForm.pricePerKg);

    if (quantityKg > state.inventory.flourStockKg) {
      toast({ 
        title: "Error", 
        description: `Only ${state.inventory.flourStockKg}kg flour available in stock`, 
        variant: "destructive" 
      });
      return;
    }

    const totalAmount = quantityKg * pricePerKg;

    const newSale = {
      id: Date.now().toString(),
      customerId: saleForm.customerId,
      customerName: customer.name,
      quantityKg,
      pricePerKg,
      totalAmount,
      saleDate: new Date(),
      paymentMethod: saleForm.paymentMethod,
      notes: saleForm.notes
    };

    dispatch({ type: 'ADD_SALE', payload: newSale });
    setSaleForm({ 
      customerId: '', 
      quantityKg: '', 
      pricePerKg: state.settings.defaultFlourPrice.toString(),
      paymentMethod: 'cash',
      notes: '' 
    });
    setShowAddSale(false);
    setShowReceipt(newSale.id);
    toast({ title: "Success", description: `Sale recorded: ${quantityKg}kg flour for KES ${totalAmount.toFixed(2)}` });
  };

  const generateReceipt = (saleId: string) => {
    const sale = state.sales.find(s => s.id === saleId);
    if (!sale) return null;

    return (
      <Dialog open={showReceipt === saleId} onOpenChange={() => setShowReceipt(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="border-b pb-4">
              <h3 className="font-bold text-lg">{state.settings.businessName}</h3>
              <p className="text-sm text-muted-foreground">Flour Sales Receipt</p>
            </div>
            
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{sale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(sale.saleDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{sale.quantityKg}kg</span>
              </div>
              <div className="flex justify-between">
                <span>Price/kg:</span>
                <span>KES {sale.pricePerKg}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="capitalize">{sale.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>KES {sale.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Receipt ID: #{sale.id.slice(-6)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Flour Sales</h1>
        <div className="space-x-2">
          <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact *</Label>
                  <Input
                    id="contact"
                    value={customerForm.contact}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Phone number or email"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={customerForm.location}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Address or region"
                  />
                </div>
                <Button onClick={handleAddCustomer} className="w-full">
                  Add Customer
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Flour Sale</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Available Stock</p>
                  <p className="text-lg font-bold">{state.inventory.flourStockKg}kg flour</p>
                </div>

                <div>
                  <Label>Customer *</Label>
                  <Select value={saleForm.customerId} onValueChange={(value) => 
                    setSaleForm(prev => ({ ...prev, customerId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity (kg) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={saleForm.quantityKg}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, quantityKg: e.target.value }))}
                    placeholder="0.0"
                    max={state.inventory.flourStockKg}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price per kg (KES) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={saleForm.pricePerKg}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, pricePerKg: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={saleForm.paymentMethod} onValueChange={(value: any) => 
                    setSaleForm(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {saleForm.quantityKg && saleForm.pricePerKg && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold text-primary">
                      KES {(parseFloat(saleForm.quantityKg) * parseFloat(saleForm.pricePerKg)).toFixed(2)}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={saleForm.notes}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes about this sale"
                  />
                </div>

                <Button onClick={handleAddSale} className="w-full">
                  Record Sale
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Customers ({state.customers.length})</h2>
        {state.customers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No customers added yet. Add your first customer to start recording sales.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {state.customers.map(customer => {
              const customerSales = state.sales.filter(s => s.customerId === customer.id);
              const totalPurchases = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
              
              return (
                <Card key={customer.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-primary" />
                          <h3 className="font-medium">{customer.name}</h3>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {customer.contact}
                        </div>
                        {customer.location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            {customer.location}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {customerSales.length} sales
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          KES {totalPurchases.toFixed(2)} total
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Sales History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Sales History ({state.sales.length})</h2>
        {state.sales.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No sales recorded yet. Record your first sale above.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {state.sales
              .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
              .map(sale => (
                <Card key={sale.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-primary" />
                          <h3 className="font-medium">{sale.customerName}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <span className="ml-2 font-medium">{sale.quantityKg}kg</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price/kg:</span>
                            <span className="ml-2 font-medium">KES {sale.pricePerKg}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="capitalize">
                            {sale.paymentMethod.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </div>
                        </div>
                        {sale.notes && (
                          <p className="text-sm text-muted-foreground">{sale.notes}</p>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-lg font-bold">KES {sale.totalAmount.toFixed(2)}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowReceipt(sale.id)}
                        >
                          <Receipt className="h-3 w-3 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Receipt Dialogs */}
      {state.sales.map(sale => generateReceipt(sale.id))}
    </div>
  );
};