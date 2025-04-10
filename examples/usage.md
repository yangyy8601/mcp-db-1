# MCP 数据库工具使用示例

以下是在 Cursor 中使用 MCP 数据库工具的一些常见场景和示例。

## 配置 Cursor MCP

首先，确保你已经在 Cursor 中配置了 MCP 服务。在项目根目录下创建 `.cursor/mcp.json` 文件：

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

## 使用示例

### 1. 查询数据库中的所有表

在 Agent 模式下，你可以直接询问：

```
查询我的 PostgreSQL 数据库中有哪些表
```

Agent 会使用 `getAllTables` 工具：

```json
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your-password",
    "database": "postgres"
  }
}
```

### 2. 创建新表

```
在我的数据库中创建一个用户表，包含 id、username、email 和 created_at 字段
```

Agent 会使用 `createTable` 工具：

```json
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your-password",
    "database": "postgres"
  },
  "tableName": "users",
  "columns": [
    {
      "name": "id",
      "type": "SERIAL",
      "primaryKey": true
    },
    {
      "name": "username",
      "type": "VARCHAR(50)",
      "nullable": false,
      "unique": true
    },
    {
      "name": "email",
      "type": "VARCHAR(100)",
      "nullable": false,
      "unique": true
    },
    {
      "name": "created_at",
      "type": "TIMESTAMP",
      "defaultValue": "CURRENT_TIMESTAMP"
    }
  ]
}
```

### 3. 查询表结构

```
查看用户表的结构
```

Agent 会使用 `getTableSchema` 工具：

```json
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your-password",
    "database": "postgres"
  },
  "tableName": "users"
}
```

### 4. 插入数据

```
向用户表中插入几条测试数据
```

Agent 会使用 `insertData` 工具：

```json
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your-password",
    "database": "postgres"
  },
  "tableName": "users",
  "data": [
    {
      "username": "user1",
      "email": "user1@example.com"
    },
    {
      "username": "user2",
      "email": "user2@example.com"
    }
  ]
}
```

### 5. 执行复杂查询

```
查询所有用户，按创建时间排序
```

Agent 会使用 `executeSQL` 工具：

```json
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your-password",
    "database": "postgres"
  },
  "sql": "SELECT * FROM users ORDER BY created_at DESC"
}
```

### 6. 更新数据

```
更新 ID 为 1 的用户的邮箱地址
```

Agent 会使用 `updateData` 工具：

```json
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your-password",
    "database": "postgres"
  },
  "tableName": "users",
  "data": {
    "email": "newemail@example.com"
  },
  "condition": "id = ?",
  "params": [1]
}
```

### 7. 删除数据

```
删除 username 为 'user2' 的用户
```

Agent 会使用 `deleteData` 工具：

```json
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your-password",
    "database": "postgres"
  },
  "tableName": "users",
  "condition": "username = ?",
  "params": ["user2"]
}
```

### 8. 执行批量 SQL 命令

```
执行一系列 SQL 命令创建订单系统表
```

Agent 会使用 `executeBatchSQL` 工具：

```json
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your-password",
    "database": "postgres"
  },
  "sqlStatements": [
    "CREATE TABLE customers (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL)",
    "CREATE TABLE orders (id SERIAL PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, total_amount DECIMAL(10,2) NOT NULL)",
    "CREATE TABLE order_items (id SERIAL PRIMARY KEY, order_id INTEGER REFERENCES orders(id), product_name VARCHAR(100) NOT NULL, quantity INTEGER NOT NULL, price DECIMAL(10,2) NOT NULL)"
  ]
}
```

### 9. 使用 SQLite 数据库

```
在 SQLite 数据库中创建一个简单的笔记表
```

Agent 会使用 `createTable` 工具，但针对 SQLite：

```json
{
  "connection": {
    "type": "sqlite",
    "file": "./notes.db"
  },
  "tableName": "notes",
  "columns": [
    {
      "name": "id",
      "type": "INTEGER",
      "primaryKey": true
    },
    {
      "name": "title",
      "type": "TEXT",
      "nullable": false
    },
    {
      "name": "content",
      "type": "TEXT"
    },
    {
      "name": "created_at",
      "type": "TIMESTAMP",
      "defaultValue": "CURRENT_TIMESTAMP"
    }
  ]
}
```

### 10. 使用 MySQL 数据库

```
连接 MySQL 数据库并列出所有表
```

Agent 会使用 `getAllTables` 工具，但针对 MySQL：

```json
{
  "connection": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "your-password",
    "database": "mysql"
  }
}
```

## 提示与技巧

1. 尽量使用具体的指令，例如"创建一个包含这些字段的用户表"，而不是"创建一个表"。

2. 如果需要连接到不同的数据库，请明确指定数据库类型和连接信息。

3. 对于复杂的查询或表结构，可以先在传统数据库工具中设计好，然后通过 Cursor 执行。

4. 使用 `executeBatchSQL` 工具可以执行多个相关的 SQL 语句，特别适合于设置复杂的数据库结构。 