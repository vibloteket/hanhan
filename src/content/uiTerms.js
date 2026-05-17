export const uiTerms = [
  { key: 'app.title', sv: 'MandarinMode', en: 'MandarinMode', zh: '中文模式', pinyin: 'zhōngwén móshì' },
  { key: 'nav.home', sv: 'Hem', en: 'Home', zh: '首页', pinyin: 'shǒuyè' },
  { key: 'nav.packs', sv: 'Paket', en: 'Packs', zh: '学习包', pinyin: 'xuéxí bāo' },
  { key: 'nav.progress', sv: 'Progress', en: 'Progress', zh: '进度', pinyin: 'jìndù' },
  { key: 'settings.title', sv: 'Inställningar', en: 'Settings', zh: '设置', pinyin: 'shèzhì' },

  { key: 'action.start', sv: 'Starta', en: 'Start', zh: '开始', pinyin: 'kāishǐ' },
  { key: 'action.continue', sv: 'Fortsätt', en: 'Continue', zh: '继续', pinyin: 'jìxù' },
  { key: 'action.review', sv: 'Repetera', en: 'Review', zh: '复习', pinyin: 'fùxí' },
  { key: 'action.learn', sv: 'Lär dig', en: 'Learn', zh: '学习', pinyin: 'xuéxí' },
  { key: 'action.practice', sv: 'Öva', en: 'Practice', zh: '练习', pinyin: 'liànxí' },
  { key: 'action.back', sv: 'Tillbaka', en: 'Back', zh: '返回', pinyin: 'fǎnhuí' },
  { key: 'action.next', sv: 'Nästa', en: 'Next', zh: '下一个', pinyin: 'xià yí ge' },
  { key: 'action.showAnswer', sv: 'Visa svar', en: 'Show answer', zh: '显示答案', pinyin: 'xiǎnshì dá’àn' },
  { key: 'action.save', sv: 'Spara', en: 'Save', zh: '保存', pinyin: 'bǎocún' },
  { key: 'action.cancel', sv: 'Avbryt', en: 'Cancel', zh: '取消', pinyin: 'qǔxiāo' },
  { key: 'action.reset', sv: 'Nollställ', en: 'Reset', zh: '重置', pinyin: 'chóngzhì' },
  { key: 'action.export', sv: 'Exportera backup', en: 'Export backup', zh: '导出备份', pinyin: 'dǎochū bèifèn' },
  { key: 'action.import', sv: 'Importera backup', en: 'Import backup', zh: '导入备份', pinyin: 'dǎorù bèifèn' },

  { key: 'lesson.title', sv: 'Lektion', en: 'Lesson', zh: '课程', pinyin: 'kèchéng' },
  { key: 'lesson.complete', sv: 'Klar', en: 'Complete', zh: '完成', pinyin: 'wánchéng' },
  { key: 'term.word', sv: 'Ord', en: 'Word', zh: '词', pinyin: 'cí' },
  { key: 'term.answer', sv: 'Svar', en: 'Answer', zh: '答案', pinyin: 'dá’àn' },
  { key: 'feedback.correct', sv: 'Rätt', en: 'Correct', zh: '对', pinyin: 'duì' },
  { key: 'feedback.wrong', sv: 'Fel', en: 'Wrong', zh: '错', pinyin: 'cuò' },
  { key: 'feedback.easy', sv: 'Lätt', en: 'Easy', zh: '简单', pinyin: 'jiǎndān' },
  { key: 'feedback.hard', sv: 'Svårt', en: 'Hard', zh: '难', pinyin: 'nán' },

  { key: 'status.today', sv: 'Idag', en: 'Today', zh: '今天', pinyin: 'jīntiān' },
  { key: 'status.due', sv: 'Att repetera', en: 'Due', zh: '要复习', pinyin: 'yào fùxí' },
  { key: 'status.streak', sv: 'Streak', en: 'Streak', zh: '连续天数', pinyin: 'liánxù tiānshù' },
  { key: 'status.language', sv: 'Språk', en: 'Language', zh: '语言', pinyin: 'yǔyán' },
];

export const uiTermByKey = Object.fromEntries(uiTerms.map((term) => [term.key, term]));
