const { pool } = require('../config/db');

// 获取所有课程列表
async function getAllCourses() {
  const [courses] = await pool.query('SELECT * FROM course ORDER BY create_time DESC');
  return courses;
}

// 根据课程别名获取课程详情（含章节列表）
async function getCourseByAlias(alias) {
  // 1. 获取课程基本信息
  const [courses] = await pool.query('SELECT * FROM course WHERE alias = ?', [alias]);
  if (courses.length === 0) return null; // 课程不存在

  const course = courses[0];

  // 2. 获取该课程的所有章节（按排序字段升序）
  const [chapters] = await pool.query(
    'SELECT id, title, sort FROM chapter WHERE course_id = ? ORDER BY sort ASC',
    [course.id]
  );

  // 3. 组合课程与章节数据
  course.chapters = chapters;
  return course;
}

module.exports = { getAllCourses, getCourseByAlias };