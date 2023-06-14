export interface Order {
  OrderId: number;
  CompanyName: string;
  ItemCount: number;
  OrderCost: number;
  ShipCountry: string;
  ShipVia: string;
  ShipDate: Date;
}

export const orders = [
  {
    OrderId: 1,
    CompanyName: 'Ltd company',
    ItemCount: 14,
    OrderCost: 950.5,
    ShipVia: 'Federal Shipping',
    ShipCountry: 'Canada',
    ShipDate: new Date(2020, 10, 24),
  },
  {
    OrderId: 20,
    CompanyName: 'Xyz',

    ItemCount: 13,
    OrderCost: 717.21,
    ShipVia: 'United Package',
    ShipCountry: 'Germany',
    ShipDate: new Date(2023, 5, 24),
  },
  {
    OrderId: 2,
    CompanyName: 'Abc',
    ItemCount: 13,
    OrderCost: 1009.71,
    ShipVia: 'Speedy Express',
    ShipCountry: 'Finland',
    ShipDate: new Date(2021, 3, 4),
  },
  {
    OrderId: 3,
    CompanyName: 'Because',
    ItemCount: 10,
    OrderCost: 760.76,
    ShipVia: 'United Package',
    ShipCountry: 'France',
    ShipDate: new Date(2020, 10, 2),
  },
];
