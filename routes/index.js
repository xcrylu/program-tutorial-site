const express = require('express');
const router = express.Router();
const courseModel = require('../models/courseModel');

// 首页：展示所有课程
router.get('/', async (req, res) => {
  try {
    const courses = await courseModel.getAllCourses();
    // 渲染首页模板，传递课程数据
    res.render('index', { 
      title: '编程教程网 - 首页', 
      courses 
    });
  } catch (err) {
    res.status(500).send('服务器错误：' + err.message);
  }
});

module.exports = router;