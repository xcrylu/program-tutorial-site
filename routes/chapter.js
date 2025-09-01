const express = require('express');
const router = express.Router();
const chapterModel = require('../models/chapterModel');
const courseModel = require('../models/courseModel');

// 章节内容页：/chapter/[章节ID]（如 /chapter/1）
router.get('/:id', async (req, res) => {
  try {
    const chapter = await chapterModel.getChapterById(req.params.id);
    if (!chapter) {
      return res.status(404).send('章节不存在');
    }
    // 获取章节所属的课程（用于导航栏显示课程名）
    const [course] = await pool.query('SELECT name, alias FROM course WHERE id = ?', [chapter.course_id]);
    
    // 渲染章节内容页，传递章节、课程数据
    res.render('chapter', {
      title: chapter.title + ' - 编程教程网',
      chapter,
      course: course[0]
    });
  } catch (err) {
    res.status(500).send('服务器错误：' + err.message);
  }
});

module.exports = router;