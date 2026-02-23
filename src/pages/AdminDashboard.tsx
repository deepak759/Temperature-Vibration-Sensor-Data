import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Users, Mail, BarChart3, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ViewerDashboard from './ViewerDashboard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [plantUsers, setPlantUsers] = useState<any[]>([]);
  const [alertEmails, setAlertEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // User form state
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '' });
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  // Alert email form state
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  // Get admin plants
  const adminPlants = user?.plantAccess.filter(access => access.accessType === 'admin') || [];

  useEffect(() => {
    if (adminPlants.length > 0 && !selectedPlantId) {
      setSelectedPlantId(adminPlants[0].plantId);
    }
  }, [adminPlants]);

  useEffect(() => {
    if (selectedPlantId) {
      loadPlantData();
    }
  }, [selectedPlantId]);

  const loadPlantData = async () => {
    if (!selectedPlantId) return;
    setLoading(true);
    try {
      const [usersRes, emailsRes] = await Promise.all([
        adminAPI.getPlantUsers(selectedPlantId),
        adminAPI.getAlertEmails(selectedPlantId),
      ]);
      setPlantUsers(usersRes.users);
      setAlertEmails(emailsRes.alertEmails);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load plant data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedPlantId) {
      toast.error('Please select a plant');
      return;
    }
    try {
      await adminAPI.addViewerUser(selectedPlantId, userForm);
      toast.success('User created successfully! Credentials have been sent to their email.');
      setIsUserDialogOpen(false);
      setUserForm({ username: '', email: '', password: '' });
      loadPlantData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add user');
    }
  };

  const handleAddAlertEmail = async () => {
    if (!selectedPlantId) {
      toast.error('Please select a plant');
      return;
    }
    try {
      await adminAPI.addAlertEmail(selectedPlantId, emailForm);
      toast.success('Alert email added successfully');
      setIsEmailDialogOpen(false);
      setEmailForm({ email: '' });
      loadPlantData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add alert email');
    }
  };

  const handleRemoveAlertEmail = async (alertEmailId: string) => {
    if (!selectedPlantId) return;
    if (!confirm('Are you sure you want to remove this alert email?')) return;
    try {
      await adminAPI.removeAlertEmail(selectedPlantId, alertEmailId);
      toast.success('Alert email removed successfully');
      loadPlantData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove alert email');
    }
  };

  if (adminPlants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-400">You don't have admin access to any plants.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedPlant = adminPlants.find(p => p.plantId === selectedPlantId);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="management" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="management">
            <Settings className="w-4 h-4 mr-2" />
            Plant Management
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
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage users and alert emails for your plants</p>
            </div>
            <div className="w-64">
              <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plant" />
                </SelectTrigger>
                <SelectContent>
                  {adminPlants.map((plant) => (
                    <SelectItem key={plant.plantId} value={plant.plantId}>
                      {plant.plantName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPlant && (
            <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users ({plantUsers.length})
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Mail className="w-4 h-4 mr-2" />
              Alert Emails ({alertEmails.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Viewer User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Viewer User</DialogTitle>
                    <DialogDescription>
                      Add a user with viewer access to {selectedPlant.plantName}. Credentials will be sent to their email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Username *</Label>
                      <Input
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                        placeholder="viewer_user"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        placeholder="viewer@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button onClick={handleAddUser} className="w-full">
                      Add User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Plant Users</CardTitle>
                <CardDescription>Users with access to {selectedPlant.plantName}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Access Type</TableHead>
                        <TableHead>Email Verified</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plantUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        plantUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 text-xs rounded bg-blue-600 text-white capitalize">
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell className="capitalize">{user.plantAccess}</TableCell>
                            <TableCell>
                              {user.emailVerified ? (
                                <span className="text-green-500">✓ Verified</span>
                              ) : (
                                <span className="text-yellow-500">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Alert Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Alert Email</DialogTitle>
                    <DialogDescription>
                      Add an email to receive alerts when vibration exceeds threshold for {selectedPlant.plantName}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address *</Label>
                      <Input
                        type="email"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({ email: e.target.value })}
                        placeholder="alerts@example.com"
                        required
                      />
                    </div>
                    <Button onClick={handleAddAlertEmail} className="w-full">
                      Add Alert Email
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Alert Emails</CardTitle>
                <CardDescription>Emails that receive alerts for {selectedPlant.plantName}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Added Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertEmails.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-400">
                            No alert emails configured
                          </TableCell>
                        </TableRow>
                      ) : (
                        alertEmails.map((alertEmail) => (
                          <TableRow key={alertEmail._id}>
                            <TableCell>{alertEmail.email}</TableCell>
                            <TableCell>{alertEmail.addedBy.username}</TableCell>
                            <TableCell>
                              {new Date(alertEmail.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveAlertEmail(alertEmail._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
