const { pool } = require('../config/db');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const e = require('express');

// 管理首页/仪表盘
exports.dashboard = async (req, res) => {
    try {
        // 获取统计数据
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [courseCount] = await pool.query('SELECT COUNT(*) as count FROM course');
        const [chapterCount] = await pool.query('SELECT COUNT(*) as count FROM chapter');
        
        res.render('admin/dashboard', {
            title: '管理中心 - 仪表盘',
            userCount: userCount[0].count,
            courseCount: courseCount[0].count,
            chapterCount: chapterCount[0].count
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message
        });
    }
};

// 用户管理
exports.listUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.created_at DESC'
        );
        
        res.render('admin/users/list', {
            title: '管理中心 - 用户列表',
            users
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : null
        });
    }
};

exports.createUserForm = async (req, res) => {
    try {
        const [roles] = await pool.query('SELECT * FROM roles');
        
        res.render('admin/users/form', {
            title: '管理中心 - 创建用户',
            user: {},
            roles,
            errors: []
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : null
        });
    }
};

exports.createUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const [roles] = await pool.query('SELECT * FROM roles');
            return res.status(400).render('admin/users/form', {
                title: '管理中心 - 创建用户',
                user: req.body,
                roles,
                errors: errors.array(),
                errorsStack: process.env.NODE_ENV === 'development' ? error.stack : null
            });
        }
        
        const { username, email, password, role_id, status } = req.body;
        
        // 检查用户名和邮箱是否已存在
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUsers.length > 0) {
            const [roles] = await pool.query('SELECT * FROM roles');
            return res.status(400).render('admin/users/form', {
                title: '管理中心 - 创建用户',
                user: req.body,
                roles,
                errors: [{ msg: existingUsers[0].username === username ? '用户名已存在' : '邮箱已被注册' }]
            });
        }
        
        // 密码加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 创建用户
        await pool.query(
            'INSERT INTO users (username, email, password, role_id, status) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role_id, status || 1]
        );
        
        res.redirect('/admin/users?success=用户创建成功');
    } catch (error) {
        const [roles] = await pool.query('SELECT * FROM roles');
        res.status(500).render('admin/users/form', {
            title: '管理中心 - 创建用户',
            user: req.body,
            roles,
            errors: [{ msg: error.message }]
        });
    }
};

