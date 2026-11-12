
export interface Prestamo {
  _id?: string;
  bookId: string;
  userName: string;
  loanDate: string;
  returnDate?: string;
  returned: boolean;
  createdAt?: string;
  updatedAt?: string;
}
