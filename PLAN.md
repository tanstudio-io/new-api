# TanStudio - AI 中转站项目计划

## Context

基于开源项目 [new-api](https://github.com/QuantumNous/new-api)（AGPL-3.0）fork 二开，打造 TanStudio 品牌的 AI API 中转平台。采用开源商业模式——代码公开，靠服务盈利。

## 技术栈（继承 new-api）

| 层 | 选型 |
|---|---|
| 后端 | Go + Gin + GORM |
| 前端 | React + Semi Design + Vite |
| 数据库 | PostgreSQL（主推）/ SQLite / MySQL |
| 缓存 | Redis（可选） |
| 部署 | Docker / Docker Compose |

---

## 阶段一：Fork & 部署

**目标：** 把原版跑起来，团队熟悉项目结构

- [ ] Fork new-api 仓库到团队 GitHub 组织 ✅（已完成：https://github.com/tanstudio-io/new-api）
- [ ] Docker Compose 部署运行（本地或服务器）
- [ ] 创建测试渠道（接入至少一个供应商，如 OpenAI/DeepSeek）
- [ ] 完整走通一遍：注册 → 创建 Token → 调用 API → 查看用量
- [ ] 阅读核心代码：`relay/` 转发逻辑、`model/` 数据模型、`controller/` 请求处理

**关键文件：**
- `main.go` — 入口
- `router/` — 所有路由定义
- `relay/channel/` — 各供应商适配器
- `model/` — GORM 数据模型
- `web/default/` — 前端代码

---

## 阶段二：品牌定制

**目标：** TanStudio 品牌化

- [ ] 替换 Logo、Favicon、站点标题
- [ ] 自定义配色方案（修改 Semi Design 主题变量）
- [ ] 修改页脚、关于页面、版权信息
- [ ] 自定义登录/注册页面
- [ ] 修改默认系统设置（站点名称、公告等）
- [ ] 配置自定义域名

**涉及目录：**
- `web/default/src/` — 前端组件和样式
- `web/default/public/` — 静态资源（Logo、Favicon）
- `setting/` — 后端默认配置

---

## 阶段三：内置对话前端

**目标：** 提供类 ChatGPT 的对话界面，用户可直接在平台上使用 AI

- [ ] 设计对话 UI（消息列表、输入框、模型选择）
- [ ] 对话管理（新建/删除/历史记录）
- [ ] 流式响应展示（SSE）
- [ ] Markdown 渲染 + 代码高亮
- [ ] 多模型切换
- [ ] 图片/文件上传支持（多模态模型）
- [ ] 对话使用的 token 实时扣费

**新增数据模型：**
- `conversations` — 对话记录
- `messages` — 消息记录

**技术要点：**
- 前端调用自身 API（`/v1/chat/completions`），复用已有的转发和计费逻辑
- 对话历史存储在数据库，支持跨设备同步
- 流式传输使用 SSE（Server-Sent Events）

---

## 阶段四：商业功能增强

**目标：** 完善商业运营所需功能

### 4.1 计费优化
- [ ] 自定义套餐（按次/按量/包月）
- [ ] 充值渠道对接（支付宝/微信支付）
- [ ] 消费明细导出
- [ ] 余额不足提醒

### 4.2 用户体验
- [ ] 邮箱验证 + 手机号登录
- [ ] 使用引导/新手教程
- [ ] API 文档页面（内置 Swagger 或自定义文档）
- [ ] 公告系统

### 4.3 运营工具
- [ ] 数据大盘（日活、收入、调用量趋势）
- [ ] 异常告警（渠道失败率、余额告警）
- [ ] 用户行为分析

---

## 阶段五：生产部署

- [ ] 服务器环境搭建
- [ ] PostgreSQL 生产配置
- [ ] Nginx 反向代理 + SSL 证书
- [ ] Docker Compose 生产编排
- [ ] 备份策略（数据库定时备份）
- [ ] 监控部署（Uptime Kuma 或类似工具）
- [ ] 域名备案（如果用国内服务器）

---

## 暂不做

- 分销系统（后期根据需求添加）
- 多级代理
- 移动端 App

---

## 验证方式

每个阶段完成后的验证：

1. **阶段一**：能通过 API 成功调用至少一个模型，后台能看到调用日志和计费
2. **阶段二**：打开网站看到 TanStudio 品牌，无 new-api 残留
3. **阶段三**：在网页上进行多轮对话，流式输出正常，token 正确扣费
4. **阶段四**：完成充值 → 使用 → 查看账单的完整商业闭环
5. **阶段五**：外网可访问，HTTPS 正常，压测通过
