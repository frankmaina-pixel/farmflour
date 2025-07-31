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
import { Truck, MapPin, Clock, Phone, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
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

export const TransportModule: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTransport, setNewTransport] = useState({
    reference: '',
    type: 'maize' as 'maize' | 'flour',
    quantity: 0,
    unit: 'kg',
    origin: '',
    destination: '',
    driver_name: '',
    driver_phone: '',
    vehicle_number: '',
    scheduled_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    estimated_arrival: '',
  });

  useEffect(() => {
    loadTransports();
  }, []);

  const loadTransports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransports((data || []) as Transport[]);
    } catch (error) {
      toast({
        title: "Error loading transports",
        description: "Failed to load transport data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransport = async () => {
    if (!newTransport.reference || !newTransport.origin || !newTransport.destination) {
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

      const { data, error } = await supabase
        .from('transports')
        .insert([{
          user_id: user.id,
          reference: newTransport.reference,
          type: newTransport.type,
          quantity: newTransport.quantity,
          unit: newTransport.unit,
          origin: newTransport.origin,
          destination: newTransport.destination,
          driver_name: newTransport.driver_name,
          driver_phone: newTransport.driver_phone,
          vehicle_number: newTransport.vehicle_number,
          scheduled_date: newTransport.scheduled_date,
          estimated_arrival: newTransport.estimated_arrival || null,
        }])
        .select()
        .single();

      if (error) throw error;

      setTransports(prev => [data as Transport, ...prev]);
      setIsAddDialogOpen(false);
      setNewTransport({
        reference: '',
        type: 'maize',
        quantity: 0,
        unit: 'kg',
        origin: '',
        destination: '',
        driver_name: '',
        driver_phone: '',
        vehicle_number: '',
        scheduled_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        estimated_arrival: '',
      });

      toast({
        title: "Transport created",
        description: "New transport record has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error creating transport",
        description: "Failed to create transport record",
        variant: "destructive",
      });
    }
  };

  const updateTransportStatus = async (transportId: string, status: Transport['status']) => {
    try {
      const updates: any = { status };
      if (status === 'in_transit') {
        updates.actual_departure = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('transports')
        .update(updates)
        .eq('id', transportId)
        .select()
        .single();

      if (error) throw error;

      setTransports(prev => 
        prev.map(t => t.id === transportId ? data as Transport : t)
      );

      toast({
        title: "Status updated",
        description: `Transport status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Failed to update transport status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Transport['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'in_transit': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-green-500/10 text-green-700 border-green-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: Transport['type']) => {
    return type === 'maize' 
      ? 'bg-orange-500/10 text-orange-700 border-orange-200'
      : 'bg-purple-500/10 text-purple-700 border-purple-200';
  };

  const activeTransports = transports.filter(t => t.status !== 'delivered');
  const recentDeliveries = transports.filter(t => t.status === 'delivered').slice(0, 5);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Transport & Delivery</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track maize and flour shipments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full xs:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Transport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Transport</DialogTitle>
              <DialogDescription>Set up tracking for a new shipment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transport-type">Transport Type</Label>
                  <Select 
                    value={newTransport.type} 
                    onValueChange={(value) => setNewTransport(prev => ({ 
                      ...prev, 
                      type: value as 'maize' | 'flour'
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maize">Maize</SelectItem>
                      <SelectItem value="flour">Flour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    value={newTransport.reference}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Transport reference"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    value={newTransport.quantity}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    value={newTransport.unit}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="kg, tons, bags"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    value={newTransport.origin}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, origin: e.target.value }))}
                    placeholder="Pickup location"
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    value={newTransport.destination}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Delivery location"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver-name">Driver Name</Label>
                  <Input
                    value={newTransport.driver_name}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, driver_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="driver-phone">Driver Phone</Label>
                  <Input
                    value={newTransport.driver_phone}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, driver_phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle-number">Vehicle Number</Label>
                  <Input
                    value={newTransport.vehicle_number}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, vehicle_number: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled-date">Scheduled Date</Label>
                  <Input
                    type="datetime-local"
                    value={newTransport.scheduled_date}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="estimated-arrival">Estimated Arrival (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={newTransport.estimated_arrival}
                  onChange={(e) => setNewTransport(prev => ({ ...prev, estimated_arrival: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddTransport} className="w-full">Create Transport</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Transports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTransports.length}</div>
            <p className="text-xs text-muted-foreground">Currently tracking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transports.filter(t => t.status === 'in_transit').length}
            </div>
            <p className="text-xs text-muted-foreground">On the road</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transports.filter(t => 
                t.status === 'delivered' && 
                format(new Date(t.updated_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transports.filter(t => t.status === 'delivered').length}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Transports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Active Transports
          </CardTitle>
          <CardDescription>Monitor ongoing shipments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Reference</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Route</TableHead>
                  <TableHead className="min-w-[80px]">Quantity</TableHead>
                  <TableHead className="min-w-[120px]">ETA</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTransports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No active transports
                    </TableCell>
                  </TableRow>
                ) : (
                  activeTransports.map((transport) => (
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
                        <Badge variant="outline" className={getTypeColor(transport.type)}>
                          {transport.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(transport.status)}>
                          {transport.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {transport.origin}
                          </div>
                          <div className="text-muted-foreground">→ {transport.destination}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transport.quantity} {transport.unit}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {transport.estimated_arrival ? 
                              format(new Date(transport.estimated_arrival), 'MMM dd HH:mm') :
                              'Not set'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {transport.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTransportStatus(transport.id, 'in_transit')}
                              className="h-7 text-xs"
                            >
                              Start Transit
                            </Button>
                          )}
                          {transport.status === 'in_transit' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTransportStatus(transport.id, 'delivered')}
                              className="h-7 text-xs"
                            >
                              Mark Delivered
                            </Button>
                          )}
                          {transport.driver_phone && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`tel:${transport.driver_phone}`)}
                              className="h-7 text-xs"
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Deliveries
          </CardTitle>
          <CardDescription>Latest completed shipments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No recent deliveries
                    </TableCell>
                  </TableRow>
                ) : (
                  recentDeliveries.map((transport) => (
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
                        <Badge variant="outline" className={getTypeColor(transport.type)}>
                          {transport.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{transport.origin} → {transport.destination}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transport.quantity} {transport.unit}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{format(new Date(transport.updated_at), 'MMM dd, yyyy')}</div>
                          <div className="text-muted-foreground">
                            {format(new Date(transport.updated_at), 'HH:mm')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {transport.actual_departure && (
                            <>
                              {Math.round(
                                (new Date(transport.updated_at).getTime() - new Date(transport.actual_departure).getTime()) / 
                                (1000 * 60 * 60)
                              )} hours
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};