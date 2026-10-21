export interface CollectionMeta {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  singleton: boolean | number;
  system: boolean | number;
  fields?: FieldMeta[];
  created_at?: string;
  updated_at?: string;
}

export interface FieldMeta {
  key: string;
  label: string;
  type: string;
  interface: string;
  required?: boolean;
  options?: string[];
  width?: 'half' | 'full';
}

export interface Article {
  id?: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  reading_time: string;
  status: 'published' | 'draft' | 'archived';
  featured: boolean | number;
  views?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceItem {
  id?: number;
  title: string;
  slug: string;
  category: string;
  badge: string;
  icon: string;
  short_description: string;
  detailed_description: string;
  features: string; // JSON array or comma separated
  order_num?: number;
  status: 'published' | 'draft';
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  id?: number;
  name: string;
  role: string;
  department: string;
  bio: string;
  avatar: string;
  email: string;
  linkedin: string;
  twitter?: string;
  order_num?: number;
  status: 'published' | 'draft';
  created_at?: string;
  updated_at?: string;
}

export interface Inquiry {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  service_interest?: string;
  message: string;
  status: 'new' | 'in_review' | 'contacted' | 'resolved' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  internal_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MediaItem {
  id?: number;
  title: string;
  filename: string;
  original_name?: string;
  mime_type: string;
  file_size: number;
  url: string;
  thumbnail_url?: string;
  folder: string;
  tags?: string;
  created_at?: string;
}

export interface SiteSettings {
  id?: number;
  site_name: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  contact_email: string;
  contact_phone: string;
  office_address: string;
  primary_color: string;
  inquiries_enabled: boolean | number;
  social_links?: string;
  updated_at?: string;
}

export interface ActivityLog {
  id?: number;
  action: string;
  collection: string;
  item_id?: string;
  item_title?: string;
  user: string;
  details?: string;
  created_at?: string;
}

export interface DashboardStats {
  overview: {
    articles: number;
    publishedArticles: number;
    services: number;
    team: number;
    inquiries: number;
    newInquiries: number;
    media: number;
    collections: number;
    totalViews: number;
  };
  recentInquiries: Inquiry[];
  recentActivity: ActivityLog[];
  recentArticles: Article[];
  systemInfo: {
    cmsEngine: string;
    database: string;
    feathersVersion: string;
    realtime: string;
    serverUptime: number;
  };
}

export interface SchemaInspection {
  database: string;
  collections: {
    table: string;
    meta: CollectionMeta | null;
    columns: Record<string, any>;
    itemCount: number;
  }[];
}
