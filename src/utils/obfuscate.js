const obfuscateWord = (word) => {
  if (word.length <= 2) {
    return '*'.repeat(word.length);
  }
  const first = word[0];
  const last = word[word.length - 1];
  const middle = '*'.repeat(word.length - 2);
  return `${first}${middle}${last}`;
};

const obfuscateTitle = (title) => {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return '';
  }

  const separators = /(\s+)/;
  return title
    .split(separators)
    .map((segment) => {
      if (separators.test(segment)) {
        return segment;
      }
      const cleanSegment = segment.trim();
      if (!cleanSegment) {
        return segment;
      }
      return obfuscateWord(cleanSegment);
    })
    .join('');
};

module.exports = {
  obfuscateTitle,
};