exports.editUserForm = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [req.params.id]
        );
        
        if (users.length === 0) {
            return res.status(404).render('error', {
                title: '用户不存在',
                message: '找不到指定的用户'
            });
        }
        
        const [roles] = await pool.query('SELECT * FROM roles');
        
        res.render('admin/users/form', {
            title: '管理中心 - 编辑用户',
            user: users[0],
            roles,
            errors: []
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const [roles] = await pool.query('SELECT * FROM roles');
            return res.status(400).render('admin/users/form', {
                title: '管理中心 - 编辑用户',
                user: req.body,
                roles,
                errors: errors.array()
            });
        }
        
        const { username, email, role_id, status, password } = req.body;
        const userId = req.params.id;
        
        // 检查用户名和邮箱是否已被其他用户使用
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, userId]
        );
        
        if (existingUsers.length > 0) {
            const [roles] = await pool.query('SELECT * FROM roles');
            return res.status(400).render('admin/users/form', {
                title: '管理中心 - 编辑用户',
                user: req.body,
                roles,
                errors: [{ msg: existingUsers[0].username === username ? '用户名已存在' : '邮箱已被注册' }]
            });
        }
        
        // 准备更新数据
        let updateData = [username, email, role_id, status || 1, userId];
        let query = 'UPDATE users SET username = ?, email = ?, role_id = ?, status = ? WHERE id = ?';
        
        // 如果提供了新密码，则更新密码
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query = 'UPDATE users SET username = ?, email = ?, password = ?, role_id = ?, status = ? WHERE id = ?';
            updateData = [username, email, hashedPassword, role_id, status || 1, userId];
        }
        
        await pool.query(query, updateData);
        
        res.redirect('/admin/users?success=用户更新成功');
    } catch (error) {
        const [roles] = await pool.query('SELECT * FROM roles');
        res.status(500).render('admin/users/form', {
            title: '管理中心 - 编辑用户',
            user: req.body,
            roles,
            errors: [{ msg: error.message }]
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // 防止删除自己
        if (req.params.id == req.user.id) {
            return res.redirect('/admin/users?error=不能删除当前登录的管理员账号');
        }
        
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.redirect('/admin/users?success=用户已删除');
    } catch (error) {
        res.redirect('/admin/users?error=' + encodeURIComponent(error.message));
    }
};

// 课程管理
exports.listCourses = async (req, res) => {
    try {
        const [courses] = await pool.query('SELECT * FROM course ORDER BY create_time DESC');
        
        res.render('admin/courses/list', {
            title: '管理中心 - 课程列表',
            courses
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message
        });
    }
};

exports.createCourseForm = async (req, res) => {
    try {
        res.render('admin/courses/form', {
            title: '管理中心 - 创建课程',
            course: {},
            errors: []
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : null 
        });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('admin/courses/form', {
                title: '管理中心 - 创建课程',
                course: req.body,
                errors: errors.array()
            });
        }
        
        const { name, alias, description, cover } = req.body;
        
        // 检查课程别名是否已存在
        const [existingCourses] = await pool.query(
            'SELECT * FROM course WHERE alias = ?',
            [alias]
        );
        
        if (existingCourses.length > 0) {
            return res.status(400).render('admin/courses/form', {
                title: '管理中心 - 创建课程',
                course: req.body,
                errors: [{ msg: '课程别名已存在' }]
            });
        }
        
        // 创建课程
        await pool.query(
            'INSERT INTO course (name, alias, description, cover) VALUES (?, ?, ?, ?)',
            [name, alias, description, cover || 'default-cover.jpg']
        );
        
        res.redirect('/admin/courses?success=课程创建成功');
    } catch (error) {
        res.status(500).render('admin/courses/form', {
            title: '管理中心 - 创建课程',
            course: req.body,
            errors: [{ msg: error.message }]
        });
    }
};

exports.editCourseForm = async (req, res) => {
    try {
        const [courses] = await pool.query(
            'SELECT * FROM course WHERE id = ?',
            [req.params.id]
        );
        
        if (courses.length === 0) {
            return res.status(404).render('error', {
                title: '课程不存在',
                message: '找不到指定的课程'
            });
        }
        
        res.render('admin/courses/form', {
            title: '管理中心 - 编辑课程',
            course: courses[0],
            errors: []
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message
        });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('admin/courses/form', {
                title: '管理中心 - 编辑课程',
                course: req.body,
                errors: errors.array()
            });
        }
        
        const { name, alias, description, cover } = req.body;
        const courseId = req.params.id;
        
        // 检查课程别名是否已被其他课程使用
        const [existingCourses] = await pool.query(
            'SELECT * FROM course WHERE alias = ? AND id != ?',
            [alias, courseId]
        );
        
        if (existingCourses.length > 0) {
            return res.status(400).render('admin/courses/form', {
                title: '管理中心 - 编辑课程',
                course: req.body,
                errors: [{ msg: '课程别名已存在' }]
            });
        }
        
        // 更新课程
        await pool.query(
            'UPDATE course SET name = ?, alias = ?, description = ?, cover = ? WHERE id = ?',
            [name, alias, description, cover || 'default-cover.jpg', courseId]
        );
        
        res.redirect('/admin/courses?success=课程更新成功');
    } catch (error) {
        res.status(500).render('admin/courses/form', {
            title: '管理中心 - 编辑课程',
            course: req.body,
            errors: [{ msg: error.message }]
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        await pool.query('DELETE FROM course WHERE id = ?', [req.params.id]);
        res.redirect('/admin/courses?success=课程已删除');
    } catch (error) {
        res.redirect('/admin/courses?error=' + encodeURIComponent(error.message));
    }
};

// 章节管理
exports.listChapters = async (req, res) => {
    try {
        const [chapters] = await pool.query(
            'SELECT c.*, co.name as course_name FROM chapter c JOIN course co ON c.course_id = co.id ORDER BY co.id, c.sort'
        );
        
        res.render('admin/chapters/list', {
            title: '管理中心 - 章节列表',
            chapters
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message
        });
    }
};

exports.createChapterForm = async (req, res) => {
    try {
        const [courses] = await pool.query('SELECT * FROM course');
        
        res.render('admin/chapters/form', {
            title: '管理中心 - 创建章节',
            chapter: {
                course_id: req.query.course_id || ''
            },
            courses,
            errors: []
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : null 
        });
    }
};

exports.createChapter = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const [courses] = await pool.query('SELECT * FROM course');
            return res.status(400).render('admin/chapters/form', {
                title: '管理中心 - 创建章节',
                chapter: req.body,
                courses,
                errors: errors.array()
            });
        }
        
        const { course_id, title, sort } = req.body;
        
        // 创建章节
        await pool.query(
            'INSERT INTO chapter (course_id, title, sort) VALUES (?, ?, ?)',
            [course_id, title, sort || 0]
        );
        
        // 创建对应的内容记录
        const [result] = await pool.query('SELECT LAST_INSERT_ID() as id');
        const chapterId = result[0].id;
        
        await pool.query(
            'INSERT INTO content (chapter_id, content) VALUES (?, ?)',
            [chapterId, '请编辑章节内容...']
        );
        
        res.redirect('/admin/chapters?success=章节创建成功');
    } catch (error) {
        const [courses] = await pool.query('SELECT * FROM course');
        res.status(500).render('admin/chapters/form', {
            title: '管理中心 - 创建章节',
            chapter: req.body,
            courses,
            errors: [{ msg: error.message }]
        });
    }
};

