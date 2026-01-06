import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Shield, ShieldCheck, User, Trash2, Check, X, Clock } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "moderator" | "user";
  created_at: string;
  email?: string;
}

interface PendingRequest {
  id: string;
  email: string;
  requested_role: "moderator" | "admin";
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"moderator" | "admin">("moderator");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPendingRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("moderator_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        // Table might not exist yet, which is fine
        console.log("Pending requests table not found or error:", error);
        return;
      }
      setPendingRequests((data || []).map(item => ({
        ...item,
        requested_role: item.requested_role as "moderator" | "admin",
        status: item.status as "pending" | "approved" | "rejected",
      })));
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const addUserRole = async () => {
    if (!newUserEmail.trim()) {
      toast({ title: "Please enter an email", variant: "destructive" });
      return;
    }

    setAdding(true);
    try {
      // First, we need to find the user by email
      // Since we can't query auth.users directly, we'll need to store the email
      // For now, we'll create a pending request that can be approved when the user signs up
      
      const { error } = await supabase.from("moderator_requests").insert({
        email: newUserEmail.trim().toLowerCase(),
        requested_role: newUserRole,
        status: "approved", // Auto-approved since admin is adding
      });

      if (error) throw error;

      toast({ title: `${newUserRole} access granted to ${newUserEmail}` });
      setNewUserEmail("");
      setIsAddDialogOpen(false);
      fetchPendingRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const approveRequest = async (request: PendingRequest) => {
    try {
      const { error } = await supabase
        .from("moderator_requests")
        .update({ status: "approved" })
        .eq("id", request.id);

      if (error) throw error;

      toast({ title: `Approved ${request.email} as ${request.requested_role}` });
      fetchPendingRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectRequest = async (request: PendingRequest) => {
    try {
      const { error } = await supabase
        .from("moderator_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);

      if (error) throw error;

      toast({ title: `Rejected request from ${request.email}` });
      fetchPendingRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeUserRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({ title: "User role removed" });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
            <Shield className="h-3 w-3 mr-1" />
            Moderator
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <User className="h-3 w-3 mr-1" />
            User
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Moderator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Moderator/Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as "moderator" | "admin")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                The user will get access when they sign up with this email address.
              </p>
              <Button onClick={addUserRole} disabled={adding} className="w-full">
                {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{getRoleBadge(request.requested_role)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                          onClick={() => approveRequest(request)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => rejectRequest(request)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Current Users with Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Admins & Moderators</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users with special roles yet
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">
                      {user.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeUserRole(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
