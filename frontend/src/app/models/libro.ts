
export interface Libro {
  _id?: string;
  title: string;
  isbn: string;
  authorId: string;
  year?: number;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}
