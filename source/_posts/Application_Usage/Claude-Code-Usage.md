---
title: Claude Code Usage
date: 2026-07-10 11:59:35
tags:
---

# Claude Code 使用指南

---

## 目录

1. [安装与登录](#安装与登录)
2. [运行环境](#运行环境)
3. [基础使用](#基础使用)
4. [会话命令完整参考](#会话命令完整参考)
5. [CLI 命令行参数](#cli-命令行参数)
6. [CLAUDE.md — 持久化记忆](#claudemd--持久化记忆)
7. [Skills — 自定义技能](#skills--自定义技能)
8. [Subagents — 子代理](#subagents--子代理)
9. [Hooks — 生命周期钩子](#hooks--生命周期钩子)
10. [Workflows — 动态工作流](#workflows--动态工作流)
11. [权限模式](#权限模式)
12. [会话管理](#会话管理)
13. [MCP 服务器](#mcp-服务器)
14. [设置配置](#设置配置)
15. [最佳实践](#最佳实践)
16. [自动化与 CI/CD](#自动化与-cicd)

---

## 安装与配置

### 安装

**macOS / Linux / WSL：**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell：**
```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD：**
```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

### 配置

自定义`switch claude`命令

1. `cd /.zsh/functions && touch switch.zsh`

2. switch.zsh写入：

   ```shell
   export CLAUDE_DEEPSEEK_AUTH_TOKEN='...'
   export CLAUDE_GLM_AUTH_TOKEN='...'
   export CLAUDE_KIMI_AUTH_TOKEN=''
   export CLAUDE_QWEN_AUTH_TOKEN=''
   
   # Qwen/Bailian needs either a full Anthropic-compatible URL or a WorkspaceId.
   # Beijing example: https://${CLAUDE_QWEN_WORKSPACE_ID}.cn-beijing.maas.aliyuncs.com/apps/anthropic
   export CLAUDE_QWEN_BASE_URL="${CLAUDE_QWEN_BASE_URL:-}"
   export CLAUDE_QWEN_WORKSPACE_ID="${CLAUDE_QWEN_WORKSPACE_ID:-}"
   
   _claude_switch_state_file="$HOME/.claude-code-provider"
   
   _switch_claude_mask() {
     local value="$1"
   
     if [[ -z "$value" ]]; then
       printf '<empty>'
     elif (( ${#value} <= 8 )); then
       printf '***'
     else
       printf '%s...%s' "${value[1,4]}" "${value[-4,-1]}"
     fi
   }
   
   _switch_claude_apply() {
     local provider="${1#--}"
     local base_url token main_model opus_model sonnet_model haiku_model subagent_model effort compact_window tool_search key_name
   
     unset ENABLE_TOOL_SEARCH CLAUDE_CODE_AUTO_COMPACT_WINDOW
   
     case "$provider" in
       deepseek)
         base_url="https://api.deepseek.com/anthropic"
         token="$CLAUDE_DEEPSEEK_AUTH_TOKEN"
         key_name="CLAUDE_DEEPSEEK_AUTH_TOKEN"
         main_model="deepseek-v4-pro[1m]"
         opus_model="deepseek-v4-pro[1m]"
         sonnet_model="deepseek-v4-pro[1m]"
         haiku_model="deepseek-v4-flash"
         subagent_model="deepseek-v4-flash"
         effort="max"
         compact_window="1000000"
         ;;
       kimi)
         base_url="https://api.moonshot.cn/anthropic"
         token="$CLAUDE_KIMI_AUTH_TOKEN"
         key_name="CLAUDE_KIMI_AUTH_TOKEN"
         main_model="kimi-k2.7-code"
         opus_model="kimi-k2.7-code"
         sonnet_model="kimi-k2.7-code"
         haiku_model="kimi-k2.7-code"
         subagent_model="kimi-k2.7-code"
         tool_search="false"
         compact_window="262144"
         ;;
       glm|zai|z.ai)
         provider="glm"
         base_url="https://api.z.ai/api/anthropic"
         token="$CLAUDE_GLM_AUTH_TOKEN"
         key_name="CLAUDE_GLM_AUTH_TOKEN"
         main_model="glm-5.2[1m]"
         opus_model="glm-5.2[1m]"
         sonnet_model="glm-5.2[1m]"
         haiku_model="glm-5.1"
         subagent_model="glm-5.1"
         effort="max"
         compact_window="1000000"
         ;;
       qwen|aliyun|bailian)
         provider="qwen"
         if [[ -n "$CLAUDE_QWEN_BASE_URL" ]]; then
           base_url="$CLAUDE_QWEN_BASE_URL"
         elif [[ -n "$CLAUDE_QWEN_WORKSPACE_ID" ]]; then
           base_url="https://${CLAUDE_QWEN_WORKSPACE_ID}.cn-beijing.maas.aliyuncs.com/apps/anthropic"
         else
           echo "Qwen 需要先设置 CLAUDE_QWEN_WORKSPACE_ID 或 CLAUDE_QWEN_BASE_URL"
           return 1
         fi
         token="$CLAUDE_QWEN_AUTH_TOKEN"
         key_name="CLAUDE_QWEN_AUTH_TOKEN"
         main_model="qwen3.7-max"
         opus_model="qwen3.7-max"
         sonnet_model="qwen3.7-plus"
         haiku_model="qwen3.6-flash"
         subagent_model="qwen3.6-flash"
         effort="max"
         compact_window="1000000"
         ;;
       native|claude|anthropic|official)
         provider="native"
         unset ANTHROPIC_BASE_URL
         unset ANTHROPIC_AUTH_TOKEN
         unset ANTHROPIC_API_KEY
         unset ANTHROPIC_MODEL
         unset ANTHROPIC_DEFAULT_OPUS_MODEL
         unset ANTHROPIC_DEFAULT_SONNET_MODEL
         unset ANTHROPIC_DEFAULT_HAIKU_MODEL
         unset CLAUDE_CODE_SUBAGENT_MODEL
         unset CLAUDE_CODE_EFFORT_LEVEL
         unset ENABLE_TOOL_SEARCH
         unset CLAUDE_CODE_AUTO_COMPACT_WINDOW
         printf '%s\n' "$provider" >| "$_claude_switch_state_file"
         echo "Claude Code 已切换到原生 Claude 登录/订阅组"
         return 0
         ;;
       status)
         echo "provider: ${CLAUDE_CODE_PROVIDER:-unknown}"
         echo "base_url: ${ANTHROPIC_BASE_URL:-<native>}"
         echo "model: ${ANTHROPIC_MODEL:-<native default>}"
         echo "opus: ${ANTHROPIC_DEFAULT_OPUS_MODEL:-<native default>}"
         echo "sonnet: ${ANTHROPIC_DEFAULT_SONNET_MODEL:-<native default>}"
         echo "haiku: ${ANTHROPIC_DEFAULT_HAIKU_MODEL:-<native default>}"
         echo "subagent: ${CLAUDE_CODE_SUBAGENT_MODEL:-<native default>}"
         echo "token: $(_switch_claude_mask "${ANTHROPIC_AUTH_TOKEN:-${ANTHROPIC_API_KEY:-}}")"
         return 0
         ;;
       *)
         echo "用法: switch claude --deepseek|--kimi|--glm|--qwen|--native|--status"
         return 2
         ;;
     esac
   
     if [[ -z "$token" ]]; then
       echo "未设置 $key_name；请先在 ~/.zsh/functions/switch.zsh 里填入对应 API key，或在当前 shell 中 export $key_name=..."
       return 1
     fi
   
     export CLAUDE_CODE_PROVIDER="$provider"
     export ANTHROPIC_BASE_URL="$base_url"
     export ANTHROPIC_AUTH_TOKEN="$token"
     export ANTHROPIC_API_KEY="$token"
     export ANTHROPIC_MODEL="$main_model"
     export ANTHROPIC_DEFAULT_OPUS_MODEL="$opus_model"
     export ANTHROPIC_DEFAULT_SONNET_MODEL="$sonnet_model"
     export ANTHROPIC_DEFAULT_HAIKU_MODEL="$haiku_model"
     export CLAUDE_CODE_SUBAGENT_MODEL="$subagent_model"
     [[ -n "$effort" ]] && export CLAUDE_CODE_EFFORT_LEVEL="$effort"
     [[ -n "$tool_search" ]] && export ENABLE_TOOL_SEARCH="$tool_search"
     [[ -n "$compact_window" ]] && export CLAUDE_CODE_AUTO_COMPACT_WINDOW="$compact_window"
   
     printf '%s\n' "$provider" >| "$_claude_switch_state_file"
     echo "Claude Code 已切换到 $provider 组：$main_model"
   }
   
   switch() {
     if [[ "$1" != "claude" ]]; then
       echo "用法: switch claude --deepseek|--kimi|--glm|--qwen|--native|--status"
       return 2
     fi
   
     shift
     _switch_claude_apply "${1:-status}"
   }
   
   _claude_initial_provider="deepseek"
   if [[ -r "$_claude_switch_state_file" ]]; then
     _claude_initial_provider="$(<"$_claude_switch_state_file")"
   fi
   
   _switch_claude_apply "$_claude_initial_provider" >/dev/null 2>&1 || _switch_claude_apply deepseek >/dev/null 2>&1
   unset _claude_initial_provider
   ```

   3. .zshrc注册

      ```shell
      # >>> claude-code-model-switch >>>
      # Usage:
      #   switch claude --deepseek
      #   switch claude --kimi
      #   switch claude --glm
      #   switch claude --qwen
      #   switch claude --native
      #   switch claude --status
      source "$HOME/.zsh/functions/switch.zsh"
      # <<< claude-code-model-switch <<<
      ```

---

## 运行环境

Claude Code 可在 5 种环境中工作，共享同一底层引擎：

| 环境 | 适用场景 | 安装方式 |
|------|---------|---------|
| **终端 CLI** | 完整的命令行体验，直接编辑文件、运行命令 | `curl -fsSL https://claude.ai/install.sh \| bash` |
| **VS Code** | 内联 diff、@-提及、计划审查、对话历史 | 扩展商店搜索 "Claude Code" |
| **JetBrains** | IntelliJ IDEA / PyCharm / WebStorm 等 | JetBrains Marketplace 安装插件 |
| **桌面应用** | 独立 App，可视化 diff、多会话并行、定时任务 | [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect) / [Windows](https://claude.ai/api/desktop/win32/x64/setup/latest/redirect) |
| **Web 端** | 浏览器中使用，无需本地安装，支持 iOS App | [claude.ai/code](https://claude.ai/code) |

### 扩展集成

| 需求 | 方案 |
|------|------|
| 从手机继续本地会话 | [Remote Control](https://code.claude.com/docs/en/remote-control) |
| Telegram/Discord/iMessage/webhook 推送事件 | [Channels](https://code.claude.com/docs/en/channels) |
| 定时运行 Claude | [Routines](https://code.claude.com/docs/en/routines) 或桌面定时任务 |
| 自动化 PR 审查和 Issue 分类 | [GitHub Actions](https://code.claude.com/docs/en/github-actions) / [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) |
| 自动代码审查 | [GitHub Code Review](https://code.claude.com/docs/en/code-review) |
| 从 Slack 创建 Bug 修复 PR | [Slack 集成](https://code.claude.com/docs/en/slack) |
| 调试 Web 应用 | [Chrome 扩展](https://code.claude.com/docs/en/chrome) |
| 构建自定义 Agent | [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) |

---

## 基础使用

### 启动会话

```bash
# 在当前目录下启动交互式会话
claude

# 单次任务（非交互模式，执行后退出）
claude "修复构建错误"

# 一行查询（`-p` = print，输出后退出）
claude -p "解释这个项目的功能"

# 继续最近的会话
claude -c
claude --continue

# 从列表中选择恢复
claude -r
claude --resume

# 按名称恢复会话
claude --resume oauth-migration
```

### 七个核心快捷键

| 操作 | 快捷键/命令 |
|------|------------|
| 停止 Claude 当前动作 | `Esc` |
| 回退到之前的状态 | `Esc + Esc` 或 `/rewind` |
| 撤销修改 | "Undo that" |
| 清空上下文 | `/clear` |
| 压缩上下文 | `/compact` |
| 进入计划模式 | `Shift+Tab` |
| 退出 | `/exit` 或 `Ctrl+D` |

---

## 会话命令完整参考

以下是 Claude Code 中的所有会话内命令（在 claude 启动后使用）：

### 会话控制

| 命令 | 功能 |
|------|------|
| `/clear [name]` | 清空上下文开始新对话，旧对话保留在 `/resume` 中 |
| `/compact [instructions]` | 压缩对话历史，释放上下文空间 |
| `/context [all]` | 可视化当前上下文使用情况 |
| `/resume [session]` | 恢复之前的会话（支持 ID 或名称） |
| `/rename [name]` | 重命名当前会话 |
| `/branch [name]` | 创建当前对话的分支，尝试不同方案 |
| `/rewind` | 回退对话和/或代码到之前的状态 |
| `/btw <question>` | 问一个不影响上下文的侧边问题 |
| `/export [filename]` | 导出当前对话为纯文本 |

### 模型与推理

| 命令 | 功能 |
|------|------|
| `/model [model]` | 切换 AI 模型 |
| `/effort [level\|auto]` | 设置推理努力程度（low/medium/high/xhigh/max/ultracode） |
| `/fast [on\|off]` | 切换快速模式 |
| `/advisor [model\|off]` | 启用/禁用顾问模型 |

### 权限与安全

| 命令 | 功能 |
|------|------|
| `/permissions` | 管理工具权限的允许/询问/拒绝规则 |
| `/sandbox` | 切换沙盒模式 |
| `/login` | 登录 Anthropic 账户 |
| `/logout` | 退出登录 |

### IDE 与集成

| 命令 | 功能 |
|------|------|
| `/ide` | 管理 IDE 集成状态 |
| `/chrome` | 配置 Chrome 浏览器集成 |
| `/terminal-setup` | 配置终端快捷键 |
| `/add-dir <path>` | 添加额外的工作目录 |
| `/cd <path>` | 切换工作目录 |

### Skills

| 命令 | 功能 |
|------|------|
| `/init` | 为项目初始化 CLAUDE.md |
| `/code-review [level] [--fix] [--comment]` | 审查代码 diff（支持 low～ultra 级别） |
| `/simplify [target]` | 审查并应用代码简化（复用/效率/抽象层次） |
| `/debug [description]` | 启用调试日志并排查问题 |
| `/batch <instruction>` | 大规模并行修改（5-30 个独立子代理并行） |
| `/loop [interval] [prompt]` | 定时反复运行一个提示词 |
| `/run` | 启动并驱动应用以验证修改 |
| `/verify` | 端到端验证修改是否生效 |
| `/deep-research <question>` | 多源深度调研（Web 搜索 + 交叉验证 + 引用报告） |
| `/security-review` | 安全审查当前分支的修改 |
| `/claude-api [migrate\|managed-agents-onboard]` | Claude API 参考/迁移 |
| `/dataviz [request]` | 图表和数据可视化设计指导 |
| `/design-sync [hint]` | 同步 React 设计系统到 Claude Design |
| `/fewer-permission-prompts` | 自动生成权限白名单减少提示 |
| `/run-skill-generator` | 教 Claude 如何构建/启动/驱动你的项目 |
| `/recap` | 生成当前会话的一句话摘要 |

### 协作与远程

| 命令 | 功能 |
|------|------|
| `/remote-control` | 允许从 claude.ai 远程控制此会话 |
| `/teleport` | 将 Web 端会话拉取到本地终端 |
| `/desktop` | 将当前会话转移到桌面 App |
| `/mobile` | 显示下载移动 App 的二维码 |

### 会话监控

| 命令 | 功能 |
|------|------|
| `/tasks` | 查看所有后台运行的任务 |
| `/background [prompt]` | 将当前会话转为后台运行 |
| `/stop` | 停止后台会话 |
| `/fork <directive>` | 派生一个子代理到后台处理指定任务 |
| `/workflows` | 打开工作流进度视图 |
| `/agents` | 子代理管理提醒 |

### 信息与配置

| 命令 | 功能 |
|------|------|
| `/help` | 显示帮助和可用命令 |
| `/config [key=value]` | 打开设置界面或直接设置参数 |
| `/doctor` | 诊断 Claude Code 安装和配置 |
| `/memory` | 编辑 CLAUDE.md 和自动记忆 |
| `/skills` | 列出可用技能 |
| `/hooks` | 查看钩子配置 |
| `/status` | 显示版本、模型、账户、连接状态 |
| `/theme` | 切换颜色主题 |
| `/release-notes` | 查看版本更新日志 |
| `/cost` / `/usage` / `/stats` | 查看会话费用和使用统计 |
| `/feedback [report]` | 提交反馈或报告 Bug |
| `/plan [description]` | 直接进入计划模式 |
| `/goal [condition\|clear]` | 设置自动化目标，Claude 持续工作直到达成 |
| `/diff` | 打开交互式 diff 查看器 |
| `/plugin [subcommand]` | 管理插件 |
| `/mcp [reconnect\|enable\|disable]` | 管理 MCP 服务器连接 |
| `/focus` | 切换专注视图 |
| `/insights` | 生成会话分析报告 |

---

## CLI 命令行参数

```bash
# 交互模式
claude                          # 启动交互式会话

# 非交互模式
claude -p "prompt"              # 单次执行，输出后退出
claude -p "prompt" --output-format json      # JSON 输出
claude -p "prompt" --output-format stream-json  # 流式 JSON

# 会话管理
claude -c                       # 继续最近的会话
claude --continue               # 同上
claude -r                       # 从列表恢复会话
claude --resume <name>          # 按名称恢复
claude --from-pr <number>       # 恢复到关联某 PR 的会话
claude --fork-session           # 分叉当前会话

# 权限控制
claude --permission-mode plan   # 计划模式（只读浏览）
claude --permission-mode auto   # 自动模式（后台安全检查）
claude --permission-mode acceptEdits  # 自动批准文件编辑

# 并行与隔离
claude --worktree feature-auth  # 在独立 git worktree 中运行
claude -n auth-refactor         # 命名会话

# 管道输入
git log --oneline -20 | claude -p "总结最近的提交"
cat error.log | claude -p "分析这些错误"

# 其他
claude --debug                  # 调试模式
claude --verbose                # 详细输出
claude --add-dir ../shared     # 添加额外目录
claude --append-system-prompt "..."  # 追加系统提示词
```

---

## CLAUDE.md — 持久化记忆

CLAUDE.md 是 Claude Code 的持久化指令文件，每次会话启动时自动加载。

### 文件位置（按加载顺序）

| 作用域 | 位置 | 用途 |
|--------|------|------|
| **托管策略** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md` | IT/DevOps 统一管理的组织级指令 |
| **用户指令** | `~/.claude/CLAUDE.md` | 个人偏好，影响所有项目 |
| **项目指令** | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 团队共享，纳入版本控制 |
| **本地指令** | `./CLAUDE.local.md` | 个人私有项目偏好，加入 `.gitignore` |

### 编写原则

- **控制在 200 行以内**：太长会导致指令被忽略
- **具体而非笼统**：写「用 2 空格缩进」而非「格式化代码」
- **持续精减**：定期删除不再需要的规则
- **使用 `@path` 导入**：可引用其他文件

```markdown
# 构建与测试
- 使用 pnpm，不用 npm
- 提交前运行 `npm test`
- API 处理器放在 `src/api/handlers/`

# 代码风格
- 使用 ES modules 语法 (import/export)
- 解构导入 `import { foo } from 'bar'`

# 导入其他文件
@README.md  @package.json
- Git 工作流：@docs/git-instructions.md
- 个人偏好：@~/.claude/my-project-instructions.md
```

### `.claude/rules/` — 路径作用域规则

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API 开发规则
- 所有 API 端点必须包含输入验证
- 使用标准错误响应格式
- 包含 OpenAPI 文档注释
```

### AGENTS.md 兼容

```markdown
@AGENTS.md

# Claude Code 特有
- 使用计划模式处理 `src/billing/` 下的修改
```

### Auto Memory（自动记忆）

Claude 会自动保存构建命令、调试经验、架构笔记等。文件存储在：
```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # 索引文件（每次会话加载前 200 行）
├── debugging.md       # 调试模式笔记
└── api-conventions.md # API 设计决策
```

可通过 `/memory` 查看和编辑，或在设置中设置 `"autoMemoryEnabled": false` 禁用。

---

## Skills — 自定义技能

Skill 是扩展 Claude 能力的知识包，用 `SKILL.md` 文件定义。

### 创建 Skill

```
.claude/skills/api-conventions/SKILL.md
---
name: api-conventions
description: 我们服务的 REST API 设计约定
---

# API 约定
- URL 路径使用 kebab-case
- JSON 属性使用 camelCase
- 列表端点必须包含分页
- API 版本写在 URL 路径中 (/v1/, /v2/)
```

### 可调用 Skill

```markdown
---
name: fix-issue
description: 修复 GitHub Issue
disable-model-invocation: true
---
分析并修复 GitHub Issue：$ARGUMENTS。

1. 用 `gh issue view` 获取 Issue 详情
2. 理解问题描述
3. 搜索相关文件
4. 实现修复
5. 写测试验证
6. 确保 lint 通过
7. 创建描述性提交
8. 推送并创建 PR
```

使用：`/fix-issue 1234`

### Skill 位置

| 位置 | 作用域 |
|------|--------|
| `.claude/skills/` | 项目级（共享给团队） |
| `~/.claude/skills/` | 用户级（所有项目可用） |
| 插件中 | 命名空间隔离（如 `/my-plugin:review`） |

### 内置 Skills

Claude Code 自带大量内置 Skills：`/code-review`、`/batch`、`/debug`、`/loop`、`/run`、`/verify`、`/deep-research`、`/security-review`、`/simplify`、`/dataviz`、`/claude-api` 等。

---

## Subagents — 子代理

子代理在独立上下文中运行，适合需要读取大量文件的任务。

### 内置子代理

- **Explore**：只读搜索代理，适合广泛搜索文件/模式
- **Plan**：软件架构代理，设计实现计划
- **general-purpose**：通用代理，适合多步搜索和任务执行

### 创建自定义子代理

```
.claude/agents/security-reviewer.md
---
name: security-reviewer
description: 审查代码安全漏洞
tools: Read, Grep, Glob, Bash
model: opus
---

你是高级安全工程师。审查以下内容：
- 注入漏洞（SQL、XSS、命令注入）
- 认证和授权缺陷
- 代码中的密钥或凭据
- 不安全的数据处理

提供具体的行引用和建议修复方案。
```

使用：_"用子代理审查这段代码的安全问题"_

### 子代理 vs Skills vs Agent Teams

| 维度 | 子代理 | Skill | Agent Team |
|------|--------|-------|------------|
| **上下文** | 独立上下文窗口 | 加载到主会话 | 每个成员独立会话 |
| **通信** | 只报告结果回主代理 | 直接参与主对话 | 成员间可互相通信 |
| **最佳场景** | 读取大量文件、并行工作 | 可复用知识、可调用工作流 | 需要协作讨论的复杂任务 |

---

## Hooks — 生命周期钩子

Hooks 是 shell 命令，在 Claude Code 生命周期的特定节点自动执行。

### 支持的事件

| 事件 | 触发时机 |
|------|---------|
| `SessionStart` | 会话开始或恢复时 |
| `UserPromptSubmit` | 用户提交提示词时 |
| `PreToolUse` | 工具调用执行前（可阻止） |
| `PostToolUse` | 工具调用成功后 |
| `PostToolUseFailure` | 工具调用失败后 |
| `Notification` | Claude 发送通知时 |
| `Stop` | Claude 完成响应时 |
| `PreCompact` | 上下文压缩前 |
| `PostCompact` | 上下文压缩完成后 |
| `ConfigChange` | 配置文件更改时 |
| `CwdChanged` | 工作目录变化时 |
| `FileChanged` | 被监视的文件变化时 |
| `SubagentStart/Stop` | 子代理启动/停止时 |
| `PermissionRequest` | 权限弹窗出现时 |
| `SessionEnd` | 会话终止时 |

### Hook 示例

**桌面通知钩子：**
```json
{
  "hooks": {
    "Notification": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "osascript -e 'display notification \"Claude Code 需要你的关注\" with title \"Claude Code\"'"
      }]
    }]
  }
}
```

**自动格式化代码：**
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
      }]
    }]
  }
}
```

**阻止编辑敏感文件：**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/block-protected-files.sh"
      }]
    }]
  }
}
```

### Hook 返回码

| 退出码 | 含义 |
|--------|------|
| `0` | 无决定，正常权限流程 |
| `2` | 阻止操作，stderr 成为 Claude 的反馈 |
| 其他非零 | 非阻塞错误，stderr 被记录 |

---

## Workflows — 动态工作流

工作流是用 JavaScript 脚本编排大量子代理的机制，适合代码库级的大规模任务。

### 何时使用

| 场景 | 方案 |
|------|------|
| 代码库级 Bug 扫描 | Workflow |
| 500 个文件的迁移 | Workflow |
| 需要交叉验证的研究 | Workflow |
| 几个并发任务 | Subagent |
| 可重复的工作流知识 | Skill |

### 触发方式

```bash
# 方式一：在提示词中包含 "ultracode"
ultracode: 审查 src/routes/ 下所有 API 端点是否有缺失的认证检查

# 方式二：用自然语言
use a workflow to audit every route handler...

# 方式三：启用 Ultracode 模式（自动编排所有任务）
/effort ultracode
```

### 内置工作流

`/deep-research <question>` — 多源调研 + 交叉验证 + 引用报告

### 保存工作流

在 `/workflows` 视图中按 `s` 保存为可复用命令：
- `.claude/workflows/` → 项目级（团队共享）
- `~/.claude/workflows/` → 用户级（所有项目可用）

### 典型工作流模式

```javascript
export const meta = {
  name: 'audit-routes',
  description: '审计所有路由的认证检查',
}

// 发现文件
const found = await agent('列出 src/routes/ 下所有 .ts 文件', {
  schema: { /* ... */ },
})

// 并行审计（pipeline = 自动流水线）
const audits = await pipeline(found.files, file =>
  agent(`审计 ${file} 是否有缺失的认证检查`, { label: file }),
)

return audits.filter(Boolean)
```

---

## 权限模式

| 模式 | 无需询问的操作 | 适用场景 |
|------|---------------|---------|
| `default`（手动） | 仅读取 | 入门、敏感工作 |
| `acceptEdits` | 读取 + 文件编辑 + 常用文件系统命令 | 审阅代码时迭代 |
| `plan`（计划） | 仅读取 | 探索代码库后再修改 |
| `auto`（自动） | 全部，后台安全检查 | 长时间任务、减少疲劳 |
| `dontAsk` | 仅预批准的工具 | 锁定的 CI 和脚本 |
| `bypassPermissions` | 全部 | 隔离容器和 VM 专用 |

### 切换方式

```bash
# 命令行指定
claude --permission-mode plan
claude --permission-mode auto

# 会话中切换
Shift+Tab  # 切换计划模式
```

---

## 会话管理

### 核心操作

```bash
claude --continue           # 继续当前目录最近的会话
claude --resume             # 打开会话选择器
claude --resume oauth-fix   # 按名称恢复
/rename oauth-fix           # 命名当前会话
/branch try-new-approach    # 分支会话（尝试不同方案）
/clear                      # 清空上下文但保留会话
```

### 会话选择器快捷键

| 快捷键 | 功能 |
|--------|------|
| `↑/↓` | 导航 |
| `Enter` | 恢复选中会话 |
| `Ctrl+R` | 重命名 |
| `Ctrl+W` | 显示当前仓库所有 worktree |
| `Ctrl+A` | 显示所有项目 |
| `Ctrl+B` | 按 Git 分支过滤 |
| `Space` | 预览内容 |

### 上下文管理

- **`/clear`** — 任务不相关时重置上下文
- **`/compact [instructions]`** — 压缩历史但保留关键信息
- **`/context`** — 查看当前上下文消耗
- **`/btw`** — 侧边问答不占上下文
- **超过两次修正** → `/clear` 后用更好的提示词重新开始

---

## MCP 服务器

MCP（Model Context Protocol）让 Claude 连接外部服务：

```json
// .claude/mcp.json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-postgres", "postgresql://localhost/mydb"]
    }
  }
}
```

管理命令：`/mcp` — 查看、连接、启用/禁用 MCP 服务器

---

## 设置配置

### 配置作用域

| 作用域 | 位置 | 影响范围 |
|--------|------|---------|
| **Managed** | 服务端管理 / plist / 注册表 | 全组织 |
| **User** | `~/.claude/` | 个人所有项目 |
| **Project** | `.claude/` | 团队共享（可提交到 git） |
| **Local** | `.claude/settings.local.json` | 个人当前项目（不提交） |

### 常用设置

```bash
# 使用 /config 命令
/config theme=dark           # 切换暗色主题
/config model=sonnet          # 切换模型
/config thinking=false        # 关闭思考模式
/config verbose=true          # 详细输出

# 或直接编辑 settings.json
```

---

## 最佳实践

### 1. 给 Claude 验证手段

```
# 不好
"实现一个验证邮箱的函数"

# 好
"写一个 validateEmail 函数。测试用例：user@example.com → true，
invalid → false，user@.com → false。实现后运行测试"
```

### 2. 先探索，再计划，最后编码

1. **探索**：理解代码结构和依赖
2. **计划**：制定实现方案（使用 plan mode）
3. **编码**：实现修改
4. **验证**：运行测试、查看结果

### 3. 上下文管理铁律

- 任务之间用 `/clear` 重置
- 失败两次后清空重来
- 用子代理做调研，不污染主上下文
- CLAUDE.md 控制在 200 行以内

### 4. 高效提示词

- **精准定位**："在 `src/auth/` 中检查 token 刷新逻辑"
- **提供示例**："参考 HotDogWidget.php 的模式实现"
- **描述症状而非猜测**："登录超时后失败，检查 `src/auth/` 的 token 刷新"
- **使用 @ 引用文件**：直接拖入或 `@文件路径`

### 5. 子代理隔离调研

```
"用子代理调查认证系统如何处理 token 刷新"
```

### 6. 管道与非交互模式

```bash
# 管道
git log --oneline -20 | claude -p "总结最近的提交"

# 批量处理
for file in src/**/*.ts; do
  claude -p "审查 $file 的安全问题" --output-format json
done
```

### 7. 避开常见陷阱

| 问题 | 解决方法 |
|------|---------|
| **厨房水槽会话**（话题混杂） | `/clear` 后专注一个任务 |
| **反复纠正失效** | 两次失败后 `/clear` 重来 |
| **CLAUDE.md 臃肿** | 无情精简，转成 Hook 或 Skill |
| **未经验证的代码** | 始终提供测试或用 `/verify` |
| **无限探索** | 限定范围或用子代理 |

---

## 自动化与 CI/CD

### GitHub Actions

```yaml
- name: Claude Code Review
  uses: anthropics/claude-code-action@v1
  with:
    prompt: "审查这个 PR 的变更"
```

### 定时任务

```bash
# Routines（云端，关机也能运行）
# 在 claude.ai/code/routines 配置

# /loop（当前 CLI 会话内轮询）
/loop 5m check if the deploy finished

# 桌面定时任务
# 在 Desktop App 中配置 Scheduled Tasks
```

### 多会话并行

```bash
# 终端 1
claude --worktree feature-auth

# 终端 2
claude --worktree fix-login-bug

# 或使用 Agent Teams 自动协调
```

---

> 📚 **来源**：[Claude Code 官方文档](https://code.claude.com/docs/en/overview)
>
> 🔄 **版本**：基于 2026 年 7 月最新文档整理
>
> 💡 **获取帮助**：在 Claude Code 中输入 `/help`，或加入 [Discord 社区](https://www.anthropic.com/discord)
