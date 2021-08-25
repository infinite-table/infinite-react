export interface Order {
  OrderId: number;
  CompanyName: string;
  ItemCount: number;
  OrderCost: number;
  ShipCountry: string;
  ShipVia: string;
}

export const orders = [
  {
    OrderId: 1,
    CompanyName: 'Ltd company',
    ItemCount: 14,
    OrderCost: 950.5,
    ShipVia: 'Federal Shipping',
    ShipCountry: 'Canada',
  },
  {
    OrderId: 20,
    CompanyName: 'Xyz',

    ItemCount: 13,
    OrderCost: 717.21,
    ShipVia: 'United Package',
    ShipCountry: 'Germany',
  },
  {
    OrderId: 2,
    CompanyName: 'Abc',
    ItemCount: 13,
    OrderCost: 1009.71,
    ShipVia: 'Speedy Express',
    ShipCountry: 'Finland',
  },
  {
    OrderId: 3,
    CompanyName: 'Because',
    ItemCount: 10,
    OrderCost: 760.76,
    ShipVia: 'United Package',
    ShipCountry: 'France',
  },
];
