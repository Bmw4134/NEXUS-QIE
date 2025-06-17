
export interface Goal {
  id: string;
  description: string;
  category: 'performance' | 'optimization' | 'feature' | 'bug_fix' | 'analysis';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export class GoalTracker {
  private goals: Map<string, Goal> = new Map();
  private completedGoals: Goal[] = [];

  logGoal(description: string, options?: Partial<Goal>): Goal {
    const goal: Goal = {
      id: this.generateId(),
      description,
      category: options?.category || 'analysis',
      priority: options?.priority || 'medium',
      status: 'pending',
      timestamp: new Date(),
      metadata: options?.metadata || {}
    };

    this.goals.set(goal.id, goal);
    console.log(`🎯 Goal logged: ${description}`);
    
    return goal;
  }

  updateGoalStatus(goalId: string, status: Goal['status']): void {
    const goal = this.goals.get(goalId);
    if (goal) {
      goal.status = status;
      
      if (status === 'completed') {
        goal.completedAt = new Date();
        this.completedGoals.push(goal);
        console.log(`✅ Goal completed: ${goal.description}`);
      } else if (status === 'failed') {
        console.log(`❌ Goal failed: ${goal.description}`);
      }
    }
  }

  getGoals(status?: Goal['status']): Goal[] {
    const allGoals = Array.from(this.goals.values());
    return status ? allGoals.filter(g => g.status === status) : allGoals;
  }

  getGoalStats(): {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    completionRate: number;
  } {
    const goals = this.getGoals();
    const total = goals.length;
    const pending = goals.filter(g => g.status === 'pending').length;
    const inProgress = goals.filter(g => g.status === 'in_progress').length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const failed = goals.filter(g => g.status === 'failed').length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      pending,
      inProgress,
      completed,
      failed,
      completionRate: Math.round(completionRate * 100) / 100
    };
  }

  private generateId(): string {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
