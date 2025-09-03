const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// 所有管理路由都需要管理员权限
router.use(authenticate);
router.use(authorize('admin'));

// 管理首页/仪表盘
router.get('/', adminController.dashboard);

// 用户管理
router.get('/users', adminController.listUsers);
router.get('/users/create', adminController.createUserForm);
router.post('/users', adminController.createUser);
router.get('/users/:id/edit', adminController.editUserForm);
router.post('/users/:id', adminController.updateUser);
router.get('/users/:id/delete', adminController.deleteUser);

// 课程管理
router.get('/courses', adminController.listCourses);
router.get('/courses/create', adminController.createCourseForm);
router.post('/courses', adminController.createCourse);
router.get('/courses/:id/edit', adminController.editCourseForm);
router.post('/courses/:id', adminController.updateCourse);
router.get('/courses/:id/delete', adminController.deleteCourse);

// 章节管理
router.get('/chapters', adminController.listChapters);
router.get('/chapters/create', adminController.createChapterForm);
router.post('/chapters', adminController.createChapter);
router.get('/chapters/:id/edit', adminController.editChapterForm);
router.post('/chapters/:id', adminController.updateChapter);
router.get('/chapters/:id/delete', adminController.deleteChapter);

module.exports = router;
