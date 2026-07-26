export const personalBonus = {
  id: 'personal-bonus',
  titleSv: 'Bonus',
  titleZh: '彩蛋',
  pinyin: 'cǎidàn',
  descriptionSv: 'En personlig bonuslektion om ett kinesiskt namn.',
  order: 2,
  lessons: [
    {
      id: 'liu-meng',
      titleSv: 'Ett kinesiskt namn: 刘梦',
      descriptionSv: 'Lär dig ordet för dröm och se hur ett kinesiskt personnamn är uppbyggt.',
      unlocksUiKeys: [],
      practiceModes: ['type-pinyin'],
      items: [
        {
          id: 'bonus-dream',
          sv: 'dröm',
          hanzi: '梦',
          pinyin: 'mèng',
          notesSv: 'Ett vanligt ord för dröm. Tecknet används också i personnamn.',
        },
        {
          id: 'bonus-liu-surname',
          sv: 'Liu – vanligt kinesiskt efternamn',
          hanzi: '刘',
          pinyin: 'Liú',
          notesSv: '刘 är ett mycket vanligt kinesiskt efternamn. Som efternamn översätts det inte efter tecknets äldre betydelser.',
        },
        {
          id: 'bonus-liu-meng-name',
          sv: 'Liu Meng – ett personnamn',
          hanzi: '刘梦',
          pinyin: 'Liú Mèng',
          notesSv: 'Liu Meng är min frus namn och finns med som en liten personlig hälsning i HànHàn.',
          components: [
            { hanzi: '刘', pinyin: 'Liú', sv: 'efternamnet Liu' },
            { hanzi: '梦', pinyin: 'mèng', sv: 'dröm' },
          ],
        },
      ],
    },
  ],
};
