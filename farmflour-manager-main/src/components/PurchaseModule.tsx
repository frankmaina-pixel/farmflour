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
import { Plus, User, Phone, MapPin, Calendar, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const PurchaseModule: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddPurchase, setShowAddPurchase] = useState(false);

  // Supplier form state
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact: '',
    location: ''
  });

  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    amountKg: '',
    pricePerKg: '',
    notes: ''
  });

  const handleAddSupplier = () => {
    if (!supplierForm.name || !supplierForm.contact) {
      toast({ title: "Error", description: "Name and contact are required", variant: "destructive" });
      return;
    }

    const newSupplier = {
      id: Date.now().toString(),
      name: supplierForm.name,
      contact: supplierForm.contact,
      location: supplierForm.location,
      createdAt: new Date()
    };

    dispatch({ type: 'ADD_SUPPLIER', payload: newSupplier });
    setSupplierForm({ name: '', contact: '', location: '' });
    setShowAddSupplier(false);
    toast({ title: "Success", description: "Supplier added successfully" });
  };

  const handleAddPurchase = () => {
    if (!purchaseForm.supplierId || !purchaseForm.amountKg || !purchaseForm.pricePerKg) {
      toast({ title: "Error", description: "All fields except notes are required", variant: "destructive" });
      return;
    }

    const supplier = state.suppliers.find(s => s.id === purchaseForm.supplierId);
    if (!supplier) {
      toast({ title: "Error", description: "Supplier not found", variant: "destructive" });
      return;
    }

    const amountKg = parseFloat(purchaseForm.amountKg);
    const pricePerKg = parseFloat(purchaseForm.pricePerKg);
    const totalCost = amountKg * pricePerKg;

    const newPurchase = {
      id: Date.now().toString(),
      supplierId: purchaseForm.supplierId,
      supplierName: supplier.name,
      amountKg,
      pricePerKg,
      totalCost,
      purchaseDate: new Date(),
      notes: purchaseForm.notes
    };

    dispatch({ type: 'ADD_PURCHASE', payload: newPurchase });
    setPurchaseForm({ supplierId: '', amountKg: '', pricePerKg: '', notes: '' });
    setShowAddPurchase(false);
    toast({ title: "Success", description: `Purchase recorded: ${amountKg}kg maize for KES ${totalCost.toFixed(2)}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Maize Purchases</h1>
        <div className="space-x-2">
          <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input
                    id="name"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact *</Label>
                  <Input
                    id="contact"
                    value={supplierForm.contact}
                    onChange={(e) => setSupplierForm(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Phone number or email"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={supplierForm.location}
                    onChange={(e) => setSupplierForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Address or region"
                  />
                </div>
                <Button onClick={handleAddSupplier} className="w-full">
                  Add Supplier
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddPurchase} onOpenChange={setShowAddPurchase}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Purchase
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Maize Purchase</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Supplier *</Label>
                  <Select value={purchaseForm.supplierId} onValueChange={(value) => 
                    setPurchaseForm(prev => ({ ...prev, supplierId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (kg) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={purchaseForm.amountKg}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, amountKg: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price per kg (KES) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={purchaseForm.pricePerKg}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, pricePerKg: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                {purchaseForm.amountKg && purchaseForm.pricePerKg && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-lg font-bold">
                      KES {(parseFloat(purchaseForm.amountKg) * parseFloat(purchaseForm.pricePerKg)).toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={purchaseForm.notes}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes about this purchase"
                  />
                </div>
                <Button onClick={handleAddPurchase} className="w-full">
                  Record Purchase
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Suppliers ({state.suppliers.length})</h2>
        {state.suppliers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No suppliers added yet. Add your first supplier to start recording purchases.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {state.suppliers.map(supplier => (
              <Card key={supplier.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        <h3 className="font-medium">{supplier.name}</h3>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        {supplier.contact}
                      </div>
                      {supplier.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {supplier.location}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">
                      {state.purchases.filter(p => p.supplierId === supplier.id).length} purchases
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Purchases */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Purchase History ({state.purchases.length})</h2>
        {state.purchases.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No purchases recorded yet. Record your first purchase above.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {state.purchases
              .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
              .map(purchase => (
                <Card key={purchase.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-primary" />
                          <h3 className="font-medium">{purchase.supplierName}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-2 font-medium">{purchase.amountKg}kg</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price/kg:</span>
                            <span className="ml-2 font-medium">KES {purchase.pricePerKg}</span>
                          </div>
                        </div>
                        {purchase.notes && (
                          <p className="text-sm text-muted-foreground">{purchase.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">KES {purchase.totalCost.toFixed(2)}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};