require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// 导入数据库连接测试函数
const { testDBConnection } = require('./config/db');

// 导入认证中间件
const {optionalAuthenticate } =require('./middleware/auth');

// 导入路由
const indexRouter = require('./routes/index');
const courseRouter = require('./routes/course');
const chapterRouter = require('./routes/chapter');
const authRouter = require('./routes/auth'); // 导入认证路由
const adminRouter = require('./routes/admin');// 导入管理路由

// 初始化 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 1. 设置视图模板引擎
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
// 保持原有的 view 配置
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. 配置静态资源（CSS/JS/图片）
app.use(express.static(path.join(__dirname, 'public')));



// 3. 配置中间件

app.use(cors()); // 处理跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: false })); // 解析表单数据
app.use(cookieParser()); // 解析Cookie
// app.use(require('morgan')('dev')); // 日志记录
app.use((req, res, next) => {
  res.locals.req = req;
  next();
});

// 4. 全局变量 - 检查用户是否登录
app.use((req, res, next) => {
  res.locals.user = null; // 默认未登录
  next();
});

// app.use((req, res, next) => {
//   res.locals.user = req.session && req.session.user ? req.session.user : null;
//   next();
// });
// 5. 挂载路由
app.use('/', indexRouter);
app.use('/course', optionalAuthenticate,courseRouter);
app.use('/chapter', chapterRouter);
app.use('/', optionalAuthenticate,authRouter); // 挂载认证路由
app.use('/admin', adminRouter);// 挂载管理路由

// 6. 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: '服务器错误',
        message: process.env.NODE_ENV === 'development' ? err.message : '服务器发生错误，请稍后再试',
        errorStack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
});
    

// 7. 测试数据库连接并启动服务器
async function startServer() {
  await testDBConnection();
  app.listen(PORT, () => {
    console.log(`🚀 服务器已启动：http://localhost:${PORT}`);
  });
}

// 8. 启动服务器
startServer();
