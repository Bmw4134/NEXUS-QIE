import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Brain, 
  FileText, 
  Target, 
  MessageCircle, 
  Bell, 
  CheckCircle, 
  Activity,
  TrendingUp,
  Home,
  Star,
  Clock,
  ArrowRight
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  avatar?: string;
  lastActive: string;
}

interface FamilyActivity {
  id: string;
  type: string;
  description: string;
  memberId: string;
  memberName: string;
  timestamp: string;
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
}

export default function FamilyHub() {
  // Fetch family data
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['/api/family/members'],
    refetchInterval: 30000
  });

  const { data: familyActivities = [] } = useQuery({
    queryKey: ['/api/family/activities'], 
    refetchInterval: 10000
  });

  const { data: familyMessages = [] } = useQuery({
    queryKey: ['/api/family/messages'],
    refetchInterval: 5000
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['/api/family/budgets']
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/family/tasks']
  });

  const { data: events = [] } = useQuery({
    queryKey: ['/api/family/events']
  });

  // Calculate quick stats
  const quickStats: QuickStat[] = [
    {
      label: 'Active Members',
      value: Array.isArray(familyMembers) ? familyMembers.filter((m: FamilyMember) => m.status === 'online').length.toString() : '0',
      change: Array.isArray(familyMembers) ? `${familyMembers.length} total` : '0 total',
      trend: 'stable',
      icon: Users
    },
    {
      label: 'Pending Tasks',
      value: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === 'pending').length.toString() : '0',
      change: Array.isArray(tasks) ? `${tasks.length} total` : '0 total',
      trend: 'down',
      icon: CheckCircle
    },
    {
      label: 'This Month Budget',
      value: Array.isArray(budgets) ? budgets.reduce((sum: number, b: any) => sum + (b.allocated || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0',
      change: Array.isArray(budgets) ? `${budgets.reduce((sum: number, b: any) => sum + (b.spent || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} spent` : '$0 spent',
      trend: 'up',
      icon: DollarSign
    },
    {
      label: 'Upcoming Events',
      value: Array.isArray(events) ? events.filter((e: any) => new Date(e.date) > new Date()).length.toString() : '0',
      change: 'This week',
      trend: 'stable',
      icon: Calendar
    }
  ];

  const familyModules = [
    {
      id: 'smart-planner',
      name: 'SmartPlanner',
      description: 'Intelligent family planning and scheduling',
      path: '/smart-planner',
      icon: Calendar,
      color: 'bg-blue-500',
      stats: `${Array.isArray(events) ? events.length : 0} events`
    },
    {
      id: 'wealth-pulse',
      name: 'WealthPulse',
      description: 'Financial management and budgeting',
      path: '/wealth-pulse',
      icon: DollarSign,
      color: 'bg-green-500',
      stats: `${Array.isArray(budgets) ? budgets.length : 0} budgets`
    },
    {
      id: 'quantum-insights',
      name: 'QuantumInsights',
      description: 'AI-powered family analytics',
      path: '/quantum-insights',
      icon: Brain,
      color: 'bg-purple-500',
      stats: 'AI active'
    },
    {
      id: 'nexus-notes',
      name: 'NEXUS Notes',
      description: 'Shared family knowledge base',
      path: '/nexus-notes',
      icon: FileText,
      color: 'bg-orange-500',
      stats: 'Knowledge hub'
    },
    {
      id: 'family-sync',
      name: 'FamilySync',
      description: 'Real-time communication center',
      path: '/family-sync',
      icon: MessageCircle,
      color: 'bg-red-500',
      stats: `${Array.isArray(familyMessages) ? familyMessages.length : 0} messages`
    },
    {
      id: 'canvas-boards',
      name: 'Canvas Boards',
      description: 'Visual collaboration boards',
      path: '/canvas-boards',
      icon: Target,
      color: 'bg-indigo-500',
      stats: 'Collaboration'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'event_created': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'note_shared': return <FileText className="w-4 h-4 text-purple-600" />;
      case 'expense_added': return <DollarSign className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const onlineMembers = familyMembers.filter((member: FamilyMember) => member.status === 'online');
  const recentActivities = familyActivities.slice(0, 6);
  const recentMessages = familyMessages.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Family Hub</h1>
              <p className="text-gray-600 dark:text-gray-300">Your family's digital command center</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Family Modules */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Family Modules</span>
                </CardTitle>
                <CardDescription>Access all your family management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyModules.map((module) => (
                    <Link key={module.id} href={module.path}>
                      <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border-0 bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-slate-700/90 dark:to-slate-800/90">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center`}>
                              <module.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{module.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{module.description}</p>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {module.stats}
                              </Badge>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activities</span>
                </CardTitle>
                <CardDescription>Latest family member activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity: FamilyActivity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {activity.memberName} • {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activities</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Online Members */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Family Members</span>
                  <Badge variant="outline" className="ml-auto">
                    {onlineMembers.length} online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {familyMembers.length > 0 ? (
                    familyMembers.map((member: FamilyMember) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            member.status === 'online' ? 'bg-green-500' : 
                            member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{member.role}</p>
                        </div>
                        <Badge variant={member.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                          {member.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No family members online</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Recent Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMessages.length > 0 ? (
                    recentMessages.map((message: any) => (
                      <div key={message.id} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                        <p className="text-sm text-gray-900 dark:text-white">{message.content}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {message.senderName} • {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent messages</p>
                    </div>
                  )}
                </div>
                <Link href="/family-sync">
                  <Button className="w-full mt-4" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open FamilySync
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/smart-planner">
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                  <Link href="/wealth-pulse">
                    <Button className="w-full justify-start" variant="outline">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                  </Link>
                  <Link href="/nexus-notes">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      New Note
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}