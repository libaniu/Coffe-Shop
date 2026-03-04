export interface IVariant {
  label: string;
  price: number;
}

export interface IMenu {
  _id?: string;
  name: string;
  category: string;
  desc: string;
  img: string;
  isAvailable?: boolean;
  variants: IVariant[];
}

export interface IOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: any[];
}
