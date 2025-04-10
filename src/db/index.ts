import pg from 'pg';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { Database as SQLiteDatabase } from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取配置路径
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../../config/default.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// 数据库连接接口
export interface DbConnection {
  query(sql: string, params?: any[]): Promise<any>;
  close(): Promise<void>;
}

// PostgreSQL连接类
class PostgreSQLConnection implements DbConnection {
  private client: pg.Client;

  constructor(config: any) {
    this.client = new pg.Client(config);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const result = await this.client.query(sql, params);
    return result.rows;
  }

  async close(): Promise<void> {
    await this.client.end();
  }
}

// MySQL连接类
class MySQLConnection implements DbConnection {
  private connection: mysql.Connection;

  constructor(config: any) {
    this.connection = mysql.createPool(config);
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const [rows] = await this.connection.execute(sql, params);
    return rows;
  }

  async close(): Promise<void> {
    await this.connection.end();
  }
}

// SQLite连接类
class SQLiteConnection implements DbConnection {
  private db: SQLiteDatabase;

  constructor(config: any) {
    this.db = new sqlite3.Database(config.file);
  }

  query(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      // 检查是否是SELECT查询
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      
      if (isSelect) {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes, lastID: this.lastID });
        });
      }
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// 数据库工厂类
export class DatabaseFactory {
  static async createConnection(type: string, customConfig?: any): Promise<DbConnection> {
    let dbConfig = customConfig;
    
    // 如果没有提供自定义配置，使用默认配置
    if (!dbConfig) {
      dbConfig = config.databases[type];
      if (!dbConfig) {
        throw new Error(`未找到 ${type} 数据库配置`);
      }
    }

    switch (type.toLowerCase()) {
      case 'postgresql':
      case 'postgres':
      case 'pg':
        const pgConnection = new PostgreSQLConnection(dbConfig);
        await pgConnection.connect();
        return pgConnection;
      
      case 'mysql':
        return new MySQLConnection(dbConfig);
      
      case 'sqlite':
      case 'sqlite3':
        return new SQLiteConnection(dbConfig);
      
      default:
        throw new Error(`不支持的数据库类型: ${type}`);
    }
  }
}

// 获取表结构信息的函数
export async function getTableSchema(connection: DbConnection, dbType: string, tableName: string): Promise<any[]> {
  let sql;
  
  switch (dbType.toLowerCase()) {
    case 'postgresql':
    case 'postgres':
    case 'pg':
      sql = `
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = $1
      `;
      return connection.query(sql, [tableName]);
    
    case 'mysql':
      sql = `
        SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type, 
               IS_NULLABLE as is_nullable, COLUMN_DEFAULT as column_default 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = ?
      `;
      return connection.query(sql, [tableName]);
    
    case 'sqlite':
    case 'sqlite3':
      sql = `PRAGMA table_info(${tableName})`;
      return connection.query(sql);
    
    default:
      throw new Error(`不支持的数据库类型: ${dbType}`);
  }
}

// 获取数据库所有表
export async function getAllTables(connection: DbConnection, dbType: string): Promise<any[]> {
  let sql;
  
  switch (dbType.toLowerCase()) {
    case 'postgresql':
    case 'postgres':
    case 'pg':
      sql = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      return connection.query(sql);
    
    case 'mysql':
      sql = `
        SELECT TABLE_NAME as table_name 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
      `;
      return connection.query(sql);
    
    case 'sqlite':
    case 'sqlite3':
      sql = `SELECT name as table_name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`;
      return connection.query(sql);
    
    default:
      throw new Error(`不支持的数据库类型: ${dbType}`);
  }
} 