import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  dbTools, 
  ExecuteSqlSchema, 
  GetAllTablesSchema, 
  GetTableSchemaSchema,
  ExecuteBatchSqlSchema,
  CreateTableSchema,
  InsertDataSchema,
  UpdateDataSchema,
  DeleteDataSchema
} from './commands/db-tools.js';

// 获取配置路径
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/default.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// 创建MCP服务器
const server = new McpServer({
  name: config.server.name,
  version: config.server.version
});

// 注册数据库操作工具
server.tool(
  'executeSQL',
  '执行SQL命令，支持PostgreSQL、MySQL和SQLite',
  ExecuteSqlSchema.shape,
  async (params) => {
    const result = await dbTools.executeSql(params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

server.tool(
  'getAllTables',
  '获取数据库中所有表的列表',
  GetAllTablesSchema.shape,
  async (params) => {
    const result = await dbTools.getAllTables(params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

server.tool(
  'getTableSchema',
  '获取数据库表的结构信息',
  GetTableSchemaSchema.shape,
  async (params) => {
    const result = await dbTools.getTableSchema(params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

server.tool(
  'executeBatchSQL',
  '执行多条SQL命令，事务性操作',
  ExecuteBatchSqlSchema.shape,
  async (params) => {
    const result = await dbTools.executeBatchSql(params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

server.tool(
  'createTable',
  '创建新的数据库表',
  CreateTableSchema.shape,
  async (params) => {
    const result = await dbTools.createTable(params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

server.tool(
  'insertData',
  '向表中插入数据',
  InsertDataSchema.shape,
  async (params) => {
    const result = await dbTools.insertData(params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

server.tool(
  'updateData',
  '更新表中的数据',
  UpdateDataSchema.shape,
  async (params) => {
    const result = await dbTools.updateData(params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

server.tool(
  'deleteData',
  '删除表中的数据',
  DeleteDataSchema.shape,
  async (params) => {
    const result = await dbTools.deleteData(params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

// 启动服务
async function startServer() {
  // 使用stdio传输方式
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log('MCP数据库服务已启动，stdio模式');
}

startServer().catch(console.error); 