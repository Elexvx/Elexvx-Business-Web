const subjects = {
  文学: ['秋窗', '松间', '夜航', '长街', '旧信', '归舟'],
  历史: ['古渡', '驿道', '城门', '商埠', '碑刻', '旧京'],
  科技: ['算法', '材料', '星轨', '光学', '机械', '数据'],
  艺术: ['靛青', '墨色', '廊下', '画室', '格纹', '留白'],
  哲学: ['尺度', '秩序', '时间', '记忆', '日常', '想象'],
  生活: ['四时', '庭院', '茶席', '山野', '窗台', '小食'],
};
const forms = ['札记', '手稿', '随想', '小集', '拾遗', '漫谈'];
const palette = ['#593631', '#2c4950', '#ac8f67', '#495341', '#695972', '#8e5a37', '#344668', '#765b51'];

function shuffle(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createRandomBooks(random = Math.random) {
  return Object.entries(subjects).flatMap(([category, words], subjectIndex) =>
    shuffle(
      words.flatMap((word) => forms.map((form) => `${word}${form}`)),
      random
    )
      .slice(0, 24)
      .map((title, index) => ({
        id: `demo-${subjectIndex + 1}-${index + 1}`,
        title,
        category,
        author: '观文藏阁示例编写组',
        description: '随机生成的虚构书目与模拟封面。',
        color: palette[Math.floor(random() * palette.length)],
        pageCount: 220 + Math.floor(random() * 500),
        height: 0.31 + random() * 0.13,
        width: 0.2 + random() * 0.1,
        thickness: 0.077 + random() * 0.045,
      }))
  );
}

export function fillShelfSlots(compartments, books, allocateBookSlots, random = Math.random) {
  const byCategory = new Map();
  for (const book of books) {
    if (!byCategory.has(book.category)) byCategory.set(book.category, []);
    byCategory.get(book.category).push(book);
  }
  return compartments.flatMap((cell) => {
    // Allocate each bay independently so every level, face and storey gets books.
    // The renderer reuses cover textures for the same title across the building.
    const choices = shuffle(byCategory.get(cell.category) ?? books, random);
    return allocateBookSlots([cell], choices);
  });
}
