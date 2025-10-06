export type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string; // Chúng ta sẽ dùng link ảnh placeholder
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export const menuData: MenuCategory[] = [
  {
    id: 'cat1',
    name: 'Món Hot',
    items: [
      {
        id: 'item1',
        name: 'Cà Phê Sữa Đá',
        price: 25000,
        image: 'https://placehold.jp/150x150.png',
      },
      {
        id: 'item2',
        name: 'Trà Đào Cam Sả',
        price: 45000,
        image: 'https://placehold.jp/150x150.png',
      },
    ],
  },
  {
    id: 'cat2',
    name: 'Cà Phê',
    items: [
      {
        id: 'item1',
        name: 'Cà Phê Sữa Đá',
        price: 25000,
        image: 'https://placehold.jp/150x150.png',
      },
      { id: 'item3', name: 'Espresso', price: 35000, image: 'https://placehold.jp/150x150.png' },
      { id: 'item4', name: 'Latte', price: 50000, image: 'https://placehold.jp/150x150.png' },
    ],
  },
  {
    id: 'cat3',
    name: 'Trà Sữa',
    items: [
      {
        id: 'item5',
        name: 'Trà Sữa Trân Châu',
        price: 40000,
        image: 'https://placehold.jp/150x150.png',
      },
      {
        id: 'item6',
        name: 'Trà Sữa Matcha',
        price: 45000,
        image: 'https://placehold.jp/150x150.png',
      },
    ],
  },
];
