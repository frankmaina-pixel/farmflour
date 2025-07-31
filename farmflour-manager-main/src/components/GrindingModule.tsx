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
import { Plus, Package, Calendar, Percent, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const GrindingModule: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddGrinding, setShowAddGrinding] = useState(false);

  // Grinding form state
  const [grindingForm, setGrindingForm] = useState({
    purchaseId: '',
    maizeAmountKg: '',
    flourYieldKg: '',
    grindingCost: '',
    notes: ''
  });

  // Get available maize purchases that haven't been fully processed
  const availablePurchases = state.purchases.filter(purchase => {
    const totalGroundFromPurchase = state.grindings
      .filter(g => g.purchaseId === purchase.id)
      .reduce((sum, g) => sum + g.maizeAmountKg, 0);
    return totalGroundFromPurchase < purchase.amountKg;
  });

  const selectedPurchase = state.purchases.find(p => p.id === grindingForm.purchaseId);
  const totalGroundFromSelected = selectedPurchase ? 
    state.grindings
      .filter(g => g.purchaseId === selectedPurchase.id)
      .reduce((sum, g) => sum + g.maizeAmountKg, 0) : 0;
  const availableFromSelected = selectedPurchase ? selectedPurchase.amountKg - totalGroundFromSelected : 0;

  const calculateYieldPercentage = () => {
    const maize = parseFloat(grindingForm.maizeAmountKg) || 0;
    const flour = parseFloat(grindingForm.flourYieldKg) || 0;
    return maize > 0 ? (flour / maize) * 100 : 0;
  };

  const handleAddGrinding = () => {
    if (!grindingForm.purchaseId || !grindingForm.maizeAmountKg || !grindingForm.flourYieldKg) {
      toast({ title: "Error", description: "Purchase, maize amount, and flour yield are required", variant: "destructive" });
      return;
    }

    const maizeAmount = parseFloat(grindingForm.maizeAmountKg);
    const flourYield = parseFloat(grindingForm.flourYieldKg);
    const grindingCost = parseFloat(grindingForm.grindingCost) || 0;

    if (maizeAmount > availableFromSelected) {
      toast({ 
        title: "Error", 
        description: `Only ${availableFromSelected}kg available from this purchase`, 
        variant: "destructive" 
      });
      return;
    }

    if (maizeAmount > state.inventory.maizeStockKg) {
      toast({ 
        title: "Error", 
        description: "Not enough maize in stock", 
        variant: "destructive" 
      });
      return;
    }

    const yieldPercentage = (flourYield / maizeAmount) * 100;

    const newGrinding = {
      id: Date.now().toString(),
      purchaseId: grindingForm.purchaseId,
      maizeAmountKg: maizeAmount,
      flourYieldKg: flourYield,
      yieldPercentage,
      grindingDate: new Date(),
      grindingCost,
      notes: grindingForm.notes
    };

    dispatch({ type: 'ADD_GRINDING', payload: newGrinding });
    setGrindingForm({ purchaseId: '', maizeAmountKg: '', flourYieldKg: '', grindingCost: '', notes: '' });
    setShowAddGrinding(false);
    toast({ 
      title: "Success", 
      description: `Processed ${maizeAmount}kg maize → ${flourYield}kg flour (${yieldPercentage.toFixed(1)}% yield)` 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Grinding Operations</h1>
        <Dialog open={showAddGrinding} onOpenChange={setShowAddGrinding}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Process Grinding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Process Maize to Flour</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Maize Purchase *</Label>
                <Select value={grindingForm.purchaseId} onValueChange={(value) => 
                  setGrindingForm(prev => ({ ...prev, purchaseId: value, maizeAmountKg: '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maize batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePurchases.map(purchase => {
                      const remaining = purchase.amountKg - state.grindings
                        .filter(g => g.purchaseId === purchase.id)
                        .reduce((sum, g) => sum + g.maizeAmountKg, 0);
                      return (
                        <SelectItem key={purchase.id} value={purchase.id}>
                          {purchase.supplierName} - {remaining}kg available
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedPurchase && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {availableFromSelected}kg from {selectedPurchase.supplierName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="maizeAmount">Maize Amount (kg) *</Label>
                <Input
                  id="maizeAmount"
                  type="number"
                  value={grindingForm.maizeAmountKg}
                  onChange={(e) => setGrindingForm(prev => ({ ...prev, maizeAmountKg: e.target.value }))}
                  placeholder="0"
                  max={availableFromSelected}
                />
              </div>

              <div>
                <Label htmlFor="flourYield">Flour Yield (kg) *</Label>
                <Input
                  id="flourYield"
                  type="number"
                  step="0.1"
                  value={grindingForm.flourYieldKg}
                  onChange={(e) => setGrindingForm(prev => ({ ...prev, flourYieldKg: e.target.value }))}
                  placeholder="0.0"
                />
              </div>

              {grindingForm.maizeAmountKg && grindingForm.flourYieldKg && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Yield Percentage</p>
                  <p className="text-lg font-bold text-primary">
                    {calculateYieldPercentage().toFixed(1)}%
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="grindingCost">Grinding Cost (KES)</Label>
                <Input
                  id="grindingCost"
                  type="number"
                  step="0.01"
                  value={grindingForm.grindingCost}
                  onChange={(e) => setGrindingForm(prev => ({ ...prev, grindingCost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={grindingForm.notes}
                  onChange={(e) => setGrindingForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes about this grinding session"
                />
              </div>

              <Button 
                onClick={handleAddGrinding} 
                className="w-full"
                disabled={!grindingForm.purchaseId || !grindingForm.maizeAmountKg || !grindingForm.flourYieldKg}
              >
                Process Grinding
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Inventory Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-accent" />
            <p className="text-sm text-muted-foreground">Maize Stock</p>
            <p className="text-2xl font-bold">{state.inventory.maizeStockKg}kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Flour Stock</p>
            <p className="text-2xl font-bold">{state.inventory.flourStockKg}kg</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Maize Batches */}
      {availablePurchases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Available Maize Batches</h2>
          <div className="space-y-3">
            {availablePurchases.map(purchase => {
              const totalGroundFromPurchase = state.grindings
                .filter(g => g.purchaseId === purchase.id)
                .reduce((sum, g) => sum + g.maizeAmountKg, 0);
              const remaining = purchase.amountKg - totalGroundFromPurchase;
              
              return (
                <Card key={purchase.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-medium">{purchase.supplierName}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Original:</span>
                            <span className="ml-2 font-medium">{purchase.amountKg}kg</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Processed:</span>
                            <span className="ml-2 font-medium">{totalGroundFromPurchase}kg</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{remaining}kg</p>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Grinding History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Grinding History ({state.grindings.length})</h2>
        {state.grindings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No grinding operations recorded yet. Process your first batch above.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {state.grindings
              .sort((a, b) => new Date(b.grindingDate).getTime() - new Date(a.grindingDate).getTime())
              .map(grinding => {
                const purchase = state.purchases.find(p => p.id === grinding.purchaseId);
                return (
                  <Card key={grinding.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-medium">
                            {purchase?.supplierName || 'Unknown Supplier'}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Maize:</span>
                              <span className="ml-2 font-medium">{grinding.maizeAmountKg}kg</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Flour:</span>
                              <span className="ml-2 font-medium">{grinding.flourYieldKg}kg</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Percent className="h-4 w-4 mr-1 text-primary" />
                              <span className="text-sm font-medium">
                                {grinding.yieldPercentage.toFixed(1)}% yield
                              </span>
                            </div>
                            {grinding.grindingCost > 0 && (
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">KES {grinding.grindingCost}</span>
                              </div>
                            )}
                          </div>
                          {grinding.notes && (
                            <p className="text-sm text-muted-foreground">{grinding.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {new Date(grinding.grindingDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};