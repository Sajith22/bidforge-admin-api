export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  category?: string | null;
  startingPrice: number;
  currentHighestBid: number;
  highestBidderId?: string | null;
  highestBidderName?: string | null;
  startTime: string;          // ISO 8601
  durationMinutes: number;
  minIncrement?: number | null;
  isPublished: boolean;
  winnerId?: string | null;
  winnerName?: string | null;
  winningBid?: number | null;
  adminId: string;
}

export class CreateProductDto {
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  startingPrice: number;
  startTime: string;
  durationMinutes: number;
  minIncrement?: number;
  isPublished: boolean;
}