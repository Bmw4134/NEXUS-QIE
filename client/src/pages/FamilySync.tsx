import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MessageCircle, Calendar, CheckCircle, Clock, Bell, Plus, Send, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'child' | 'guardian';
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen: string;
}

interface FamilyMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  type: 'text' | 'announcement' | 'reminder';
  priority: 'low' | 'medium' | 'high';
}

interface FamilyActivity {
  id: string;
  type: 'task_completed' | 'event_created' | 'note_shared' | 'expense_added' | 'goal_achieved';
  description: string;
  memberId: string;
  memberName: string;
  timestamp: string;
  details?: any;
}

export function FamilySync() {
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'announcement' | 'reminder'>('text');
  const [messagePriority, setMessagePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child' | 'guardian'>('child');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch family data from APIs
  const { data: familyMembers = [] } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family/members'],
  });

  const { data: familyMessages = [] } = useQuery<FamilyMessage[]>({
    queryKey: ['/api/family/messages'],
  });

  const { data: familyActivities = [] } = useQuery<FamilyActivity[]>({
    queryKey: ['/api/family/activities'],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: Partial<FamilyMessage>) => {
      const response = await fetch('/api/family/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/messages'] });
      setShowMessageDialog(false);
      resetMessageForm();
      toast({ title: "Message Sent", description: "Your message has been sent to the family." });
    }
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (memberData: Partial<FamilyMember>) => {
      const response = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      if (!response.ok) throw new Error('Failed to add member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/members'] });
      setShowMemberDialog(false);
      resetMemberForm();
      toast({ title: "Member Added", description: "New family member has been added successfully." });
    }
  });

  const resetMessageForm = () => {
    setMessageContent('');
    setMessageType('text');
    setMessagePriority('medium');
  };

  const resetMemberForm = () => {
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('child');
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    
    sendMessageMutation.mutate({
      content: messageContent,
      type: messageType,
      priority: messagePriority
    });
  };

  const handleAddMember = () => {
    if (!newMemberName || !newMemberEmail) return;
    
    addMemberMutation.mutate({
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'event_created': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'note_shared': return <MessageCircle className="w-4 h-4 text-purple-600" />;
      case 'expense_added': return <Activity className="w-4 h-4 text-orange-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const onlineMembers = familyMembers.filter(member => member.status === 'online');
  const recentMessages = familyMessages.slice(0, 5);
  const recentActivities = familyActivities.slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FamilySync</h1>
            <p className="text-gray-600">Real-time family communication and coordination</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{familyMembers.length}</p>
                  <p className="text-gray-600">Family Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{onlineMembers.length}</p>
                  <p className="text-gray-600">Online Now</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{familyMessages.length}</p>
                  <p className="text-gray-600">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{recentActivities.length}</p>
                  <p className="text-gray-600">Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Family Members */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Family Members</CardTitle>
                <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Family Member</DialogTitle>
                      <DialogDescription>Invite a new member to join your family platform</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="member-name">Full Name</Label>
                        <Input
                          id="member-name"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-email">Email Address</Label>
                        <Input
                          id="member-email"
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={newMemberRole} onValueChange={(value: 'parent' | 'child' | 'guardian') => setNewMemberRole(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddMember} disabled={addMemberMutation.isPending}>
                        {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {familyMembers.length > 0 ? familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        <span className="text-xs text-gray-500">{member.lastSeen}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No family members yet</p>
                    <Button onClick={() => setShowMemberDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Member
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages & Communication */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Family Messages</CardTitle>
                <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Family Message</DialogTitle>
                      <DialogDescription>Send a message to all family members</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="message-content">Message</Label>
                        <Textarea
                          id="message-content"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          placeholder="Type your message here..."
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={messageType} onValueChange={(value: 'text' | 'announcement' | 'reminder') => setMessageType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text Message</SelectItem>
                              <SelectItem value="announcement">Announcement</SelectItem>
                              <SelectItem value="reminder">Reminder</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={messagePriority} onValueChange={(value: 'low' | 'medium' | 'high') => setMessagePriority(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending}>
                        {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.length > 0 ? recentMessages.map((message) => (
                  <div key={message.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{message.senderName}</span>
                      <div className="flex items-center space-x-2">
                        <Badge className={getMessageTypeColor(message.type)}>
                          {message.type}
                        </Badge>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{message.content}</p>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No messages yet</p>
                    <Button onClick={() => setShowMessageDialog(true)}>
                      <Send className="w-4 h-4 mr-2" />
                      Send First Message
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Live feed of family platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-600">{activity.memberName}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Family activities will appear here</p>
                    <p className="text-sm text-gray-500">Start using the platform to see real-time updates</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Collaboration Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Real-time Collaboration
            </CardTitle>
            <CardDescription>Advanced features for seamless family coordination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Instant Messaging</h3>
                <p className="text-sm text-gray-600">
                  Real-time family communication with priority levels and message types
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Live Activity Feed</h3>
                <p className="text-sm text-gray-600">
                  Track family member activities and achievements in real-time
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Presence Indicators</h3>
                <p className="text-sm text-gray-600">
                  See who's online, busy, or offline for better coordination timing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}