import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MoreHorizontal, Calendar, MessageSquare, Users, Star, TrendingUp, Target } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FamilyBoard {
  id: string;
  name: string;
  description: string;
  type: 'family' | 'work' | 'personal' | 'projects';
  members: string[];
  lists: string[];
  backgroundColor: string;
  isStarred: boolean;
  lastActivity: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BoardList {
  id: string;
  boardId: string;
  name: string;
  position: number;
  cards: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskCard {
  id: string;
  listId: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  labels: string[];
  position: number;
  checklist: ChecklistItem[];
  comments: CardComment[];
  attachments: string[];
  estimatedTime?: number;
  actualTime?: number;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  isArchived: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assignedTo?: string;
  completedAt?: Date;
  completedBy?: string;
}

interface CardComment {
  id: string;
  author: string;
  comment: string;
  timestamp: Date;
  mentions: string[];
  reactions: Record<string, string[]>;
}

interface BoardAnalytics {
  totalCards: number;
  completedCards: number;
  overdueCards: number;
  avgCompletionTime: number;
  memberProductivity: Record<string, number>;
  priorityDistribution: Record<string, number>;
  weeklyProgress: Array<{ week: string; completed: number; created: number }>;
  bottlenecks: string[];
  suggestions: string[];
}

export function FamilyTrelloBoard() {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false);
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  const [selectedListForCard, setSelectedListForCard] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch family boards
  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ['/api/family/boards'],
    refetchInterval: 30000
  });

  // Fetch board lists
  const { data: lists = [] } = useQuery({
    queryKey: ['/api/family/board', selectedBoard, 'lists'],
    enabled: !!selectedBoard
  });

  // Fetch all cards for the selected board
  const { data: allCards = [] } = useQuery({
    queryKey: ['/api/family/cards', selectedBoard],
    queryFn: async () => {
      if (!selectedBoard) return [];
      const cardPromises = lists.map(async (list: BoardList) => {
        const response = await fetch(`/api/family/list/${list.id}/cards`);
        const cards = await response.json();
        return cards;
      });
      const cardArrays = await Promise.all(cardPromises);
      return cardArrays.flat();
    },
    enabled: !!selectedBoard && lists.length > 0
  });

  // Fetch board analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/family/board', selectedBoard, 'analytics'],
    enabled: !!selectedBoard && showAnalytics
  });

  // Create new board mutation
  const createBoardMutation = useMutation({
    mutationFn: async (boardData: {
      name: string;
      description: string;
      type: string;
      members: string[];
    }) => {
      return apiRequest('/api/family/board', {
        method: 'POST',
        body: JSON.stringify(boardData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/boards'] });
      setShowNewBoardDialog(false);
      toast({
        title: "Board Created",
        description: "New family board created successfully"
      });
    }
  });

  // Create new card mutation
  const createCardMutation = useMutation({
    mutationFn: async (cardData: {
      listId: string;
      title: string;
      description: string;
      priority: string;
      assignedTo: string[];
    }) => {
      return apiRequest('/api/family/card', {
        method: 'POST',
        body: JSON.stringify(cardData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/cards', selectedBoard] });
      setShowNewCardDialog(false);
      toast({
        title: "Card Created",
        description: "New task card created successfully"
      });
    }
  });

  // Move card mutation
  const moveCardMutation = useMutation({
    mutationFn: async ({ cardId, targetListId, position }: {
      cardId: string;
      targetListId: string;
      position: number;
    }) => {
      return apiRequest(`/api/family/card/${cardId}/move`, {
        method: 'POST',
        body: JSON.stringify({ targetListId, position })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/cards', selectedBoard] });
    }
  });

  // AI optimization mutation
  const optimizeBoardMutation = useMutation({
    mutationFn: async (boardId: string) => {
      return apiRequest(`/api/family/board/${boardId}/optimize`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      toast({
        title: "AI Optimization Complete",
        description: `Generated ${data.suggestions.length} suggestions for improvement`
      });
    }
  });

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveCardMutation.mutate({
      cardId: draggableId,
      targetListId: destination.droppableId,
      position: destination.index
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'family': return '👨‍👩‍👧‍👦';
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'projects': return '🔧';
      default: return '📋';
    }
  };

  if (boardsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            PTNI Family Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            AI-enhanced family collaboration and task management
          </p>

          {/* Board Selection */}
          <div className="flex flex-wrap gap-4 mb-6">
            {boards.map((board: FamilyBoard) => (
              <Card
                key={board.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedBoard === board.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedBoard(board.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(board.type)}</span>
                    <div>
                      <h3 className="font-semibold">{board.name}</h3>
                      <p className="text-sm text-gray-500">{board.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">{board.members.length} members</span>
                        {board.isStarred && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* New Board Button */}
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg border-dashed border-2"
              onClick={() => setShowNewBoardDialog(true)}
            >
              <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-500">Create New Board</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Board Actions */}
          {selectedBoard && (
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant="outline"
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Analytics
              </Button>
              <Button 
                onClick={() => optimizeBoardMutation.mutate(selectedBoard)}
                variant="outline"
                className="gap-2"
                disabled={optimizeBoardMutation.isPending}
              >
                <Target className="h-4 w-4" />
                AI Optimize
              </Button>
            </div>
          )}
        </div>

        {/* Analytics Panel */}
        {showAnalytics && analytics && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Board Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalCards}</div>
                  <div className="text-sm text-gray-500">Total Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.completedCards}</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analytics.overdueCards}</div>
                  <div className="text-sm text-gray-500">Overdue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.avgCompletionTime}d</div>
                  <div className="text-sm text-gray-500">Avg. Completion</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Priority Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.priorityDistribution).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between">
                        <span className="capitalize">{priority}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">AI Suggestions</h4>
                  <ul className="space-y-1 text-sm">
                    {analytics.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-600">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trello Board */}
        {selectedBoard && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-6">
              {lists.map((list: BoardList) => {
                const listCards = allCards.filter((card: TaskCard) => card.listId === list.id);
                
                return (
                  <div key={list.id} className="flex-shrink-0 w-80">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{list.name}</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedListForCard(list.id);
                              setShowNewCardDialog(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500">{listCards.length} cards</div>
                      </CardHeader>
                      <CardContent>
                        <Droppable droppableId={list.id}>
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="min-h-24 space-y-3"
                            >
                              {listCards.map((card: TaskCard, index: number) => (
                                <Draggable key={card.id} draggableId={card.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <Card className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-3">
                                          <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-sm">{card.title}</h4>
                                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(card.priority)}`} />
                                          </div>
                                          
                                          {card.description && (
                                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                              {card.description}
                                            </p>
                                          )}

                                          <div className="flex flex-wrap gap-1 mb-2">
                                            {card.labels.map((label, idx) => (
                                              <Badge key={idx} variant="secondary" className="text-xs">
                                                {label}
                                              </Badge>
                                            ))}
                                          </div>

                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                              {card.dueDate && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                  <Calendar className="h-3 w-3" />
                                                  {new Date(card.dueDate).toLocaleDateString()}
                                                </div>
                                              )}
                                              {card.comments.length > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                  <MessageSquare className="h-3 w-3" />
                                                  {card.comments.length}
                                                </div>
                                              )}
                                            </div>
                                            
                                            <div className="flex -space-x-1">
                                              {card.assignedTo.slice(0, 3).map((member, idx) => (
                                                <Avatar key={idx} className="h-6 w-6 border-2 border-white">
                                                  <AvatarFallback className="text-xs">
                                                    {member.slice(0, 2).toUpperCase()}
                                                  </AvatarFallback>
                                                </Avatar>
                                              ))}
                                              {card.assignedTo.length > 3 && (
                                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                                                  +{card.assignedTo.length - 3}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}

        {/* New Board Dialog */}
        <Dialog open={showNewBoardDialog} onOpenChange={setShowNewBoardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
            </DialogHeader>
            <NewBoardForm 
              onSubmit={(data) => createBoardMutation.mutate(data)}
              isLoading={createBoardMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* New Card Dialog */}
        <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Card</DialogTitle>
            </DialogHeader>
            <NewCardForm 
              listId={selectedListForCard || ''}
              onSubmit={(data) => createCardMutation.mutate(data)}
              isLoading={createCardMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function NewBoardForm({ onSubmit, isLoading }: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'family',
    members: ['watson-admin']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Board Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Enter board name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter board description"
        />
      </div>

      <div>
        <Label htmlFor="type">Board Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Board'}
      </Button>
    </form>
  );
}

function NewCardForm({ listId, onSubmit, isLoading }: {
  listId: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    listId,
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: ['watson-admin']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Card Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter card title"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter card description"
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Card'}
      </Button>
    </form>
  );
}