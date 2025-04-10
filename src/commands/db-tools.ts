import { z } from 'zod';
import { DatabaseFactory, getAllTables, getTableSchema } from '../db/index.js';

// 数据库连接参数Schema
export const ConnectionSchema = z.object({
  type: z.enum(['postgresql', 'postgres', 'pg', 'mysql', 'sqlite', 'sqlite3']),
  host: z.string().optional(),
  port: z.number().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
  file: z.string().optional(), // 仅用于SQLite
});

// 执行SQL命令Schema
export const ExecuteSqlSchema = z.object({
  connection: ConnectionSchema,
  sql: z.string(),
  params: z.array(z.any()).optional()
});

// 获取所有表Schema
export const GetAllTablesSchema = z.object({
  connection: ConnectionSchema
});

// 获取表结构Schema
export const GetTableSchemaSchema = z.object({
  connection: ConnectionSchema,
  tableName: z.string()
});

// 执行批量SQL命令Schema
export const ExecuteBatchSqlSchema = z.object({
  connection: ConnectionSchema,
  sqlStatements: z.array(z.string())
});

// 创建表Schema
export const CreateTableSchema = z.object({
  connection: ConnectionSchema,
  tableName: z.string(),
  columns: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      nullable: z.boolean().optional(),
      defaultValue: z.string().optional(),
      primaryKey: z.boolean().optional(),
      unique: z.boolean().optional(),
      foreignKey: z.object({
        table: z.string(),
        column: z.string()
      }).optional()
    })
  )
});

// 插入数据Schema
export const InsertDataSchema = z.object({
  connection: ConnectionSchema,
  tableName: z.string(),
  data: z.array(
    z.record(z.string(), z.any())
  )
});

// 更新数据Schema
export const UpdateDataSchema = z.object({
  connection: ConnectionSchema,
  tableName: z.string(),
  data: z.record(z.string(), z.any()),
  condition: z.string(),
  params: z.array(z.any()).optional()
});

// 删除数据Schema
export const DeleteDataSchema = z.object({
  connection: ConnectionSchema,
  tableName: z.string(),
  condition: z.string(),
  params: z.array(z.any()).optional()
});

// 构建创建表SQL
function buildCreateTableSql(dbType: string, tableName: string, columns: any[]): string {
  const columnDefinitions = columns.map(col => {
    let def = `${col.name} ${col.type}`;
    
    if (col.nullable === false) {
      def += ' NOT NULL';
    }
    
    if (col.defaultValue) {
      def += ` DEFAULT ${col.defaultValue}`;
    }
    
    if (col.primaryKey) {
      def += ' PRIMARY KEY';
    }
    
    if (col.unique) {
      def += ' UNIQUE';
    }
    
    return def;
  });
  
  const foreignKeys = columns
    .filter(col => col.foreignKey)
    .map(col => `FOREIGN KEY (${col.name}) REFERENCES ${col.foreignKey.table}(${col.foreignKey.column})`);
  
  return `CREATE TABLE ${tableName} (
    ${[...columnDefinitions, ...foreignKeys].join(',\n    ')}
  )`;
}

// 构建批量插入SQL
function buildInsertSql(tableName: string, data: any[]): { sql: string, values: any[] } {
  if (data.length === 0) {
    throw new Error('没有要插入的数据');
  }
  
  const columns = Object.keys(data[0]);
  const placeholders = [];
  const values = [];
  
  for (const row of data) {
    const rowPlaceholders = [];
    
    for (const col of columns) {
      values.push(row[col]);
      rowPlaceholders.push('?');
    }
    
    placeholders.push(`(${rowPlaceholders.join(', ')})`);
  }
  
  const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders.join(', ')}`;
  
  return { sql, values };
}

// 数据库工具实现
export const dbTools = {
  // 执行SQL命令
  async executeSql(params: z.infer<typeof ExecuteSqlSchema>) {
    try {
      const conn = await DatabaseFactory.createConnection(
        params.connection.type, 
        params.connection
      );
      
      try {
        const result = await conn.query(params.sql, params.params || []);
        return {
          success: true,
          result
        };
      } finally {
        await conn.close();
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 获取所有表
  async getAllTables(params: z.infer<typeof GetAllTablesSchema>) {
    try {
      const conn = await DatabaseFactory.createConnection(
        params.connection.type,
        params.connection
      );
      
      try {
        const tables = await getAllTables(conn, params.connection.type);
        return {
          success: true,
          tables
        };
      } finally {
        await conn.close();
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 获取表结构
  async getTableSchema(params: z.infer<typeof GetTableSchemaSchema>) {
    try {
      const conn = await DatabaseFactory.createConnection(
        params.connection.type,
        params.connection
      );
      
      try {
        const schema = await getTableSchema(conn, params.connection.type, params.tableName);
        return {
          success: true,
          schema
        };
      } finally {
        await conn.close();
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 执行批量SQL命令
  async executeBatchSql(params: z.infer<typeof ExecuteBatchSqlSchema>) {
    try {
      const conn = await DatabaseFactory.createConnection(
        params.connection.type,
        params.connection
      );
      
      try {
        const results = [];
        
        for (const sql of params.sqlStatements) {
          const result = await conn.query(sql);
          results.push(result);
        }
        
        return {
          success: true,
          results
        };
      } finally {
        await conn.close();
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 创建表
  async createTable(params: z.infer<typeof CreateTableSchema>) {
    try {
      const conn = await DatabaseFactory.createConnection(
        params.connection.type,
        params.connection
      );
      
      try {
        const sql = buildCreateTableSql(
          params.connection.type,
          params.tableName,
          params.columns
        );
        
        const result = await conn.query(sql);
        
        return {
          success: true,
          result,
          sql
        };
      } finally {
        await conn.close();
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 插入数据
  async insertData(params: z.infer<typeof InsertDataSchema>) {
    try {
      const conn = await DatabaseFactory.createConnection(
        params.connection.type,
        params.connection
      );
      
      try {
        const { sql, values } = buildInsertSql(params.tableName, params.data);
        const result = await conn.query(sql, values);
        
        return {
          success: true,
          result,
          rowCount: params.data.length
        };
      } finally {
        await conn.close();
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 更新数据
  async updateData(params: z.infer<typeof UpdateDataSchema>) {
    try {
      const conn = await DatabaseFactory.createConnection(
        params.connection.type,
        params.connection
      );
      
      try {
        const columns = Object.keys(params.data);
        const values = Object.values(params.data);
        
        const setClause = columns.map((col, i) => `${col} = ?`).join(', ');
        const sql = `UPDATE ${params.tableName} SET ${setClause} WHERE ${params.condition}`;
        
        const result = await conn.query(sql, [...values, ...(params.params || [])]);
        
        return {
          success: true,
          result
        };
      } finally {
        await conn.close();
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 删除数据
  async deleteData(params: z.infer<typeof DeleteDataSchema>) {
    try {
      const conn = await DatabaseFactory.createConnection(
        params.connection.type,
        params.connection
      );
      
      try {
        const sql = `DELETE FROM ${params.tableName} WHERE ${params.condition}`;
        const result = await conn.query(sql, params.params || []);
        
        return {
          success: true,
          result
        };
      } finally {
        await conn.close();
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}; 