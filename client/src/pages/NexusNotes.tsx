import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Search, Tag, Star, Clock, Users, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyNote {
  id: string;
  title: string;
  content: string;
  category: 'personal' | 'family' | 'work' | 'health' | 'finance' | 'ideas';
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  isShared: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export function NexusNotes() {
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'personal' | 'family' | 'work' | 'health' | 'finance' | 'ideas'>('family');
  const [noteTags, setNoteTags] = useState('');
  const [notePriority, setNotePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isShared, setIsShared] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch notes from API
  const { data: notes = [] } = useQuery<FamilyNote[]>({
    queryKey: ['/api/family/notes'],
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: Partial<FamilyNote>) => {
      const response = await fetch('/api/family/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      if (!response.ok) throw new Error('Failed to create note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/notes'] });
      setShowNoteDialog(false);
      resetNoteForm();
      toast({ title: "Note Created", description: "Your note has been saved successfully." });
    }
  });

  const resetNoteForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('family');
    setNoteTags('');
    setNotePriority('medium');
    setIsShared(false);
  };

  const handleCreateNote = () => {
    if (!noteTitle || !noteContent) return;
    
    createNoteMutation.mutate({
      title: noteTitle,
      content: noteContent,
      category: noteCategory,
      tags: noteTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      priority: notePriority,
      isShared,
      createdBy: 'You'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'family': return 'bg-blue-100 text-blue-800';
      case 'work': return 'bg-purple-100 text-purple-800';
      case 'health': return 'bg-green-100 text-green-800';
      case 'finance': return 'bg-yellow-100 text-yellow-800';
      case 'ideas': return 'bg-pink-100 text-pink-800';
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

  // Filter notes based on search and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteNotes = notes.filter(note => note.isFavorite);
  const sharedNotes = notes.filter(note => note.isShared);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">NexusNotes</h1>
            <p className="text-gray-600">Smart note-taking and family knowledge management</p>
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
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
                  <p className="text-gray-600">Total Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{favoriteNotes.length}</p>
                  <p className="text-gray-600">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{sharedNotes.length}</p>
                  <p className="text-gray-600">Shared</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notes.slice(0, 3).length}</p>
                  <p className="text-gray-600">Recent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notes, tags, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="ideas">Ideas</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
                <DialogDescription>Add a new note to your family knowledge base</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Title</Label>
                  <Input
                    id="note-title"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter note title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea
                    id="note-content"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your note content here..."
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={noteCategory} onValueChange={(value: 'personal' | 'family' | 'work' | 'health' | 'finance' | 'ideas') => setNoteCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="ideas">Ideas</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={notePriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNotePriority(value)}>
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
                <div className="space-y-2">
                  <Label htmlFor="note-tags">Tags (comma-separated)</Label>
                  <Input
                    id="note-tags"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="planning, vacation, family"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="share-note"
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="share-note">Share with family members</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateNote} disabled={createNoteMutation.isPending}>
                  {createNoteMutation.isPending ? 'Creating...' : 'Create Note'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {note.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    {note.isShared && <Users className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(note.category)}>
                    {note.category}
                  </Badge>
                  <Badge className={getPriorityColor(note.priority)}>
                    {note.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>By {note.createdBy}</span>
                  <span>{note.updatedAt}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first note to get started'
              }
            </p>
            <Button onClick={() => setShowNoteDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Note
            </Button>
          </div>
        )}

        {/* AI-Powered Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Smart Insights
            </CardTitle>
            <CardDescription>AI-powered analysis of your notes and knowledge patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Knowledge Graph</h3>
                <p className="text-sm text-gray-600">
                  Your notes are organized across multiple categories for easy retrieval
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <Tag className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Tag Analysis</h3>
                <p className="text-sm text-gray-600">
                  Effective use of tags helps maintain organized family knowledge
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Smart Suggestions</h3>
                <p className="text-sm text-gray-600">
                  Consider creating templates for recurring note types like planning
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}