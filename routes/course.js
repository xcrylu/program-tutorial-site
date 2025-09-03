const express = require('express');
const router = express.Router();
const courseModel = require('../models/courseModel');

// 课程详情页：/course/[课程别名]（如 /course/python）
router.get('/:alias', async (req, res) => {
  try {
    const course = await courseModel.getCourseByAlias(req.params.alias);
    if (!course) {
      return res.status(404).send('课程不存在');
    }
    // 渲染课程详情页，传递课程与章节数据
    res.render('course/course', {
      title: course.name + ' - 编程教程网',
      course
    });
  } catch (err) {
    res.status(500).send('服务器错误：' + err.message);
  }
});

// 课程详情页：/course/[课程别名]/[章节id]（如 /course/python/1）
router.get('/:alias/:chapter', async (req, res) => {
  try {
    const course = await courseModel.getCourseByAlias(req.params.alias);
    if (!course) {
      return res.status(404).send('课程不存在');
    }
    // 渲染课程详情页，传递课程与章节数据
    res.render('course', {
      title: course.name + ' - 编程教程网',
      course
    });
  } catch (err) {
    res.status(500).send('服务器错误：' + err.message);
  }
});

module.exports = router;