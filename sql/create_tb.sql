-- Active: 1720224992966@@127.0.0.1@3306@tutorial_db
-- 1. 课程表（存储编程语言课程，如 Python、C 语言）
CREATE TABLE IF NOT EXISTS `course` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '课程名称（如 Python 教程）',
  `alias` VARCHAR(20) NOT NULL COMMENT '课程别名（如 python）',
  `description` VARCHAR(200) NOT NULL COMMENT '课程简介',
  `cover` VARCHAR(100) DEFAULT 'default-cover.jpg' COMMENT '课程封面图路径',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 章节表（存储课程的章节列表）
CREATE TABLE IF NOT EXISTS `chapter` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `course_id` INT NOT NULL COMMENT '关联课程ID',
  `title` VARCHAR(100) NOT NULL COMMENT '章节标题',
  `sort` INT DEFAULT 0 COMMENT '章节排序（数字越小越靠前）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE CASCADE
);

-- 3. 内容表（存储章节的具体教程内容）
CREATE TABLE IF NOT EXISTS `content` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `chapter_id` INT NOT NULL COMMENT '关联章节ID',
  `content` TEXT NOT NULL COMMENT '章节内容（支持HTML）',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON DELETE CASCADE
);

-- 插入测试数据：Python 教程
INSERT INTO `course` (`name`, `alias`, `description`) 
VALUES ('Python 基础教程', 'python', '从零开始学习 Python 编程，覆盖环境搭建、语法基础、实战案例');

-- 插入 Python 教程的章节
INSERT INTO `chapter` (`course_id`, `title`, `sort`) 
VALUES 
(1, 'Python 环境设置', 1),
(1, 'Python 基本语法', 2),
(1, 'Python 变量与数据类型', 3);

-- 插入章节内容（以「Python 环境设置」为例）
INSERT INTO `content` (`chapter_id`, `content`)  
VALUES (2, ' <h2>Python 环境设置</h2> 

<p>学习 Python 编程的第一步，是搭建稳定的开发环境。Python 作为解释型语言，核心依赖「Python 解释器」，搭配合适的编辑器即可完成开发。</p>

<h3>1. 下载 Python 解释器</h3>

<p>访问 
<a href="https://www.python.org/downloads/" target="_blank">Python 官网</a>
，根据操作系统选择对应版本（推荐 Python 3.10+）。</p>

<h3>2. Windows 系统安装步骤</h3>
<ol>  
    <li>双击安装包，<strong>必须勾选「Add Python 3.x to PATH」</strong>（配置环境变量）；</li>  
    <li>选择「Customize installation」，修改安装路径（建议无中文/空格，如 D:\Python312）；</li>  
    <li>点击「Install」等待完成，打开 CMD 输入 <code>python --version</code> 验证。</li>
</ol>

<h3>3. 常用编辑器推荐</h3>
<ul>  
    <li>VS Code：轻量可扩展，安装「Python」插件即可使用；</li>  
    <li>PyCharm：功能全面，社区版免费，适合项目开发；</li>  
    <li>IDLE：Python 自带编辑器，适合新手入门。</li>
</ul>');