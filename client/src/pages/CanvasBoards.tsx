import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  ArrowLeft,
  Plus, 
  Users, 
  Calendar,
  Tag,
  MoreVertical,
  Clock
} from 'lucide-react';

interface CanvasCard {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface CanvasColumn {
  id: string;
  title: string;
  position: number;
  cards: CanvasCard[];
}

interface CanvasBoard {
  id: string;
  name: string;
  type: 'kanban' | 'scrum' | 'workflow' | 'family-board';
  columns: CanvasColumn[];
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CanvasBoards() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [newCardData, setNewCardData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as const,
    columnId: ''
  });

  // Fetch all boards
  const { data: boardsData } = useQuery({
    queryKey: ['/api/canvas/boards'],
    refetchInterval: 5000
  });

  // Fetch selected board details
  const { data: boardData } = useQuery({
    queryKey: ['/api/canvas/boards', selectedBoard],
    enabled: !!selectedBoard,
    refetchInterval: 3000
  });

  // Add new card mutation
  const addCardMutation = useMutation({
    mutationFn: async (cardData: any) => {
      const response = await fetch(`/api/canvas/boards/${selectedBoard}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });
      if (!response.ok) throw new Error('Failed to add card');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Card Added",
        description: "New card has been added to the board",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/canvas/boards', selectedBoard] });
      setNewCardData({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        columnId: ''
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add card to board",
        variant: "destructive"
      });
    }
  });

  // Move card mutation
  const moveCardMutation = useMutation({
    mutationFn: async ({ cardId, targetColumnId }: { cardId: string; targetColumnId: string }) => {
      const response = await fetch(`/api/canvas/cards/${cardId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: selectedBoard, targetColumnId })
      });
      if (!response.ok) throw new Error('Failed to move card');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvas/boards', selectedBoard] });
    }
  });

  const boards = boardsData?.boards || [];
  const currentBoard = boardData?.board;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'high': return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'low': return 'bg-green-500/20 border-green-500 text-green-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation('/dashboard')}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-purple-500/20 border-purple-500 text-purple-400">
              Canvas Boards
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 border-blue-500 text-blue-400">
              {boards.length} Boards
            </Badge>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Canvas Board Management</h1>
          <p className="text-xl text-gray-300">Interactive Kanban boards with real-time collaboration</p>
        </div>

        {!selectedBoard ? (
          // Board selection view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board: CanvasBoard) => (
              <Card 
                key={board.id} 
                className="bg-white/10 border-white/20 hover:bg-white/15 cursor-pointer transition-all"
                onClick={() => setSelectedBoard(board.id)}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {board.name}
                    <Badge className={`${
                      board.type === 'family-board' ? 'bg-green-500/20 border-green-500 text-green-400' :
                      board.type === 'kanban' ? 'bg-blue-500/20 border-blue-500 text-blue-400' :
                      board.type === 'scrum' ? 'bg-purple-500/20 border-purple-500 text-purple-400' :
                      'bg-orange-500/20 border-orange-500 text-orange-400'
                    }`}>
                      {board.type}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {board.columns.length} columns • {board.members.length} members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    {board.members.join(', ')}
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    Total cards: {board.columns.reduce((total, col) => total + col.cards.length, 0)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Board detail view
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedBoard(null)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Boards
              </Button>
              
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">{currentBoard?.name}</h2>
                <Badge className="bg-blue-500/20 border-blue-500 text-blue-400">
                  {currentBoard?.type}
                </Badge>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Card</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a new card for this board
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Card title"
                      value={newCardData.title}
                      onChange={(e) => setNewCardData({ ...newCardData, title: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Textarea
                      placeholder="Card description"
                      value={newCardData.description}
                      onChange={(e) => setNewCardData({ ...newCardData, description: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Input
                      placeholder="Assigned to (comma separated)"
                      value={newCardData.assignedTo}
                      onChange={(e) => setNewCardData({ ...newCardData, assignedTo: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Select value={newCardData.priority} onValueChange={(value: any) => setNewCardData({ ...newCardData, priority: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newCardData.columnId} onValueChange={(value) => setNewCardData({ ...newCardData, columnId: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {currentBoard?.columns.map((column: CanvasColumn) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => addCardMutation.mutate({
                        ...newCardData,
                        assignedTo: newCardData.assignedTo.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      disabled={!newCardData.title || !newCardData.columnId || addCardMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {addCardMutation.isPending ? 'Adding...' : 'Add Card'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[600px]">
              {currentBoard?.columns.map((column: CanvasColumn) => (
                <Card key={column.id} className="bg-white/10 border-white/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center justify-between">
                      {column.title}
                      <Badge className="bg-blue-500/20 border-blue-500 text-blue-400">
                        {column.cards.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                    {column.cards.map((card: CanvasCard) => (
                      <Card key={card.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="text-white font-medium text-sm">{card.title}</h4>
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                              <MoreVertical className="w-3 h-3 text-gray-400" />
                            </Button>
                          </div>
                          
                          {card.description && (
                            <p className="text-gray-400 text-xs">{card.description}</p>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(card.priority)}>
                              {card.priority}
                            </Badge>
                          </div>
                          
                          {card.assignedTo.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Users className="w-3 h-3" />
                              {card.assignedTo.join(', ')}
                            </div>
                          )}
                          
                          {card.tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <Tag className="w-3 h-3 text-gray-400" />
                              {card.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-gray-700/50 border-gray-600 text-gray-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {card.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {new Date(card.dueDate).toLocaleDateString()}
                            </div>
                          )}

                          <div className="flex gap-1">
                            {currentBoard.columns.filter(col => col.id !== column.id).map((targetCol) => (
                              <Button
                                key={targetCol.id}
                                variant="outline"
                                size="sm"
                                onClick={() => moveCardMutation.mutate({ cardId: card.id, targetColumnId: targetCol.id })}
                                className="text-xs bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600"
                              >
                                → {targetCol.title}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}