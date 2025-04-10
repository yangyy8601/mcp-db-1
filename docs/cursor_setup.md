# 在 Cursor 中设置 MCP 数据库服务

本文档将指导你如何在 Cursor 编辑器中配置和使用 MCP 数据库服务。

## 先决条件

1. 已安装 [Cursor 编辑器](https://cursor.sh/)
2. 已克隆并构建 MCP 数据库服务

## 步骤 1: 配置 Cursor MCP

有两种方式配置 MCP 服务:

### 方法 1: 项目级配置 (推荐)

这种方法仅在当前项目中启用 MCP 数据库服务:

1. 在项目根目录创建 `.cursor/mcp.json` 文件:

```json
{
  "mcpServers": {
    "mcp-db-service": {
      "command": "node",
      "args": ["path/to/mcp-db-service/dist/index.js"]
    }
  }
}
```

将 `path/to/mcp-db-service` 替换为 MCP 数据库服务的实际路径。

### 方法 2: 全局配置

这种方法在所有项目中启用 MCP 数据库服务:

1. 创建 `~/.cursor/mcp.json` 文件:

```json
{
  "mcpServers": {
    "mcp-db-service": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-db-service/dist/index.js"]
    }
  }
}
```

使用绝对路径以确保在任何项目中都能找到服务。

## 步骤 2: 自定义数据库配置

如果你需要自定义数据库连接配置，可以通过环境变量传递:

```json
{
  "mcpServers": {
    "mcp-db-service": {
      "command": "node",
      "args": ["path/to/mcp-db-service/dist/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_USER": "postgres",
        "DB_PASSWORD": "your-password",
        "DB_NAME": "postgres"
      }
    }
  }
}
```

或者，你可以直接修改 `config/default.json` 文件中的数据库配置。

## 步骤 3: 在 Cursor 中使用

1. 启动或重启 Cursor 编辑器
2. 打开 Agent 聊天功能 (通常使用 Cmd+G 或 Ctrl+G)
3. 尝试以下查询:

```
查询我的 PostgreSQL 数据库中有哪些表
```

Agent 应会使用 `getAllTables` 工具。确保在执行查询前，你已经有一个运行中的 PostgreSQL 数据库。

## 疑难解答

### 工具未出现在 Cursor 中

- 检查 Cursor 日志中是否有错误
- 确保 MCP 服务可以正常启动 (你可以手动运行 `node path/to/dist/index.js` 测试)
- 验证配置文件路径是否正确

### 连接数据库错误

- 确保数据库服务正在运行
- 验证数据库连接信息 (主机、端口、用户名、密码等)
- 检查防火墙设置是否允许连接

### 测试 MCP 服务

使用提供的测试脚本验证 MCP 服务是否正常:

```bash
npm test
```

这将执行 `examples/quick-test.js` 脚本，运行基本的数据库操作测试。 