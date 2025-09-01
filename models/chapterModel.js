const { pool } = require('../config/db');

// 根据章节ID获取章节详情（含内容）
async function getChapterById(chapterId) {
  // 1. 获取章节基本信息
  const [chapters] = await pool.query('SELECT * FROM chapter WHERE id = ?', [chapterId]);
  if (chapters.length === 0) return null; // 章节不存在

  const chapter = chapters[0];

  // 2. 获取章节对应的内容
  const [contents] = await pool.query('SELECT content FROM content WHERE chapter_id = ?', [chapterId]);
  chapter.content = contents.length > 0 ? contents[0].content : '暂无内容';

  // 3. 获取同课程的上一章/下一章（用于导航）
  const [prevChapter] = await pool.query(
    'SELECT id, title FROM chapter WHERE course_id = ? AND sort < ? ORDER BY sort DESC LIMIT 1',
    [chapter.course_id, chapter.sort]
  );
  chapter.prevChapter = prevChapter.length > 0 ? prevChapter[0] : null;

  const [nextChapter] = await pool.query(
    'SELECT id, title FROM chapter WHERE course_id = ? AND sort > ? ORDER BY sort ASC LIMIT 1',
    [chapter.course_id, chapter.sort]
  );
  chapter.nextChapter = nextChapter.length > 0 ? nextChapter[0] : null;

  return chapter;
}

module.exports = { getChapterById };