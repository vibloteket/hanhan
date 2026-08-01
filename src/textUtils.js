const toneMap = {
  ā: 'a', á: 'a', ǎ: 'a', à: 'a', ē: 'e', é: 'e', ě: 'e', è: 'e',
  ī: 'i', í: 'i', ǐ: 'i', ì: 'i', ō: 'o', ó: 'o', ǒ: 'o', ò: 'o',
  ū: 'u', ú: 'u', ǔ: 'u', ù: 'u', ǖ: 'u', ǘ: 'u', ǚ: 'u', ǜ: 'u', ü: 'u',
  ń: 'n', ň: 'n', 'ǹ': 'n', ḿ: 'm',
};

export function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[。！？!?.,，、;；:'’"“”\s]+/g, '');
}

export function normalizePinyin(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[1-5]/g, '')
    .replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹḿ]/g, (char) => toneMap[char] || char)
    .replace(/[^a-z]/g, '');
}

export function isCorrectHanzi(input, item) {
  return normalizeText(input) === normalizeText(item.hanzi);
}

function normalizePinyinAlternative(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹḿ]/g, (char) => toneMap[char] || char)
    .replace(/([a-z])[1-5]/g, '$1')
    .replace(/[^a-z0-9]/g, '');
}

export function isCorrectPinyin(input, item) {
  if (normalizePinyin(input) === normalizePinyin(item.pinyin)) return true;
  const normalizedInput = normalizePinyinAlternative(input);
  return (item.acceptedPinyin || []).some(
    (answer) => normalizedInput === normalizePinyinAlternative(answer)
  );
}
