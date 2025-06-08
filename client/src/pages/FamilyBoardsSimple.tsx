import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Brain, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FamilyBoardsSimple() {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [newBoardData, setNewBoardData] = useState({
    name: '',
    description: '',
    type: 'family',
    members: ['watson-admin']
  });
  const [newCardData, setNewCardData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: [],
    dueDate: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch family boards
  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ['/api/family/boards'],
    refetchInterval: 5000
  });

  // Fetch board lists when a board is selected
  const { data: lists = [] } = useQuery({
    queryKey: ['/api/family/board', selectedBoard, 'lists'],
    enabled: !!selectedBoard
  });

  // Create board mutation
  const createBoardMutation = useMutation({
    mutationFn: async (boardData: any) => {
      const response = await fetch('/api/family/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boardData)
      });
      if (!response.ok) throw new Error('Failed to create board');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/boards'] });
      setShowCreateBoard(false);
      setNewBoardData({ name: '', description: '', type: 'family', members: ['watson-admin'] });
      toast({
        title: "Board Created",
        description: "Your new family board has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create board. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (cardData: any) => {
      const response = await fetch('/api/family/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });
      if (!response.ok) throw new Error('Failed to create card');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/board', selectedBoard, 'lists'] });
      setShowCreateCard(false);
      setNewCardData({ title: '', description: '', priority: 'medium', assignedTo: [], dueDate: '' });
      toast({
        title: "Card Created",
        description: "Your new task card has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create card. Please try again.",
        variant: "destructive",
      });
    }
  });

  // AI Optimization mutation
  const optimizeBoardMutation = useMutation({
    mutationFn: async (boardId: string) => {
      const response = await fetch(`/api/family/board/${boardId}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId })
      });
      if (!response.ok) throw new Error('Failed to optimize board');
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "AI Optimization Complete",
        description: `Generated ${data.suggestions?.length || 0} suggestions for improved productivity.`,
      });
    }
  });

  const handleCreateBoard = () => {
    if (!newBoardData.name.trim()) return;
    createBoardMutation.mutate(newBoardData);
  };

  const handleCreateCard = () => {
    if (!newCardData.title.trim() || !selectedList) return;
    createCardMutation.mutate({
      ...newCardData,
      listId: selectedList,
      labels: [],
      dueDate: newCardData.dueDate ? new Date(newCardData.dueDate) : undefined
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

  if (boardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PTNI-Enhanced Family Boards...</p>
        </div>
      </div>
    );
  }

  if (!selectedBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">PTNI Family & Friends Dashboard</h1>
              <p className="text-gray-600">Enhanced Trello-style collaborative task management with AI optimization</p>
            </div>
            <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Board
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Board</DialogTitle>
                  <DialogDescription>Set up a new collaborative board for your family or team.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      value={newBoardData.name}
                      onChange={(e) => setNewBoardData(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                      placeholder="Enter board name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea
                      id="description"
                      value={newBoardData.description}
                      onChange={(e) => setNewBoardData(prev => ({ ...prev, description: e.target.value }))}
                      className="col-span-3"
                      placeholder="Describe the board purpose"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select value={newBoardData.type} onValueChange={(value: any) => setNewBoardData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select board type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="projects">Projects</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateBoard} disabled={createBoardMutation.isPending}>
                    {createBoardMutation.isPending ? 'Creating...' : 'Create Board'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board: any) => (
              <Card 
                key={board.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4"
                style={{ borderLeftColor: board.backgroundColor || '#0079bf' }}
                onClick={() => setSelectedBoard(board.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">{board.name}</CardTitle>
                      <CardDescription className="mt-1">{board.description}</CardDescription>
                    </div>
                    {board.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary">{board.type}</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {board.members?.length || 1}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Lists: {board.lists?.length || 0}</span>
                    <span>Updated: {new Date(board.updatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {boards.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No boards yet</h3>
              <p className="text-gray-500 mb-4">Create your first PTNI-enhanced family board to get started with collaborative task management.</p>
              <Button onClick={() => setShowCreateBoard(true)} className="bg-blue-600 hover:bg-blue-700">
                Create Your First Board
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const selectedBoardData = boards.find((b: any) => b.id === selectedBoard);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setSelectedBoard(null)}>
                ← Back to Boards
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedBoardData?.name}</h1>
                <p className="text-gray-600">{selectedBoardData?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => optimizeBoardMutation.mutate(selectedBoard)}
                disabled={optimizeBoardMutation.isPending}
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Optimize
              </Button>
              <Dialog open={showCreateCard} onOpenChange={setShowCreateCard}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Card</DialogTitle>
                    <DialogDescription>Add a new task to your board.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cardTitle" className="text-right">Title</Label>
                      <Input
                        id="cardTitle"
                        value={newCardData.title}
                        onChange={(e) => setNewCardData(prev => ({ ...prev, title: e.target.value }))}
                        className="col-span-3"
                        placeholder="Enter task title"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cardDescription" className="text-right">Description</Label>
                      <Textarea
                        id="cardDescription"
                        value={newCardData.description}
                        onChange={(e) => setNewCardData(prev => ({ ...prev, description: e.target.value }))}
                        className="col-span-3"
                        placeholder="Describe the task"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cardList" className="text-right">List</Label>
                      <Select value={selectedList || ''} onValueChange={setSelectedList}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select list" />
                        </SelectTrigger>
                        <SelectContent>
                          {lists.map((list: any) => (
                            <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cardPriority" className="text-right">Priority</Label>
                      <Select value={newCardData.priority} onValueChange={(value: any) => setNewCardData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateCard} disabled={createCardMutation.isPending}>
                      {createCardMutation.isPending ? 'Creating...' : 'Create Card'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {lists.map((list: any) => (
            <div key={list.id} className="flex-shrink-0 w-80">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">{list.name}</h3>
                  <Badge variant="secondary">{list.cards?.length || 0}</Badge>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {list.cards?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No cards in this list</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {lists.length === 0 && (
            <div className="text-center py-12 w-full">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Board is being set up</h3>
              <p className="text-gray-500">Lists and cards will appear here once the board is fully initialized.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}