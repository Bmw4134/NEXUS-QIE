/**
 * NEXUS Trello Integration
 * Syncs boards, cards, and tasks with the platform
 */

export interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  url: string;
  lists: TrelloList[];
  members: TrelloMember[];
  lastActivity: Date;
}

export interface TrelloList {
  id: string;
  name: string;
  pos: number;
  cards: TrelloCard[];
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  due: Date | null;
  labels: TrelloLabel[];
  members: TrelloMember[];
  checklist: TrelloCheckItem[];
  url: string;
  lastActivity: Date;
}

export interface TrelloLabel {
  id: string;
  name: string;
  color: string;
}

export interface TrelloMember {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
}

export interface TrelloCheckItem {
  id: string;
  name: string;
  state: 'complete' | 'incomplete';
}

export interface TrelloSyncMetrics {
  totalBoards: number;
  totalCards: number;
  completedTasks: number;
  pendingTasks: number;
  lastSync: Date;
  syncSuccess: boolean;
}

export class TrelloIntegration {
  private apiKey: string | null = null;
  private token: string | null = null;
  private boards: Map<string, TrelloBoard> = new Map();
  private isConnected = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    // Check for Trello credentials
    this.apiKey = process.env.TRELLO_API_KEY || null;
    this.token = process.env.TRELLO_TOKEN || null;
    
    if (this.apiKey && this.token) {
      this.isConnected = true;
      this.startAutoSync();
      console.log('✅ Trello integration initialized');
    } else {
      console.log('⚠️ Trello credentials not found - integration disabled');
    }
  }

  private startAutoSync() {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncAllBoards();
    }, 5 * 60 * 1000);
  }

  async syncAllBoards(): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const response = await fetch(
        `https://api.trello.com/1/members/me/boards?key=${this.apiKey}&token=${this.token}&lists=open&cards=open&card_members=true&card_labels=true`
      );

      if (!response.ok) {
        throw new Error(`Trello API error: ${response.status}`);
      }

      const boardsData = await response.json();
      
      for (const boardData of boardsData) {
        const board = await this.processBoardData(boardData);
        this.boards.set(board.id, board);
      }

      console.log(`🔄 Synced ${boardsData.length} Trello boards`);
      return true;
    } catch (error) {
      console.error('Error syncing Trello boards:', error);
      return false;
    }
  }

  private async processBoardData(boardData: any): Promise<TrelloBoard> {
    const board: TrelloBoard = {
      id: boardData.id,
      name: boardData.name,
      desc: boardData.desc || '',
      url: boardData.url,
      lists: [],
      members: boardData.members || [],
      lastActivity: new Date(boardData.dateLastActivity)
    };

    // Process lists and cards
    if (boardData.lists) {
      for (const listData of boardData.lists) {
        const list: TrelloList = {
          id: listData.id,
          name: listData.name,
          pos: listData.pos,
          cards: []
        };

        if (listData.cards) {
          for (const cardData of listData.cards) {
            const card: TrelloCard = {
              id: cardData.id,
              name: cardData.name,
              desc: cardData.desc || '',
              due: cardData.due ? new Date(cardData.due) : null,
              labels: cardData.labels || [],
              members: cardData.members || [],
              checklist: [],
              url: cardData.url,
              lastActivity: new Date(cardData.dateLastActivity)
            };
            list.cards.push(card);
          }
        }
        board.lists.push(list);
      }
    }

    return board;
  }

  async createCard(boardId: string, listId: string, cardData: {
    name: string;
    desc?: string;
    due?: Date;
    labels?: string[];
  }): Promise<TrelloCard | null> {
    if (!this.isConnected) return null;

    try {
      const params = new URLSearchParams({
        key: this.apiKey!,
        token: this.token!,
        idList: listId,
        name: cardData.name,
        desc: cardData.desc || '',
      });

      if (cardData.due) {
        params.append('due', cardData.due.toISOString());
      }

      const response = await fetch('https://api.trello.com/1/cards', {
        method: 'POST',
        body: params
      });

      if (!response.ok) {
        throw new Error(`Failed to create card: ${response.status}`);
      }

      const newCard = await response.json();
      
      // Refresh board data
      await this.syncAllBoards();
      
      return this.findCard(newCard.id);
    } catch (error) {
      console.error('Error creating Trello card:', error);
      return null;
    }
  }

  private findCard(cardId: string): TrelloCard | null {
    for (const board of this.boards.values()) {
      for (const list of board.lists) {
        const card = list.cards.find(c => c.id === cardId);
        if (card) return card;
      }
    }
    return null;
  }

  getBoards(): TrelloBoard[] {
    return Array.from(this.boards.values());
  }

  getBoard(boardId: string): TrelloBoard | undefined {
    return this.boards.get(boardId);
  }

  getSyncMetrics(): TrelloSyncMetrics {
    const allCards = this.getAllCards();
    const completedTasks = allCards.filter((card: TrelloCard) => 
      card.checklist.every((item: TrelloCheckItem) => item.state === 'complete')
    ).length;

    return {
      totalBoards: this.boards.size,
      totalCards: allCards.length,
      completedTasks,
      pendingTasks: allCards.length - completedTasks,
      lastSync: new Date(),
      syncSuccess: this.isConnected
    };
  }

  private getAllCards(): TrelloCard[] {
    const allCards: TrelloCard[] = [];
    const boardsArray = Array.from(this.boards.values());
    for (const board of boardsArray) {
      for (const list of board.lists) {
        allCards.push(...list.cards);
      }
    }
    return allCards;
  }

  isReady(): boolean {
    return this.isConnected;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      hasCredentials: !!(this.apiKey && this.token),
      boardCount: this.boards.size,
      lastSync: new Date()
    };
  }

  async shutdown() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    console.log('Trello integration shutdown complete');
  }
}

export const trelloIntegration = new TrelloIntegration();