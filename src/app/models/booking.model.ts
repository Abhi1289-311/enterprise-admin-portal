export interface Booking {
  id: number;
  bookingCode: string;
  customerName: string;
  source: string;
  destination: string;
  travelDate: string;
  bookingStatus: 'Created' | 'Confirmed' | 'Cancelled' | 'Completed';
  createdAt: string;
  updatedAt: string;
}