# MCP 数据库服务

这是一个基于 Model Context Protocol (MCP) 的数据库服务，能够让 Cursor 通过 MCP 工具连接和操作各种数据库（PostgreSQL、MySQL、SQLite）。

## 功能特点

- 支持多种数据库：PostgreSQL、MySQL 和 SQLite
- 提供全面的数据库操作工具
- 支持两种传输模式：stdio 和 SSE
- 可轻松集成到 Cursor 中，实现 AI 辅助数据库操作

## 支持的数据库操作

- 执行 SQL 查询
- 获取所有表列表
- 获取表结构
- 批量执行 SQL 语句
- 创建表
- 插入数据
- 更新数据
- 删除数据

## 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/mcp-db-service.git
cd mcp-db-service

# 安装依赖
npm install

# 构建项目
npm run build
```

## 配置

在 `config/default.json` 文件中配置数据库连接信息：

```json
{
  "server": {
    "name": "mcp-db-service",
    "version": "1.0.0"
  },
  "databases": {
    "postgresql": {
      "host": "localhost",
      "port": 5432,
      "user": "postgres",
      "password": "your-password",
      "database": "postgres"
    },
    "mysql": {
      "host": "localhost",
      "port": 3306,
      "user": "root",
      "password": "your-password",
      "database": "mysql"
    },
    "sqlite": {
      "file": "path/to/your/database.sqlite"
    }
  }
}
```

## 启动服务

### stdio 模式（推荐用于 Cursor）

```bash
npm start
```

### SSE 模式（用于远程访问）

```bash
npm start -- --sse 3000
```

## 在 Cursor 中配置 MCP 服务

1. 在 Cursor 中，创建或编辑 `.cursor/mcp.json` 文件：

```json
{
  "mcpServers": {
    "db-service": {
      "command": "node",
      "args": ["path/to/mcp-db-service/dist/index.js"]
    }
  }
}
```

2. 如果你想全局可用，可以在 `~/.cursor/mcp.json` 中配置。

## 使用示例

在 Cursor Agent 模式下，你可以通过以下方式使用数据库功能：

### 执行 SQL 查询

```
执行一个 SQL 查询查找所有用户
```

Agent 将使用 `executeSQL` 工具，执行类似以下的操作：

```javascript
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "password",
    "database": "mydb"
  },
  "sql": "SELECT * FROM users"
}
```

### 创建表

```
创建一个名为 products 的表，包含 id、name、price 和 description 字段
```

Agent 将使用 `createTable` 工具：

```javascript
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "password",
    "database": "mydb"
  },
  "tableName": "products",
  "columns": [
    {
      "name": "id",
      "type": "SERIAL",
      "primaryKey": true
    },
    {
      "name": "name",
      "type": "VARCHAR(100)",
      "nullable": false
    },
    {
      "name": "price",
      "type": "DECIMAL(10,2)",
      "nullable": false
    },
    {
      "name": "description",
      "type": "TEXT"
    }
  ]
}
```

### 插入数据

```
向 products 表中插入一些产品数据
```

Agent 将使用 `insertData` 工具：

```javascript
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "password",
    "database": "mydb"
  },
  "tableName": "products",
  "data": [
    {
      "name": "产品1",
      "price": 19.99,
      "description": "这是第一个产品"
    },
    {
      "name": "产品2",
      "price": 29.99,
      "description": "这是第二个产品"
    }
  ]
}
```

## 工具列表

| 工具名称 | 描述 |
|---------|------|
| executeSQL | 执行单条 SQL 命令 |
| executeBatchSQL | 批量执行多条 SQL 命令 |
| getAllTables | 获取数据库中所有表的列表 |
| getTableSchema | 获取指定表的结构信息 |
| createTable | 创建一个新表 |
| insertData | 向表中插入数据 |
| updateData | 更新表中的数据 |
| deleteData | 删除表中的数据 |

## 注意事项

- 确保数据库服务已运行并且可以访问
- 敏感信息（如密码）应妥善保存，不要提交到版本控制系统
- 在生产环境中，建议使用环境变量而不是配置文件来存储数据库凭证

## 故障排除

1. 如果连接数据库出错，检查:
   - 数据库服务是否运行
   - 主机名、端口、用户名和密码是否正确
   - 防火墙设置

2. 如果 MCP 工具未显示在 Cursor 中:
   - 检查 `.cursor/mcp.json` 配置
   - 确保服务已正确启动
   - 查看 Cursor 的日志

## 许可证

MIT 