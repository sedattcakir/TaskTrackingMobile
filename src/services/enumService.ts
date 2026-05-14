export type StatusItem = {
  id: string;
  code: number;
  name: string;
};

export type PriorityItem = {
  id: string;
  code: number;
  name: string;
};

export async function getStatuses() {
  return [
    {id: 'pending', code: 0, name: 'Bekliyor'},
    {id: 'in-progress', code: 1, name: 'Yapılıyor'},
    {id: 'completed', code: 2, name: 'Tamamlandı'},
  ];
}

export async function getPriorities() {
  return [
    {id: 'low', code: 0, name: 'Düşük'},
    {id: 'medium', code: 1, name: 'Orta'},
    {id: 'high', code: 2, name: 'Yüksek'},
  ];
}
