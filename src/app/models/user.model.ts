export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Viewer';
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}