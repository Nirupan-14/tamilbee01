import { User, EventItem, Business, SubscriptionPlan, Payment } from "@/types";


export const mockUsers: User[] = [
  { id: '1', firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', role: 'user', phone: '+1 555-0101', city: 'New York', address: '123 Main St', blocked: false, createdAt: '2024-01-15' },
  { id: '2', firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', role: 'user', phone: '+1 555-0102', city: 'Los Angeles', address: '456 Oak Ave', blocked: false, createdAt: '2024-02-20' },
  { id: '3', firstName: 'Carol', lastName: 'Williams', email: 'carol@example.com', role: 'user', phone: '+1 555-0103', city: 'Chicago', address: '789 Pine Rd', blocked: true, createdAt: '2024-03-10' },
  { id: '4', firstName: 'David', lastName: 'Brown', email: 'david@example.com', role: 'user', phone: '+1 555-0104', city: 'Houston', address: '321 Elm St', blocked: false, createdAt: '2024-04-05' },
  { id: '5', firstName: 'Eve', lastName: 'Davis', email: 'eve@example.com', role: 'admin', phone: '+1 555-0105', city: 'Phoenix', address: '654 Maple Dr', blocked: false, createdAt: '2024-05-12' },
];

export const mockEvents: EventItem[] = [
  { id: '1', name: 'Tech Conference 2025', dateTime: '2025-03-15T09:00', region: 'Northeast', city: 'New York', venue: 'Convention Center', contact: 'tech@example.com', description: 'Annual technology conference featuring the latest innovations.', status: 'approved', createdBy: '1' },
  { id: '2', name: 'Music Festival', dateTime: '2025-04-20T14:00', region: 'West', city: 'Los Angeles', venue: 'Sunset Park', contact: 'music@example.com', description: 'Three-day outdoor music festival with top artists.', status: 'pending', createdBy: '2' },
  { id: '3', name: 'Food & Wine Expo', dateTime: '2025-05-10T11:00', region: 'Midwest', city: 'Chicago', venue: 'McCormick Place', contact: 'food@example.com', description: 'Explore culinary delights from around the world.', status: 'approved', createdBy: '1' },
  { id: '4', name: 'Art Gallery Opening', dateTime: '2025-06-01T18:00', region: 'South', city: 'Houston', venue: 'Modern Art Museum', contact: 'art@example.com', description: 'Opening night of contemporary art exhibition.', status: 'rejected', createdBy: '3' },
  { id: '5', name: 'Startup Pitch Night', dateTime: '2025-07-08T19:00', region: 'West', city: 'San Francisco', venue: 'Innovation Hub', contact: 'startup@example.com', description: 'Startups pitch their ideas to investors.', status: 'pending', createdBy: '4' },
];

export const mockBusinesses: Business[] = [
  { id: '1', title: 'Digital Solutions', company: 'TechCorp Inc.', contact: 'John Doe', addressLine1: '100 Tech Blvd', cityId: 'NYC', provinceId: 'NY', postcode: '10001', telephone: '+1 212-555-0100', mobile: '+1 917-555-0100', fax: '+1 212-555-0199', email: 'info@techcorp.com', website: 'https://techcorp.com', description: 'Leading digital solutions provider.', category: 'Technology', youtubeLink: '', facebookLink: 'https://facebook.com/techcorp', twitterLink: '', linkedinLink: 'https://linkedin.com/company/techcorp', instagramLink: '', moreInfo: 'Est. 2010', htmlContent: '', posterUrl: '' },
  { id: '2', title: 'Creative Agency', company: 'DesignHub LLC', contact: 'Jane Smith', addressLine1: '200 Design Ave', cityId: 'LA', provinceId: 'CA', postcode: '90001', telephone: '+1 310-555-0200', mobile: '+1 323-555-0200', fax: '', email: 'hello@designhub.com', website: 'https://designhub.com', description: 'Full-service creative agency.', category: 'Marketing', youtubeLink: '', facebookLink: '', twitterLink: 'https://twitter.com/designhub', linkedinLink: '', instagramLink: 'https://instagram.com/designhub', moreInfo: '', htmlContent: '', posterUrl: '' },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: ['Up to 5 events', 'Basic analytics', 'Email support', 'Standard listing'],
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    period: 'month',
    features: ['Unlimited events', 'Advanced analytics', 'Priority support', 'Featured listing', 'Custom branding', 'API access', 'Team collaboration'],
    highlighted: true,
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    userId: '1',
    amount: 29,
    date: '2025-01-15',
    status: 'paid',
  },
  {
    id: '2',
    userId: '2',
    amount: 29,
    date: '2025-02-10',
    status: 'pending',
  },
  {
    id: '3',
    userId: '3',
    amount: 0,
    date: '2025-03-01',
    status: 'paid',
  },
  {
    id: '4',
    userId: '4',
    amount: 29,
    date: '2025-03-20',
    status: 'pending',
  },
];


export interface SubscribedUser {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
}

export const mockSubscribedUsers: SubscribedUser[] = [
  { id: '1', userId: '1', planId: 'premium', status: 'active', startDate: '2025-01-01', endDate: '2025-01-31' },
  { id: '2', userId: '2', planId: 'free', status: 'active', startDate: '2025-02-01', endDate: 'forever' },
  { id: '3', userId: '3', planId: 'premium', status: 'inactive', startDate: '2024-12-01', endDate: '2024-12-31' },
  { id: '4', userId: '4', planId: 'premium', status: 'active', startDate: '2025-03-01', endDate: '2025-03-31' },
  { id: '5', userId: '5', planId: 'premium', status: 'inactive', startDate: '2024-11-01', endDate: '2024-11-30' },
];
