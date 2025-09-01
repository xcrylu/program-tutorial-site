const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

// 用户注册
exports.register = async (userData) => {
  const { username, email, password } = userData;
  
  // 检查用户名和邮箱是否已存在
  const [existingUsers] = await pool.query(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, email]
  );
  
  if (existingUsers.length > 0) {
    const error = new Error();
    error.statusCode = 400;
    error.message = existingUsers[0].username === username 
      ? '用户名已存在' 
      : '邮箱已被注册';
    throw error;
  }
  
  // 密码加密
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // 创建用户（默认角色为普通用户）
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, 2)',
    [username, email, hashedPassword]
  );
  
  // 返回新创建的用户信息（不含密码）
  return this.findById(result.insertId);
};

// 用户登录
exports.login = async (credentials) => {
  const { identifier, password } = credentials; // identifier 可以是用户名或邮箱
  
  // 查找用户
  const [users] = await pool.query(
    'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = ? OR u.email = ?',
    [identifier, identifier]
  );
  
  if (users.length === 0) {
    const error = new Error('用户不存在');
    error.statusCode = 401;
    throw error;
  }
  
  const user = users[0];
  
  // 检查用户状态
  if (user.status !== 1) {
    const error = new Error('账号已被禁用');
    error.statusCode = 403;
    throw error;
  }
  
  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('密码错误');
    error.statusCode = 401;
    throw error;
  }
  
  // 生成JWT令牌
  const token = generateToken(user);
  
  // 返回用户信息和令牌（不含密码）
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  
  return {
    user: userWithoutPassword,
    token
  };
};

// 根据ID查找用户
exports.findById = async (id) => {
  const [users] = await pool.query(
    'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
    [id]
  );
  
  if (users.length === 0) return null;
  
  const user = users[0];
  delete user.password; // 移除密码
  return user;
};

// 根据用户名查找用户
exports.findByUsername = async (username) => {
  const [users] = await pool.query(
    'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = ?',
    [username]
  );
  
  if (users.length === 0) return null;
  
  const user = users[0];
  delete user.password; // 移除密码
  return user;
};

// 生成JWT令牌
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      role_name: user.role_name
    },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.expiresIn }
  );
}