exports.editChapterForm = async (req, res) => {
    try {
        const [chapters] = await pool.query(
            'SELECT c.*, co.content FROM chapter c JOIN content co ON c.id = co.chapter_id WHERE c.id = ?',
            [req.params.id]
        );
        
        if (chapters.length === 0) {
            return res.status(404).render('error', {
                title: '章节不存在',
                message: '找不到指定的章节'
            });
        }
        
        const [courses] = await pool.query('SELECT * FROM course');
        
        res.render('admin/chapters/form', {
            title: '管理中心 - 编辑章节',
            chapter: {
                ...chapters[0],
                content: chapters[0].content
            },
            courses,
            errors: []
        });
    } catch (error) {
        res.status(500).render('error', {
            title: '服务器错误',
            message: error.message
        });
    }
};

exports.updateChapter = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const [courses] = await pool.query('SELECT * FROM course');
            return res.status(400).render('admin/chapters/form', {
                title: '管理中心 - 编辑章节',
                chapter: req.body,
                courses,
                errors: errors.array()
            });
        }
        
        const { course_id, title, sort, content } = req.body;
        const chapterId = req.params.id;
        
        // 更新章节
        await pool.query(
            'UPDATE chapter SET course_id = ?, title = ?, sort = ? WHERE id = ?',
            [course_id, title, sort || 0, chapterId]
        );
        
        // 更新章节内容
        await pool.query(
            'UPDATE content SET content = ? WHERE chapter_id = ?',
            [content, chapterId]
        );
        
        res.redirect('/admin/chapters?success=章节更新成功');
    } catch (error) {
        const [courses] = await pool.query('SELECT * FROM course');
        res.status(500).render('admin/chapters/form', {
            title: '管理中心 - 编辑章节',
            chapter: req.body,
            courses,
            errors: [{ msg: error.message }]
        });
    }
};

exports.deleteChapter = async (req, res) => {
    try {
        await pool.query('DELETE FROM chapter WHERE id = ?', [req.params.id]);
        res.redirect('/admin/chapters?success=章节已删除');
    } catch (error) {
        res.redirect('/admin/chapters?error=' + encodeURIComponent(error.message));
    }
};
