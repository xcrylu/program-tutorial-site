const mysql = require('mysql2/promise');
require('dotenv').config(); // 加载环境变量

// 创建数据库连接池（优化性能）
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // 最大连接数
  queueLimit: 0
});

// 测试数据库连接
async function testDBConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ 数据库连接成功！');
  } catch (err) {
    console.error('❌ 数据库连接失败：', err.message);
    process.exit(1); // 连接失败则退出程序
  }
}

// 导出连接池（供其他文件使用）
module.exports = { pool, testDBConnection };