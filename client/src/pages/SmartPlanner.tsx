import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Users, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  category: 'appointment' | 'family' | 'work' | 'personal' | 'urgent';
  assignedTo: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  location?: string;
  recurring?: boolean;
}

interface FamilyTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  category: 'household' | 'school' | 'work' | 'health' | 'personal';
  status: 'pending' | 'in-progress' | 'completed';
  estimatedTime: number;
}

export function SmartPlanner() {
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventPriority, setEventPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [eventCategory, setEventCategory] = useState<'appointment' | 'family' | 'work' | 'personal' | 'urgent'>('family');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskCategory, setTaskCategory] = useState<'household' | 'school' | 'work' | 'health' | 'personal'>('household');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch events and tasks
  const { data: events = [] } = useQuery({
    queryKey: ['/api/family/events'],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/family/tasks'],
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Partial<FamilyEvent>) => {
      const response = await fetch('/api/family/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/events'] });
      setShowEventDialog(false);
      resetEventForm();
      toast({ title: "Event Created", description: "Family event added successfully." });
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<FamilyTask>) => {
      const response = await fetch('/api/family/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/tasks'] });
      setShowTaskDialog(false);
      resetTaskForm();
      toast({ title: "Task Created", description: "Family task added successfully." });
    }
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/family/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to complete task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/tasks'] });
      toast({ title: "Task Completed", description: "Great job completing that task!" });
    }
  });

  const resetEventForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setEventTime('');
    setEventPriority('medium');
    setEventCategory('family');
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskPriority('medium');
    setTaskCategory('household');
  };

  const handleCreateEvent = () => {
    if (!eventTitle || !eventDate || !eventTime) return;
    
    createEventMutation.mutate({
      title: eventTitle,
      description: eventDescription,
      date: eventDate,
      time: eventTime,
      priority: eventPriority,
      category: eventCategory,
      status: 'upcoming',
      assignedTo: ['family']
    });
  };

  const handleCreateTask = () => {
    if (!taskTitle || !taskDueDate) return;
    
    createTaskMutation.mutate({
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate,
      priority: taskPriority,
      category: taskCategory,
      status: 'pending',
      assignedTo: 'family',
      estimatedTime: 30
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'family': return <Users className="w-4 h-4" />;
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const upcomingEvents = events.filter((event: FamilyEvent) => event.status === 'upcoming').slice(0, 5);
  const pendingTasks = tasks.filter((task: FamilyTask) => task.status !== 'completed').slice(0, 8);
  const completedTasks = tasks.filter((task: FamilyTask) => task.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartPlanner</h1>
            <p className="text-gray-600">AI-powered family scheduling and task management</p>
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
                <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                  <p className="text-gray-600">Upcoming Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
                  <p className="text-gray-600">Pending Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                  <p className="text-gray-600">Completed Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                  <p className="text-gray-600">Family Sync</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Upcoming Events</CardTitle>
                <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Family Event</DialogTitle>
                      <DialogDescription>Add a new event to your family calendar</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title">Event Title</Label>
                        <Input
                          id="event-title"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          placeholder="Family dinner, Doctor appointment..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-description">Description</Label>
                        <Textarea
                          id="event-description"
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          placeholder="Additional details..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-date">Date</Label>
                          <Input
                            id="event-date"
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-time">Time</Label>
                          <Input
                            id="event-time"
                            type="time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={eventPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setEventPriority(value)}>
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
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={eventCategory} onValueChange={(value: 'appointment' | 'family' | 'work' | 'personal' | 'urgent') => setEventCategory(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="appointment">Appointment</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateEvent} disabled={createEventMutation.isPending}>
                        {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event: FamilyEvent) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(event.category)}
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(event.priority)}>
                      {event.priority}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-center text-gray-500 py-8">No upcoming events. Add your first event!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tasks Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Family Tasks</CardTitle>
                <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Family Task</DialogTitle>
                      <DialogDescription>Add a new task for family members</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title">Task Title</Label>
                        <Input
                          id="task-title"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          placeholder="Clean kitchen, Buy groceries..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                          id="task-description"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          placeholder="Task details and requirements..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-due-date">Due Date</Label>
                        <Input
                          id="task-due-date"
                          type="date"
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={taskPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setTaskPriority(value)}>
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
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={taskCategory} onValueChange={(value: 'household' | 'school' | 'work' | 'health' | 'personal') => setTaskCategory(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="household">Household</SelectItem>
                              <SelectItem value="school">School</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                        {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.length > 0 ? pendingTasks.map((task: FamilyTask) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle 
                        className="w-5 h-5 text-gray-400 cursor-pointer hover:text-green-600"
                        onClick={() => completeTaskMutation.mutate(task.id)}
                      />
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-500 py-8">No pending tasks. Add your first task!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}