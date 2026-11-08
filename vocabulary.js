export const SETS={
  "initial": {
    "title": "В начале слова",
    "example": "Рука · роза",
    "words": [
      "hand",
      "rose",
      "chamomile",
      "lynx",
      "rainbow",
      "rocket",
      "fish",
      "racket",
      "wheel",
      "socket",
      "shirt"
    ],
    "syllables": [
      "РА",
      "РО",
      "РУ",
      "РЫ"
    ]
  },
  "middle": {
    "title": "В середине слова",
    "example": "Корова · барабан",
    "words": [
      "cow",
      "drum",
      "stackingtoy",
      "guitar",
      "ram",
      "peas",
      "crown",
      "corn",
      "gift",
      "burrow"
    ],
    "syllables": [
      "АРА",
      "ОРО",
      "УРУ",
      "ЫРЫ"
    ]
  },
  "final": {
    "title": "В конце слова",
    "example": "Помидор · сахар",
    "words": [
      "tomato",
      "sugar",
      "figs",
      "toadstool",
      "thief",
      "rubbish",
      "motorboat",
      "samovar",
      "axe",
      "mosquito"
    ],
    "syllables": [
      "АР",
      "ОР",
      "УР",
      "ЫР"
    ]
  },
  "cluster": {
    "title": "В стечениях согласных",
    "example": "Груша · крот",
    "words": [
      "pear",
      "mole",
      "firewood",
      "crocodile",
      "zebra",
      "carrot",
      "helicopter",
      "doctor",
      "cake",
      "basket",
      "pomegranate"
    ],
    "syllables": [
      "ГРА",
      "БРО",
      "ДРЫ",
      "КРУ"
    ]
  }
};
export const LABELS={
  "hand": "Рука",
  "rose": "Роза",
  "chamomile": "Ромашка",
  "lynx": "Рысь",
  "rainbow": "Радуга",
  "rocket": "Ракета",
  "fish": "Рыба",
  "racket": "Ракетка",
  "wheel": "Руль",
  "socket": "Розетка",
  "shirt": "Рубашка",
  "cow": "Корова",
  "drum": "Барабан",
  "stackingtoy": "Пирамидка",
  "guitar": "Гитара",
  "ram": "Баран",
  "peas": "Горох",
  "crown": "Корона",
  "corn": "Кукуруза",
  "gift": "Подарок",
  "burrow": "Нора",
  "tomato": "Помидор",
  "sugar": "Сахар",
  "figs": "Инжир",
  "toadstool": "Мухомор",
  "thief": "Вор",
  "rubbish": "Мусор",
  "motorboat": "Катер",
  "samovar": "Самовар",
  "axe": "Топор",
  "mosquito": "Комар",
  "pear": "Груша",
  "mole": "Крот",
  "firewood": "Дрова",
  "crocodile": "Крокодил",
  "zebra": "Зебра",
  "carrot": "Морковь",
  "helicopter": "Вертолёт",
  "doctor": "Врач",
  "cake": "Торт",
  "basket": "Корзина",
  "pomegranate": "Гранат"
};
export function wordArt(id){
 for(const [key,set] of Object.entries(SETS)){
  const index=set.words.indexOf(id);
  if(index>=0)return {src:`assets/words/r-${key}-atlas.png`,size:'400% 300%',position:`${index%4*100/3}% ${Math.floor(index/4)*50}%`};
 }
 throw new Error(`Unknown word: ${id}`);
}
