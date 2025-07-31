import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Package, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type Transport = {
  id: string;
  reference: string;
  type: 'maize' | 'flour';
  status: 'scheduled' | 'in_transit' | 'delivered';
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  scheduled_date: string;
  estimated_arrival?: string;
  actual_departure?: string;
  created_at: string;
  updated_at: string;
};

type Delivery = {
  id: string;
  transport_id: string;
  received_by: string;
  received_date: string;
  actual_quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'damaged';
  damage_claims?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export const DeliveryModule: React.FC = () => {
  const { toast } = useToast();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<Transport | null>(null);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDelivery, setNewDelivery] = useState({
    received_by: '',
    received_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    actual_quantity: 0,
    condition: 'good' as 'excellent' | 'good' | 'fair' | 'damaged',
    damage_claims: '',
    notes: '',
  });

  const pendingDeliveries = transports.filter(t => t.status === 'in_transit');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [transportsResult, deliveriesResult] = await Promise.all([
        supabase
          .from('transports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('deliveries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (transportsResult.error) throw transportsResult.error;
      if (deliveriesResult.error) throw deliveriesResult.error;

      setTransports((transportsResult.data || []) as Transport[]);
      setDeliveries((deliveriesResult.data || []) as Delivery[]);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load transport and delivery data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!selectedTransport || !newDelivery.received_by) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create delivery record
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .insert([{
          user_id: user.id,
          transport_id: selectedTransport.id,
          received_by: newDelivery.received_by,
          received_date: newDelivery.received_date,
          actual_quantity: newDelivery.actual_quantity,
          condition: newDelivery.condition,
          damage_claims: newDelivery.damage_claims || null,
          notes: newDelivery.notes || null,
        }])
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      // Update transport status
      const { error: updateError } = await supabase
        .from('transports')
        .update({ status: 'delivered' })
        .eq('id', selectedTransport.id);

      if (updateError) throw updateError;

      // Update local state
      setDeliveries(prev => [deliveryData as Delivery, ...prev]);
      setTransports(prev => 
        prev.map(t => t.id === selectedTransport.id ? { ...t, status: 'delivered' as const } : t)
      );

      setIsConfirmDialogOpen(false);
      setSelectedTransport(null);
      setNewDelivery({
        received_by: '',
        received_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        actual_quantity: 0,
        condition: 'good',
        damage_claims: '',
        notes: '',
      });

      toast({
        title: "Delivery confirmed",
        description: "Delivery has been recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error confirming delivery",
        description: "Failed to record delivery",
        variant: "destructive",
      });
    }
  };

  const openConfirmDialog = (transport: Transport) => {
    setSelectedTransport(transport);
    setNewDelivery({
      received_by: '',
      received_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      actual_quantity: transport.quantity,
      condition: 'good',
      damage_claims: '',
      notes: '',
    });
    setIsConfirmDialogOpen(true);
  };

  const getConditionColor = (condition: Delivery['condition']) => {
    switch (condition) {
      case 'excellent': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'good': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'fair': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'damaged': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getConditionIcon = (condition: Delivery['condition']) => {
    switch (condition) {
      case 'excellent': return <Star className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'fair': return <AlertTriangle className="h-4 w-4" />;
      case 'damaged': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const totalDeliveries = deliveries.length;
  const todayDeliveries = deliveries.filter(d => 
    format(new Date(d.received_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;
  const excellentCondition = deliveries.filter(d => d.condition === 'excellent').length;
  const damagedDeliveries = deliveries.filter(d => 
    d.condition === 'damaged' || d.damage_claims
  ).length;

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Delivery Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Confirm and manage deliveries</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayDeliveries}</div>
            <p className="text-xs text-muted-foreground">Received today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Excellent Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{excellentCondition}</div>
            <p className="text-xs text-muted-foreground">Quality deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Damage Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{damagedDeliveries}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pending Delivery Confirmation
          </CardTitle>
          <CardDescription>Shipments arriving for delivery confirmation</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Reference</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[100px]">Route</TableHead>
                  <TableHead className="min-w-[80px]">Quantity</TableHead>
                  <TableHead className="min-w-[120px]">Expected</TableHead>
                  <TableHead className="min-w-[100px]">Driver</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No pending deliveries
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingDeliveries.map((transport) => (
                    <TableRow key={transport.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="text-sm">{transport.reference}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {transport.id.slice(0, 8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transport.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{transport.origin}</div>
                          <div className="text-muted-foreground">→ {transport.destination}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transport.quantity} {transport.unit}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{transport.estimated_arrival ? 
                            format(new Date(transport.estimated_arrival), 'MMM dd HH:mm') :
                            'Not set'
                          }</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{transport.driver_name || 'N/A'}</div>
                          <div className="text-muted-foreground">{transport.driver_phone || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => openConfirmDialog(transport)}
                          className="h-7 text-xs"
                        >
                          Confirm Delivery
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Delivery History
          </CardTitle>
          <CardDescription>Completed delivery confirmations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Received By</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No delivery records
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries
                    .sort((a, b) => new Date(b.received_date).getTime() - new Date(a.received_date).getTime())
                    .slice(0, 10)
                    .map((delivery) => {
                      const transport = transports.find(t => t.id === delivery.transport_id);
                      return (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="text-sm">{transport?.reference || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {transport?.id.slice(0, 8) || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transport?.type || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>{delivery.received_by}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>{delivery.actual_quantity} {transport?.unit || 'units'}</div>
                              {delivery.actual_quantity !== transport?.quantity && transport?.quantity && (
                                <div className="text-muted-foreground">
                                  Expected: {transport.quantity} {transport.unit}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getConditionColor(delivery.condition)}>
                              <div className="flex items-center gap-1">
                                {getConditionIcon(delivery.condition)}
                                {delivery.condition}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>{format(new Date(delivery.received_date), 'MMM dd, yyyy')}</div>
                              <div className="text-muted-foreground">
                                {format(new Date(delivery.received_date), 'HH:mm')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs max-w-[200px] truncate">
                              {delivery.damage_claims && (
                                <div className="text-red-600 font-medium">
                                  Damage: {delivery.damage_claims}
                                </div>
                              )}
                              {delivery.notes && (
                                <div className="text-muted-foreground">
                                  {delivery.notes}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
            <DialogDescription>
              Record delivery details for {selectedTransport?.reference}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="received-by">Received By</Label>
                <Input
                  value={newDelivery.received_by}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, received_by: e.target.value }))}
                  placeholder="Person who received"
                />
              </div>
              <div>
                <Label htmlFor="received-date">Received Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={newDelivery.received_date}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, received_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected-quantity">Expected Quantity</Label>
                <Input
                  type="number"
                  value={selectedTransport?.quantity || 0}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="actual-quantity">Actual Quantity</Label>
                <Input
                  type="number"
                  value={newDelivery.actual_quantity}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, actual_quantity: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select 
                value={newDelivery.condition} 
                onValueChange={(value) => setNewDelivery(prev => ({ ...prev, condition: value as 'excellent' | 'good' | 'fair' | 'damaged' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="damage-claims">Damage Claims (if any)</Label>
              <Textarea
                value={newDelivery.damage_claims}
                onChange={(e) => setNewDelivery(prev => ({ ...prev, damage_claims: e.target.value }))}
                placeholder="Describe any damage or issues..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                value={newDelivery.notes}
                onChange={(e) => setNewDelivery(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about the delivery..."
                rows={3}
              />
            </div>
            <Button onClick={handleConfirmDelivery} className="w-full">
              Confirm Delivery
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};