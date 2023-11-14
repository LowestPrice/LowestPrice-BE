export interface ProductWithPrices {
  productName: string;
  email: string;
  atPrice: number;
  currentPrice: number;
  productPartnersUrl: string;
}

export interface KaKaoTemplate {
  userId: number;
  productId: number;
  nickname: string;
  phone: number;
  alarmPrice: number;
  originalPrice: number;
  currentPrice: number;
  productName: string;
  productOption: string;
  productPartnersUrl: string;
  productImage: string;
}
