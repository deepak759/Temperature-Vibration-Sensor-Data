import { useState, useEffect } from 'react';
import { plantAPI, godadminAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Building2, Users, BarChart3, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ViewerDashboard from './ViewerDashboard';

export default function GodadminDashboard() {
  const [plants, setPlants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);

  // Plant form state
  const [plantForm, setPlantForm] = useState({ name: '', description: '', location: '' });
  const [isPlantDialogOpen, setIsPlantDialogOpen] = useState(false);

  // Admin assignment form state
  const [adminForm, setAdminForm] = useState({ username: '', email: '', password: '', userId: '' });
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<'new' | 'existing'>('new');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plantsRes, usersRes] = await Promise.all([
        plantAPI.getAll(),
        godadminAPI.getAllUsers(),
      ]);
      setPlants(plantsRes.plants);
      setUsers(usersRes.users);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlant = async () => {
    try {
      await plantAPI.create(plantForm);
      toast.success('Plant created successfully');
      setIsPlantDialogOpen(false);
      setPlantForm({ name: '', description: '', location: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create plant');
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedPlant) {
      toast.error('Please select a plant');
      return;
    }

    try {
      const data = assignMode === 'new'
        ? { username: adminForm.username, email: adminForm.email, password: adminForm.password }
        : { userId: adminForm.userId };

      const response = await godadminAPI.addAdminUser(selectedPlant, data);
      
      if (assignMode === 'new') {
        toast.success('Admin user created successfully! Credentials have been sent to their email.');
      } else {
        toast.success('Admin assigned successfully');
      }
      
      setIsAdminDialogOpen(false);
      setAdminForm({ username: '', email: '', password: '', userId: '' });
      setSelectedPlant(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign admin');
    }
  };

  const handleDeletePlant = async (plantId: string) => {
    if (!confirm('Are you sure you want to delete this plant?')) return;
    try {
      await plantAPI.delete(plantId);
      toast.success('Plant deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete plant');
    }
  };

  const handleRemoveAdmin = async (plantId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove admin access?')) return;
    try {
      await godadminAPI.removeAdminAccess(plantId, userId);
      toast.success('Admin access removed successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove admin access');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="management" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="management">
            <Settings className="w-4 h-4 mr-2" />
            System Management
          </TabsTrigger>
          <TabsTrigger value="graphs">
            <BarChart3 className="w-4 h-4 mr-2" />
            Vibration Graphs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="graphs" className="mt-0">
          <ViewerDashboard />
        </TabsContent>

        <TabsContent value="management" className="space-y-6 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Godadmin Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage all plants and users</p>
            </div>
          </div>

          <Tabs defaultValue="plants" className="w-full">
            <TabsList>
          <TabsTrigger value="plants">
            <Building2 className="w-4 h-4 mr-2" />
            Plants ({plants.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plants" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPlantDialogOpen} onOpenChange={setIsPlantDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Plant</DialogTitle>
                  <DialogDescription>Add a new plant to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Plant Name *</Label>
                    <Input
                      value={plantForm.name}
                      onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
                      placeholder="Plant A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={plantForm.description}
                      onChange={(e) => setPlantForm({ ...plantForm, description: e.target.value })}
                      placeholder="Main production plant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={plantForm.location}
                      onChange={(e) => setPlantForm({ ...plantForm, location: e.target.value })}
                      placeholder="New York"
                    />
                  </div>
                  <Button onClick={handleCreatePlant} className="w-full">
                    Create Plant
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {plants.map((plant) => (
              <Card key={plant._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{plant.name}</CardTitle>
                      <CardDescription>
                        {plant.location && `${plant.location} • `}
                        Created by {plant.createdBy.username}
                      </CardDescription>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePlant(plant._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {plant.description && <p className="text-sm text-gray-400 mb-4">{plant.description}</p>}
                  <div className="flex gap-2">
                    <Dialog 
                      open={isAdminDialogOpen && selectedPlant === plant._id} 
                      onOpenChange={(open) => {
                        setIsAdminDialogOpen(open);
                        if (open) {
                          setSelectedPlant(plant._id);
                        } else {
                          setSelectedPlant(null);
                          setAdminForm({ username: '', email: '', password: '', userId: '' });
                          setAssignMode('new');
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPlant(plant._id);
                            setIsAdminDialogOpen(true);
                          }}
                        >
                          Assign Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Admin to {plant.name}</DialogTitle>
                          <DialogDescription>
                            {assignMode === 'new' 
                              ? 'Create new admin user. Credentials will be sent to their email.' 
                              : 'Assign existing user as admin for this plant'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Button
                              variant={assignMode === 'new' ? 'default' : 'outline'}
                              onClick={() => setAssignMode('new')}
                              className="flex-1"
                            >
                              New User
                            </Button>
                            <Button
                              variant={assignMode === 'existing' ? 'default' : 'outline'}
                              onClick={() => setAssignMode('existing')}
                              className="flex-1"
                            >
                              Existing User
                            </Button>
                          </div>
                          {assignMode === 'new' ? (
                            <>
                              <div className="space-y-2">
                                <Label>Username *</Label>
                                <Input
                                  value={adminForm.username}
                                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                                  placeholder="admin_user"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                  type="email"
                                  value={adminForm.email}
                                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                  placeholder="admin@example.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Password *</Label>
                                <Input
                                  type="password"
                                  value={adminForm.password}
                                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                  placeholder="••••••••"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="space-y-2">
                              <Label>Select User</Label>
                              <select
                                className="w-full p-2 border rounded"
                                value={adminForm.userId}
                                onChange={(e) => setAdminForm({ ...adminForm, userId: e.target.value })}
                              >
                                <option value="">Select a user...</option>
                                {users.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.username} ({user.email})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <Button onClick={handleAssignAdmin} className="w-full">
                            Assign Admin
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View all users and their plant access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plant Access</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded bg-blue-600 text-white capitalize">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.plantAccess.map((access: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{access.plantName}</span>
                              <span className="text-gray-400 ml-2">({access.accessType})</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.plantAccess.map((access: any) =>
                          access.accessType === 'admin' ? (
                            <Button
                              key={access.plantId}
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveAdmin(access.plantId, user.id)}
                              className="mr-2"
                            >
                              Remove Admin
                            </Button>
                          ) : null
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
