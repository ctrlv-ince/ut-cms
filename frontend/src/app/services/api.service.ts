import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import {
  Article,
  ServiceItem,
  TeamMember,
  Inquiry,
  MediaItem,
  SiteSettings,
  CollectionMeta,
  DashboardStats,
  SchemaInspection,
  ActivityLog
} from '../models/cms.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  public readonly apiUrl = 'http://localhost:3030';

  // ---------------- ARTICLES ----------------
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/api/articles`).pipe(
      catchError(err => {
        console.warn('Backend articles fetch failed, using fallback:', err);
        return of([]);
      })
    );
  }

  getArticle(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/api/articles/${id}`);
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/api/articles`, article);
  }

  updateArticle(id: number, article: Partial<Article>): Observable<Article> {
    return this.http.patch<Article>(`${this.apiUrl}/api/articles/${id}`, article);
  }

  deleteArticle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/articles/${id}`);
  }

  // ---------------- SERVICES ----------------
  getServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${this.apiUrl}/api/services`).pipe(
      catchError(err => {
        console.warn('Backend services fetch failed, using fallback:', err);
        return of([]);
      })
    );
  }

  createService(service: Partial<ServiceItem>): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(`${this.apiUrl}/api/services`, service);
  }

  updateService(id: number, service: Partial<ServiceItem>): Observable<ServiceItem> {
    return this.http.patch<ServiceItem>(`${this.apiUrl}/api/services/${id}`, service);
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/services/${id}`);
  }

  // ---------------- TEAM ----------------
  getTeam(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/api/team`).pipe(
      catchError(err => {
        console.warn('Backend team fetch failed, using fallback:', err);
        return of([]);
      })
    );
  }

  createTeamMember(member: Partial<TeamMember>): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}/api/team`, member);
  }

  updateTeamMember(id: number, member: Partial<TeamMember>): Observable<TeamMember> {
    return this.http.patch<TeamMember>(`${this.apiUrl}/api/team/${id}`, member);
  }

  deleteTeamMember(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/team/${id}`);
  }

  // ---------------- INQUIRIES ----------------
  getInquiries(): Observable<Inquiry[]> {
    return this.http.get<Inquiry[]>(`${this.apiUrl}/api/inquiries`).pipe(
      catchError(err => {
        console.warn('Backend inquiries fetch failed, using fallback:', err);
        return of([]);
      })
    );
  }

  createInquiry(inquiry: Partial<Inquiry>): Observable<Inquiry> {
    return this.http.post<Inquiry>(`${this.apiUrl}/api/inquiries`, inquiry);
  }

  updateInquiry(id: number, inquiry: Partial<Inquiry>): Observable<Inquiry> {
    return this.http.patch<Inquiry>(`${this.apiUrl}/api/inquiries/${id}`, inquiry);
  }

  deleteInquiry(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/inquiries/${id}`);
  }

  // ---------------- MEDIA ----------------
  getMedia(): Observable<MediaItem[]> {
    return this.http.get<MediaItem[]>(`${this.apiUrl}/api/media`).pipe(
      catchError(err => {
        console.warn('Backend media fetch failed, using fallback:', err);
        return of([]);
      })
    );
  }

  uploadMedia(formData: FormData): Observable<MediaItem> {
    return this.http.post<MediaItem>(`${this.apiUrl}/api/upload`, formData);
  }

  createMediaRecord(media: Partial<MediaItem>): Observable<MediaItem> {
    return this.http.post<MediaItem>(`${this.apiUrl}/api/media`, media);
  }

  deleteMedia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/media/${id}`);
  }

  // ---------------- SETTINGS ----------------
  getSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings[] | SiteSettings>(`${this.apiUrl}/api/settings`).pipe(
      map(res => {
        if (Array.isArray(res) && res.length > 0) return res[0];
        return res as SiteSettings;
      }),
      catchError(err => {
        console.warn('Backend settings fetch failed, returning default:', err);
        return of({
          id: 1,
          site_name: 'Nexus Directus Corporate',
          tagline: 'Enterprise Content & Digital Transformation Portal',
          hero_title: 'Pioneering Next-Generation Digital Experiences',
          hero_subtitle: 'Empowering global enterprises with bespoke cloud architectures, resilient event-driven microservices, and Directus-powered real-time headless CMS.',
          contact_email: 'inquiries@nexus-corporate.io',
          contact_phone: '+1 (888) 492-3000',
          office_address: '742 Silicon Valley Boulevard, Suite 500, San Francisco, CA',
          primary_color: '#6644ff',
          inquiries_enabled: 1
        });
      })
    );
  }

  updateSettings(id: number, settings: Partial<SiteSettings>): Observable<SiteSettings> {
    return this.http.patch<SiteSettings>(`${this.apiUrl}/api/settings/${id}`, settings);
  }

  // ---------------- COLLECTIONS / SCHEMA ----------------
  getCollections(): Observable<CollectionMeta[]> {
    return this.http.get<CollectionMeta[]>(`${this.apiUrl}/api/collections`).pipe(
      catchError(() => of([]))
    );
  }

  // ---------------- STATS (DASHBOARD INSIGHTS) ----------------
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/api/stats`).pipe(
      catchError(err => {
        console.warn('Backend stats fetch error, returning fallback:', err);
        return of({
          overview: {
            articles: 4,
            publishedArticles: 4,
            services: 4,
            team: 4,
            inquiries: 3,
            newInquiries: 1,
            media: 4,
            collections: 6,
            totalViews: 4080
          },
          recentInquiries: [],
          recentActivity: [],
          recentArticles: [],
          systemInfo: {
            cmsEngine: 'Directus-Style CMS (FeathersJS Core + Knex SQLite3)',
            database: 'SQLite 3 (WAL mode)',
            feathersVersion: '5.x',
            realtime: 'Socket.io Transport Active',
            serverUptime: 120
          }
        });
      })
    );
  }

  // ---------------- SCHEMA INSPECTOR ----------------
  getSchema(): Observable<SchemaInspection> {
    return this.http.get<SchemaInspection>(`${this.apiUrl}/api/schema`).pipe(
      catchError(() => of({ database: 'cms.sqlite', collections: [] }))
    );
  }

  // ---------------- ACTIVITY LOGS ----------------
  getActivity(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/api/activity`).pipe(
      catchError(() => of([]))
    );
  }

  // ---------------- SERVER HEALTH CHECK ----------------
  checkServerHealth(): Observable<{ status: string; backend: string }> {
    return this.http.get<{ status: string; backend: string }>(`${this.apiUrl}/api/server-info`).pipe(
      catchError(() => of({ status: 'OFFLINE', backend: 'Feathers Core + SQLite' }))
    );
  }
}
