import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateProductDto, Product } from './product.interface';

@Injectable()
export class ProductsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.firestore.collection('products');
  }

  async findAll(): Promise<Product[]> {
    const snapshot = await this.collection.orderBy('startTime').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
  }

  async findOne(id: string): Promise<Product> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return { id: doc.id, ...doc.data() } as Product;
  }

  async create(dto: CreateProductDto, adminId: string): Promise<Product> {
    const docRef = await this.collection.add({
      ...dto,
      currentHighestBid: dto.startingPrice,
      highestBidderId: null,
      highestBidderName: null,
      winnerId: null,
      winnerName: null,
      winningBid: null,
      adminId,
    });

    return this.findOne(docRef.id);
  }

  async setPublished(id: string, isPublished: boolean): Promise<Product> {
    await this.collection.doc(id).update({ isPublished });
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  // ── This is the server-side fix from the architecture review ──────────────
  // Computed using THIS SERVER's clock, not whatever a client device claims.
  // A modified APK or a tampered device clock can no longer lie about
  // whether an auction is actually still live.
  getStatus(product: Product): 'upcoming' | 'live' | 'ended' {
    const now = Date.now();
    const start = new Date(product.startTime).getTime();
    const end = start + product.durationMinutes * 60 * 1000;

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'live';
  }
}