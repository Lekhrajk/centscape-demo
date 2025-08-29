import * as SQLite from 'expo-sqlite';

import { WishlistItem, DatabaseSchema } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly dbName = 'wishlist.db';
  private readonly currentVersion = 2;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(this.dbName);
      await this.createTables();
      await this.migrateIfNeeded();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY
      );
      
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        image TEXT,
        price TEXT,
        currency TEXT,
        siteName TEXT,
        sourceUrl TEXT NOT NULL,
        normalizedUrl TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_normalized_url ON wishlist_items(normalizedUrl);
      CREATE INDEX IF NOT EXISTS idx_created_at ON wishlist_items(createdAt);
    `);
  }

  private async migrateIfNeeded(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Get current version
    const versionResult = await this.db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_version LIMIT 1'
    );
    
    const currentDbVersion = versionResult?.version || 0;

    if (currentDbVersion < this.currentVersion) {
      console.log(`Migrating database from v${currentDbVersion} to v${this.currentVersion}`);
      
      if (currentDbVersion === 0) {
        // Initial migration
        await this.migrateToV1();
      }
      
      if (currentDbVersion <= 1) {
        // Add normalizedUrl field
        await this.migrateToV2();
      }

      // Update schema version
      await this.db.runAsync(
        'INSERT OR REPLACE INTO schema_version (version) VALUES (?)',
        [this.currentVersion]
      );
      
      console.log('Database migration completed');
    }
  }

  private async migrateToV1(): Promise<void> {
    // This would be the initial migration if needed
    // For now, we're starting with v2
  }

  private async migrateToV2(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if normalizedUrl column exists
    const tableInfo = await this.db.getAllAsync(
      "PRAGMA table_info(wishlist_items)"
    );
    
    const hasNormalizedUrl = tableInfo.some((col: any) => col.name === 'normalizedUrl');
    
    if (!hasNormalizedUrl) {
      // Add normalizedUrl column
      await this.db.runAsync(
        'ALTER TABLE wishlist_items ADD COLUMN normalizedUrl TEXT'
      );
      
      // Update existing records with normalized URLs
      const items = await this.db.getAllAsync<WishlistItem>(
        'SELECT * FROM wishlist_items WHERE normalizedUrl IS NULL'
      );
      
      for (const item of items) {
        const normalizedUrl = this.normalizeUrl(item.sourceUrl);
        await this.db.runAsync(
          'UPDATE wishlist_items SET normalizedUrl = ? WHERE id = ?',
          [normalizedUrl, item.id]
        );
      }
    }
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove UTM parameters
      const searchParams = new URLSearchParams(urlObj.search);
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      utmParams.forEach(param => searchParams.delete(param));
      
      // Remove fragments
      urlObj.hash = '';
      
      // Update search params
      urlObj.search = searchParams.toString();
      
      // Normalize hostname to lowercase
      urlObj.hostname = urlObj.hostname.toLowerCase();
      
      return urlObj.toString();
    } catch (error) {
      console.error('Failed to normalize URL:', url, error);
      return url;
    }
  }

  async addItem(item: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<WishlistItem> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();
    const normalizedUrl = this.normalizeUrl(item.sourceUrl);

    // Check for duplicates
    const existing = await this.db.getFirstAsync<WishlistItem>(
      'SELECT * FROM wishlist_items WHERE normalizedUrl = ?',
      [normalizedUrl]
    );

    if (existing) {
      throw new Error('Item already exists in wishlist');
    }

    const newItem: WishlistItem = {
      ...item,
      id,
      normalizedUrl,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.runAsync(
      `INSERT INTO wishlist_items (
        id, title, image, price, currency, siteName, sourceUrl, normalizedUrl, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newItem.id,
        newItem.title,
        newItem.image || null,
        newItem.price || null,
        newItem.currency || null,
        newItem.siteName || null,
        newItem.sourceUrl,
        newItem.normalizedUrl,
        newItem.createdAt,
        newItem.updatedAt,
      ]
    );

    return newItem;
  }

  async getItems(): Promise<WishlistItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const items = await this.db.getAllAsync<WishlistItem>(
      'SELECT * FROM wishlist_items ORDER BY createdAt DESC'
    );

    return items;
  }

  async deleteItem(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'DELETE FROM wishlist_items WHERE id = ?',
      [id]
    );
  }

  async updateItem(id: string, updates: Partial<WishlistItem>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = [...Object.values(updates), now, id];

    await this.db.runAsync(
      `UPDATE wishlist_items SET ${setClause}, updatedAt = ? WHERE id = ?`,
      values
    );
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM wishlist_items');
  }

  async exportData(): Promise<DatabaseSchema> {
    const items = await this.getItems();
    return {
      version: this.currentVersion,
      items,
    };
  }

  async importData(data: DatabaseSchema): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('BEGIN TRANSACTION');

    try {
      // Clear existing data
      await this.clearAll();

      // Import new data
      for (const item of data.items) {
        await this.addItem(item);
      }

      await this.db.runAsync('COMMIT');
    } catch (error) {
      await this.db.runAsync('ROLLBACK');
      throw error;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
