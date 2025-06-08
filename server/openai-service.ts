import OpenAI from 'openai';

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateFamilyInsights(familyData: {
    tasks: any[];
    events: any[];
    expenses: any[];
    budgets: any[];
    notes: any[];
  }) {
    try {
      const prompt = `Analyze this family data and provide 3-5 actionable insights for better family management:
      
Tasks: ${JSON.stringify(familyData.tasks.slice(0, 10))}
Events: ${JSON.stringify(familyData.events.slice(0, 10))}
Expenses: ${JSON.stringify(familyData.expenses.slice(0, 10))}
Budgets: ${JSON.stringify(familyData.budgets.slice(0, 5))}
Notes: ${JSON.stringify(familyData.notes.slice(0, 5))}

Provide insights in this JSON format:
{
  "insights": [
    {
      "title": "Insight Title",
      "description": "Detailed description",
      "category": "financial|productivity|health|social",
      "priority": "high|medium|low",
      "actionable": true,
      "recommendation": "Specific action to take"
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a family management AI assistant that provides actionable insights based on family data patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
      return result.insights;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return [];
    }
  }

  async generateSmartRecommendations(context: string, userQuery: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful family management assistant. Provide practical, actionable advice for family coordination and planning.'
          },
          {
            role: 'user',
            content: `Context: ${context}\n\nQuestion: ${userQuery}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0].message.content || 'I apologize, but I could not generate a recommendation at this time.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'I apologize, but I could not generate a recommendation at this time.';
    }
  }

  async analyzeExpensePatterns(expenses: any[]) {
    try {
      const prompt = `Analyze these family expenses and identify spending patterns, potential savings, and budget optimization opportunities:

${JSON.stringify(expenses)}

Provide analysis in JSON format:
{
  "patterns": ["pattern1", "pattern2"],
  "savings_opportunities": ["opportunity1", "opportunity2"],
  "budget_recommendations": ["recommendation1", "recommendation2"],
  "total_analysis": "Overall spending summary"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analysis expert specializing in family budget optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('OpenAI expense analysis error:', error);
      return null;
    }
  }

  async generateTaskPriorities(tasks: any[], familyContext: any) {
    try {
      const prompt = `Given these family tasks and context, suggest optimal task prioritization and time management:

Tasks: ${JSON.stringify(tasks)}
Family Context: ${JSON.stringify(familyContext)}

Return JSON format:
{
  "priority_suggestions": [
    {
      "task_id": "id",
      "suggested_priority": "high|medium|low",
      "reasoning": "Why this priority",
      "estimated_time": "time estimate",
      "best_time_slot": "suggested time"
    }
  ],
  "scheduling_tips": ["tip1", "tip2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity expert specializing in family task management and time optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.4
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('OpenAI task priority error:', error);
      return null;
    }
  }

  async generateFamilyGoalSuggestions(familyData: any) {
    try {
      const prompt = `Based on this family's activity patterns, suggest 5 realistic and beneficial family goals:

Family Data: ${JSON.stringify(familyData)}

Return JSON format:
{
  "goals": [
    {
      "title": "Goal Title",
      "description": "Detailed description",
      "category": "health|financial|educational|social|personal",
      "timeframe": "short-term|medium-term|long-term",
      "difficulty": "easy|moderate|challenging",
      "benefits": ["benefit1", "benefit2"],
      "action_steps": ["step1", "step2", "step3"]
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a family development coach who helps families set and achieve meaningful goals together.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.6
      });

      const result = JSON.parse(response.choices[0].message.content || '{"goals": []}');
      return result.goals;
    } catch (error) {
      console.error('OpenAI goal generation error:', error);
      return [];
    }
  }
}

export const openaiService = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const familyAI = new OpenAIService();