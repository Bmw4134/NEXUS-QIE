import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, PieChart, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string;
}

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export function WealthPulse() {
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch financial data
  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ['/api/family/budgets'],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ['/api/family/expenses'],
  });

  const { data: cryptoAssets = [] } = useQuery<CryptoAsset[]>({
    queryKey: ['/api/crypto/assets'],
    refetchInterval: 10000
  });

  const { data: tradingPositions = [] } = useQuery({
    queryKey: ['/api/trading/positions'],
    refetchInterval: 5000
  });

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: { category: string; allocated: number; period: string }) => {
      const response = await fetch('/api/family/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData)
      });
      if (!response.ok) throw new Error('Failed to create budget');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/budgets'] });
      setShowBudgetDialog(false);
      resetBudgetForm();
      toast({ title: "Budget Created", description: "New budget category added successfully." });
    }
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: Partial<Expense>) => {
      const response = await fetch('/api/family/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (!response.ok) throw new Error('Failed to create expense');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/expenses'] });
      setShowExpenseDialog(false);
      resetExpenseForm();
      toast({ title: "Expense Recorded", description: "Expense added to your budget tracking." });
    }
  });

  const resetBudgetForm = () => {
    setBudgetCategory('');
    setBudgetAmount('');
  };

  const resetExpenseForm = () => {
    setExpenseDescription('');
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseDate('');
    setExpensePaidBy('');
  };

  const handleCreateBudget = () => {
    if (!budgetCategory || !budgetAmount) return;
    
    createBudgetMutation.mutate({
      category: budgetCategory,
      allocated: parseFloat(budgetAmount),
      period: 'monthly'
    });
  };

  const handleCreateExpense = () => {
    if (!expenseDescription || !expenseAmount || !expenseCategory || !expenseDate) return;
    
    createExpenseMutation.mutate({
      description: expenseDescription,
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      date: expenseDate,
      paidBy: expensePaidBy || 'Family'
    });
  };

  // Calculate financial metrics
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0);
  const recentExpenses = expenses.slice(0, 5);

  // Get top crypto performers
  const topCryptos = cryptoAssets
    .filter(asset => asset.change24h > 0)
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WealthPulse</h1>
            <p className="text-gray-600">Family financial management with live crypto trading integration</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
                  <p className="text-gray-600">Total Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
                  <p className="text-gray-600">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wallet className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">${totalRemaining.toLocaleString()}</p>
                  <p className="text-gray-600">Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tradingPositions.length}</p>
                  <p className="text-gray-600">Active Trades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Budget Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Budget Categories</CardTitle>
                <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Budget
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Budget Category</DialogTitle>
                      <DialogDescription>Set up a new budget category for family expenses</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget-category">Category Name</Label>
                        <Input
                          id="budget-category"
                          value={budgetCategory}
                          onChange={(e) => setBudgetCategory(e.target.value)}
                          placeholder="Groceries, Entertainment, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget-amount">Monthly Budget</Label>
                        <Input
                          id="budget-amount"
                          type="number"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          placeholder="500"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateBudget} disabled={createBudgetMutation.isPending}>
                        {createBudgetMutation.isPending ? 'Creating...' : 'Create Budget'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{budget.category}</span>
                      <span className="text-sm text-gray-600">
                        ${budget.spent} / ${budget.allocated}
                      </span>
                    </div>
                    <Progress 
                      value={(budget.spent / budget.allocated) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining: ${budget.remaining}</span>
                      <Badge variant={budget.remaining < budget.allocated * 0.2 ? "destructive" : "default"}>
                        {Math.round((budget.remaining / budget.allocated) * 100)}% left
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Expenses</CardTitle>
                <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Expense</DialogTitle>
                      <DialogDescription>Add a new family expense to track spending</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="expense-description">Description</Label>
                        <Input
                          id="expense-description"
                          value={expenseDescription}
                          onChange={(e) => setExpenseDescription(e.target.value)}
                          placeholder="Grocery shopping, Gas bill, etc."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expense-amount">Amount</Label>
                          <Input
                            id="expense-amount"
                            type="number"
                            step="0.01"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expense-date">Date</Label>
                          <Input
                            id="expense-date"
                            type="date"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Groceries">Groceries</SelectItem>
                              <SelectItem value="Utilities">Utilities</SelectItem>
                              <SelectItem value="Entertainment">Entertainment</SelectItem>
                              <SelectItem value="Transportation">Transportation</SelectItem>
                              <SelectItem value="Healthcare">Healthcare</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expense-paid-by">Paid By</Label>
                          <Input
                            id="expense-paid-by"
                            value={expensePaidBy}
                            onChange={(e) => setExpensePaidBy(e.target.value)}
                            placeholder="Mom, Dad, Family"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateExpense} disabled={createExpenseMutation.isPending}>
                        {createExpenseMutation.isPending ? 'Recording...' : 'Record Expense'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="font-semibold">{expense.description}</h3>
                        <p className="text-sm text-gray-600">{expense.date} • Paid by {expense.paidBy}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">-${expense.amount}</p>
                      <Badge variant="outline">{expense.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crypto Trading Integration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Live Crypto Market Integration
            </CardTitle>
            <CardDescription>Real-time cryptocurrency data integrated with family wealth management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topCryptos.map((crypto) => (
                <div key={crypto.symbol} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{crypto.symbol}</h3>
                      <p className="text-sm text-gray-600">{crypto.name}</p>
                    </div>
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">+{crypto.change24h.toFixed(2)}%</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">${crypto.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Vol: ${crypto.volume24h.toLocaleString()}</p>
                </div>
              ))}
            </div>
            
            {tradingPositions.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Active Trading Positions</h3>
                <div className="text-center text-gray-500">
                  <p>{tradingPositions.length} active cryptocurrency positions</p>
                  <p className="text-sm">Quantum trading algorithms monitoring market opportunities</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}