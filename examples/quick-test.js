/**
 * 这是一个简单的测试脚本，用于验证MCP数据库服务是否正常工作
 * 
 * 使用方法：
 * 1. 启动MCP数据库服务: `npm start`
 * 2. 在另一个终端运行: `node examples/quick-test.js`
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // 初始化客户端
  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, '../dist/index.js')]
  });
  
  const client = new Client({
    name: 'mcp-db-client-test',
    version: '1.0.0'
  });
  
  try {
    console.log('连接到MCP数据库服务...');
    await client.connect(transport);
    
    // 获取所有工具信息
    console.log('检索可用工具...');
    const { tools } = await client.listTools();
    
    console.log('\n可用工具列表:');
    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}: ${tool.description}`);
    });
    
    // 执行测试SQL(使用SQLite内存数据库)
    console.log('\n测试SQLite数据库操作...');
    
    // 创建表
    console.log('创建测试表...');
    const createResult = await client.callTool({
      name: 'createTable',
      arguments: {
        connection: {
          type: 'sqlite',
          file: ':memory:'
        },
        tableName: 'test_users',
        columns: [
          {
            name: 'id',
            type: 'INTEGER',
            primaryKey: true
          },
          {
            name: 'name',
            type: 'TEXT',
            nullable: false
          },
          {
            name: 'email',
            type: 'TEXT',
            unique: true
          }
        ]
      }
    });
    
    console.log('创建表结果:', JSON.parse(createResult.content[0].text).success ? '成功' : '失败');
    
    // 插入数据
    console.log('插入测试数据...');
    const insertResult = await client.callTool({
      name: 'insertData',
      arguments: {
        connection: {
          type: 'sqlite',
          file: ':memory:'
        },
        tableName: 'test_users',
        data: [
          { name: '张三', email: 'zhangsan@example.com' },
          { name: '李四', email: 'lisi@example.com' }
        ]
      }
    });
    
    console.log('插入数据结果:', JSON.parse(insertResult.content[0].text).success ? '成功' : '失败');
    
    // 查询数据
    console.log('查询数据...');
    const queryResult = await client.callTool({
      name: 'executeSQL',
      arguments: {
        connection: {
          type: 'sqlite',
          file: ':memory:'
        },
        sql: 'SELECT * FROM test_users'
      }
    });
    
    const parsedResult = JSON.parse(queryResult.content[0].text);
    console.log('查询结果:', parsedResult.success ? '成功' : '失败');
    
    if (parsedResult.success) {
      console.log('数据:', parsedResult.result);
    }
    
    console.log('\n所有测试完成!');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    // 关闭连接
    await client.disconnect();
  }
}

main(); 