export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone: string;
  city: string;
  address: string;
  avatar?: string;
  blocked: boolean;
  createdAt: string;
}

export interface EventItem {
  id: string;
  name: string;
  dateTime: string;
  region: string;
  city: string;
  venue: string;
  contact: string;
  description: string;
  posterUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
}

export interface Business {
  id: string;
  title: string;
  company: string;
  contact: string;
  addressLine1: string;
  cityId: string;
  provinceId: string;
  postcode: string;
  telephone: string;
  mobile: string;
  fax: string;
  email: string;
  website: string;
  description: string;
  category: string;
  youtubeLink: string;
  facebookLink: string;
  twitterLink: string;
  linkedinLink: string;
  instagramLink: string;
  moreInfo: string;
  htmlContent: string;
  posterUrl?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
}
