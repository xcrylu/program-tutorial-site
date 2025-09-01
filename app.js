const express = require('express');
const path = require('path');
require('dotenv').config();
const { testDBConnection } = require('./config/db');

// 导入路由
const indexRouter = require('./routes/index');
const courseRouter = require('./routes/course');
const chapterRouter = require('./routes/chapter');

// 初始化 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 1. 配置模板引擎（EJS）
const expressLayouts = require('express-ejs-layouts');
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views')); // 模板文件路径

app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// 2. 配置静态资源（CSS/JS/图片）
app.use(express.static(path.join(__dirname, 'public')));

// 3. 挂载路由
app.use('/', indexRouter); // 首页路由
app.use('/course', courseRouter); // 课程路由
app.use('/chapter', chapterRouter); // 章节路由

// 4. 测试数据库连接并启动服务器
async function startServer() {
  await testDBConnection(); // 先验证数据库连接
  app.listen(PORT, () => {
    console.log(`🚀 服务器已启动：http://localhost:${PORT}`);
  });
}

// 启动服务器
startServer();