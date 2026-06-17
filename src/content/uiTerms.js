export const uiTerms = [
  { key: 'app.title', sv: 'HànHàn', en: 'HànHàn', zh: '汉汉', pinyin: 'hàn hàn' },
  { key: 'nav.home', sv: 'Hem', en: 'Home', zh: '首页', pinyin: 'shǒuyè' },
  { key: 'nav.progress', sv: 'Ordlista', en: 'Word list', zh: '词表', pinyin: 'cíbiǎo' },
  { key: 'nav.about', sv: 'Om HànHàn', en: 'About HànHàn', zh: '关于汉汉', pinyin: 'guānyú hàn hàn' },
  { key: 'settings.title', sv: 'Inställningar', en: 'Settings', zh: '设置', pinyin: 'shèzhì' },

  { key: 'action.start', sv: 'Starta', en: 'Start', zh: '开始', pinyin: 'kāishǐ' },
  { key: 'action.continue', sv: 'Fortsätt', en: 'Continue', zh: '继续', pinyin: 'jìxù' },
  { key: 'action.review', sv: 'Repetera', en: 'Review', zh: '复习', pinyin: 'fùxí' },
  { key: 'review.title', sv: 'Repetition', en: 'Review', zh: '复习', pinyin: 'fùxí' },
  { key: 'action.learn', sv: 'Lär dig', en: 'Learn', zh: '学习', pinyin: 'xuéxí' },
  { key: 'action.practice', sv: 'Öva', en: 'Practice', zh: '练习', pinyin: 'liànxí' },
  { key: 'action.back', sv: 'Tillbaka', en: 'Back', zh: '返回', pinyin: 'fǎnhuí' },
  { key: 'action.next', sv: 'Nästa', en: 'Next', zh: '下一个', pinyin: 'xià yí ge' },
  { key: 'action.showAnswer', sv: 'Visa svar', en: 'Show answer', zh: '显示答案', pinyin: 'xiǎnshì dá’àn' },
  { key: 'action.cancel', sv: 'Avbryt', en: 'Cancel', zh: '取消', pinyin: 'qǔxiāo' },
  { key: 'action.reset', sv: 'Nollställ', en: 'Reset', zh: '重置', pinyin: 'chóngzhì' },
  { key: 'action.export', sv: 'Exportera backup', en: 'Export backup', zh: '导出备份', pinyin: 'dǎochū bèifèn' },
  { key: 'action.import', sv: 'Importera backup', en: 'Import backup', zh: '导入备份', pinyin: 'dǎorù bèifèn' },

  { key: 'lesson.title', sv: 'Lektioner', en: 'Lessons', zh: '课程', pinyin: 'kèchéng' },
  { key: 'lesson.complete', sv: 'Klar', en: 'Complete', zh: '完成', pinyin: 'wánchéng' },
  { key: 'term.word', sv: 'Ord', en: 'Word', zh: '词', pinyin: 'cí' },
  { key: 'term.answer', sv: 'Svar', en: 'Answer', zh: '答案', pinyin: 'dá’àn' },
  { key: 'feedback.correct', sv: 'Rätt', en: 'Correct', zh: '对', pinyin: 'duì' },
  { key: 'feedback.wrong', sv: 'Fel', en: 'Wrong', zh: '错', pinyin: 'cuò' },

  { key: 'status.due', sv: 'Att repetera', en: 'Due', zh: '要复习', pinyin: 'yào fùxí' },
  { key: 'status.inProgress', sv: 'Pågående', en: 'In progress', zh: '进行中', pinyin: 'jìnxíng zhōng' },
  { key: 'status.incomplete', sv: 'Ej klar', en: 'Incomplete', zh: '未完成', pinyin: 'wèi wánchéng' },
  { key: 'status.learnedCards', sv: 'lärda kort', en: 'learned cards', zh: '已学', pinyin: 'yǐxué' },
  { key: 'status.mastered', sv: 'Sitter', en: 'Mastered', zh: '熟', pinyin: 'shú' },
  { key: 'status.language', sv: 'Språk', en: 'Language', zh: '语言', pinyin: 'yǔyán' },
  { key: 'section.data', sv: 'Data', en: 'Data', zh: '数据', pinyin: 'shùjù' },
];

export const uiTermByKey = Object.fromEntries(uiTerms.map((term) => [term.key, term]));
