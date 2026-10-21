import { Component, OnInit, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
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

type StudioSection = 'dashboard' | 'articles' | 'services' | 'team' | 'inquiries' | 'media' | 'schema' | 'api-explorer' | 'settings';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './studio.component.html'
})
export class StudioComponent implements OnInit {
  public api: ApiService = inject(ApiService);

  @Output() switchToWebsite = new EventEmitter<void>();

  // Navigation
  activeSection = signal<StudioSection>('dashboard');
  searchQuery = signal<string>('');
  statusFilter = signal<string>('all');

  // Server health
  serverStatus = signal<{ status: string; backend: string }>({ status: 'CHECKING', backend: 'Feathers Core' });

  // Data signals
  stats = signal<DashboardStats | null>(null);
  collections = signal<CollectionMeta[]>([]);
  articles = signal<Article[]>([]);
  services = signal<ServiceItem[]>([]);
  team = signal<TeamMember[]>([]);
  inquiries = signal<Inquiry[]>([]);
  media = signal<MediaItem[]>([]);
  settings = signal<SiteSettings | null>(null);
  schema = signal<SchemaInspection | null>(null);
  activity = signal<ActivityLog[]>([]);

  // Item Drawer / Modal Editor
  isEditorOpen = signal<boolean>(false);
  editingItem = signal<any>({});
  editingCollection = signal<string>('');
  isCreatingNew = signal<boolean>(false);
  editorSaving = signal<boolean>(false);

  // Media upload modal
  uploadModalOpen = signal<boolean>(false);
  uploadFile: File | null = null;
  uploadTitle: string = '';
  uploadFolder: string = 'General';
  uploadTags: string = '';
  uploading = signal<boolean>(false);
  quickImageUrl: string = '';

  // API Explorer
  apiEndpoint = signal<string>('/api/articles');
  apiMethod = signal<string>('GET');
  apiResponse = signal<string>('Click "Execute Request" to test endpoint live against FeathersJS.');
  apiLoading = signal<boolean>(false);

  // Notification Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error' | 'info'>('success');

  // Filtered computed lists
  filteredArticles = computed(() => {
    let list = this.articles();
    const filter = this.statusFilter();
    if (filter !== 'all') {
      list = list.filter(a => a.status === filter);
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q) || a.author_name?.toLowerCase().includes(q));
    }
    return list;
  });

  filteredServices = computed(() => {
    let list = this.services();
    const filter = this.statusFilter();
    if (filter !== 'all') {
      list = list.filter(s => s.status === filter);
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q));
    }
    return list;
  });

  filteredTeam = computed(() => {
    let list = this.team();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q) || t.department?.toLowerCase().includes(q));
    }
    return list;
  });

  filteredInquiries = computed(() => {
    let list = this.inquiries();
    const filter = this.statusFilter();
    if (filter !== 'all') {
      list = list.filter(i => i.status === filter);
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.company?.toLowerCase().includes(q) || i.subject?.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
    }
    return list;
  });

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll() {
    this.checkHealth();
    this.loadStats();
    this.loadCollections();
    this.loadArticles();
    this.loadServices();
    this.loadTeam();
    this.loadInquiries();
    this.loadMedia();
    this.loadSettings();
    this.loadSchema();
    this.loadActivity();
  }

  checkHealth() {
    this.api.checkServerHealth().subscribe((res: { status: string; backend: string }) => {
      this.serverStatus.set(res);
    });
  }

  loadStats() {
    this.api.getStats().subscribe((st: DashboardStats) => this.stats.set(st));
  }

  loadCollections() {
    this.api.getCollections().subscribe((cols: CollectionMeta[]) => this.collections.set(cols));
  }

  loadArticles() {
    this.api.getArticles().subscribe((arts: Article[]) => this.articles.set(arts));
  }

  loadServices() {
    this.api.getServices().subscribe((srvs: ServiceItem[]) => this.services.set(srvs));
  }

  loadTeam() {
    this.api.getTeam().subscribe((t: TeamMember[]) => this.team.set(t));
  }

  loadInquiries() {
    this.api.getInquiries().subscribe((inqs: Inquiry[]) => this.inquiries.set(inqs));
  }

  loadMedia() {
    this.api.getMedia().subscribe((m: MediaItem[]) => this.media.set(m));
  }

  loadSettings() {
    this.api.getSettings().subscribe((s: SiteSettings) => this.settings.set(s));
  }

  loadSchema() {
    this.api.getSchema().subscribe((sch: SchemaInspection) => this.schema.set(sch));
  }

  loadActivity() {
    this.api.getActivity().subscribe((act: ActivityLog[]) => this.activity.set(act));
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  // ---------------- ITEM DRAWER ACTIONS ----------------
  openCreateModal(collection: string) {
    this.editingCollection.set(collection);
    this.isCreatingNew.set(true);

    if (collection === 'articles') {
      this.editingItem.set({
        title: '',
        slug: '',
        category: 'Technology',
        excerpt: '',
        content: '<p>Write your detailed article body here...</p>',
        cover_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        author_name: 'Lead Architect',
        author_role: 'Senior Systems Engineer',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        reading_time: '5 min read',
        status: 'published',
        featured: 0
      });
    } else if (collection === 'services') {
      this.editingItem.set({
        title: '',
        slug: '',
        category: 'Digital Engineering',
        badge: 'Enterprise',
        icon: 'cpu',
        short_description: '',
        detailed_description: '',
        features: JSON.stringify(['High Availability Architecture', 'Full SQLite Persistence', 'Feathers Core API']),
        status: 'published'
      });
    } else if (collection === 'team') {
      this.editingItem.set({
        name: '',
        role: '',
        department: 'Engineering',
        bio: '',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        email: '',
        linkedin: 'https://linkedin.com',
        twitter: '',
        status: 'published'
      });
    } else if (collection === 'inquiries') {
      this.editingItem.set({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        service_interest: 'Enterprise Headless CMS Orchestration',
        message: '',
        status: 'new',
        priority: 'normal',
        internal_notes: ''
      });
    }

    this.isEditorOpen.set(true);
  }

  openEditModal(collection: string, item: any) {
    this.editingCollection.set(collection);
    this.isCreatingNew.set(false);
    this.editingItem.set(JSON.parse(JSON.stringify(item)));
    this.isEditorOpen.set(true);
  }

  closeEditor() {
    this.isEditorOpen.set(false);
    this.editingItem.set({});
  }

  saveItem() {
    const col = this.editingCollection();
    const item = this.editingItem();
    this.editorSaving.set(true);

    if (item.title && !item.slug) {
      item.slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    let saveObs: Observable<any> | undefined;
    if (this.isCreatingNew()) {
      if (col === 'articles') saveObs = this.api.createArticle(item);
      else if (col === 'services') saveObs = this.api.createService(item);
      else if (col === 'team') saveObs = this.api.createTeamMember(item);
      else if (col === 'inquiries') saveObs = this.api.createInquiry(item);
    } else {
      const id = item.id;
      if (col === 'articles') saveObs = this.api.updateArticle(id, item);
      else if (col === 'services') saveObs = this.api.updateService(id, item);
      else if (col === 'team') saveObs = this.api.updateTeamMember(id, item);
      else if (col === 'inquiries') saveObs = this.api.updateInquiry(id, item);
    }

    if (saveObs) {
      saveObs.subscribe({
        next: () => {
          this.editorSaving.set(false);
          this.closeEditor();
          this.showToast(`Item successfully ${this.isCreatingNew() ? 'created' : 'updated'} in SQLite database.`);
          this.refreshAll();
        },
        error: (err: any) => {
          this.editorSaving.set(false);
          this.showToast(`Error saving item: ${err?.message || 'Server error'}`, 'error');
        }
      });
    } else {
      this.editorSaving.set(false);
    }
  }

  deleteItem(collection: string, id: number) {
    if (!confirm(`Are you sure you want to delete this record (ID: #${id}) from ${collection}?`)) return;

    let deleteObs: Observable<any> | undefined;
    if (collection === 'articles') deleteObs = this.api.deleteArticle(id);
    else if (collection === 'services') deleteObs = this.api.deleteService(id);
    else if (collection === 'team') deleteObs = this.api.deleteTeamMember(id);
    else if (collection === 'inquiries') deleteObs = this.api.deleteInquiry(id);
    else if (collection === 'media') deleteObs = this.api.deleteMedia(id);

    if (deleteObs) {
      deleteObs.subscribe({
        next: () => {
          this.showToast(`Record #${id} removed successfully.`);
          this.refreshAll();
          if (this.isEditorOpen()) this.closeEditor();
        },
        error: (err: any) => {
          this.showToast(`Failed to delete record: ${err?.message || 'Server error'}`, 'error');
        }
      });
    }
  }

  updateQuickStatus(collection: string, item: any, newStatus: string) {
    const patch = { status: newStatus as any };
    let obs: Observable<any> | undefined;
    if (collection === 'articles') obs = this.api.updateArticle(item.id, patch);
    else if (collection === 'services') obs = this.api.updateService(item.id, patch);
    else if (collection === 'inquiries') obs = this.api.updateInquiry(item.id, patch);

    if (obs) {
      obs.subscribe(() => {
        item.status = newStatus;
        this.showToast(`Status updated to "${newStatus}".`);
        this.loadStats();
      });
    }
  }

  // ---------------- MEDIA ACTIONS ----------------
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile = file;
      if (!this.uploadTitle) {
        this.uploadTitle = file.name;
      }
    }
  }

  submitMediaUpload() {
    if (this.quickImageUrl) {
      this.api.createMediaRecord({
        title: this.uploadTitle || 'External Graphic',
        filename: this.quickImageUrl.split('/').pop() || 'image.jpg',
        url: this.quickImageUrl,
        thumbnail_url: this.quickImageUrl,
        mime_type: 'image/jpeg',
        file_size: 250000,
        folder: this.uploadFolder,
        tags: this.uploadTags
      }).subscribe(() => {
        this.uploadModalOpen.set(false);
        this.quickImageUrl = '';
        this.uploadTitle = '';
        this.showToast('Asset saved to Media Library.');
        this.loadMedia();
        this.loadStats();
      });
      return;
    }

    if (!this.uploadFile) {
      this.showToast('Please select a file or provide an Image URL.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.uploadFile);
    formData.append('title', this.uploadTitle || this.uploadFile.name);
    formData.append('folder', this.uploadFolder);
    formData.append('tags', this.uploadTags);

    this.uploading.set(true);
    this.api.uploadMedia(formData).subscribe({
      next: () => {
        this.uploading.set(false);
        this.uploadModalOpen.set(false);
        this.uploadFile = null;
        this.uploadTitle = '';
        this.showToast('File uploaded and cataloged in Directus Media Library.');
        this.loadMedia();
        this.loadStats();
      },
      error: (err: any) => {
        this.uploading.set(false);
        this.showToast(`Upload error: ${err?.message || 'Server error'}`, 'error');
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    this.showToast('URL copied to clipboard!');
  }

  // ---------------- SITE SETTINGS SAVE ----------------
  saveSettings() {
    const s = this.settings();
    if (!s || !s.id) return;
    this.api.updateSettings(s.id, s).subscribe({
      next: () => {
        this.showToast('Global Site Settings saved successfully.');
      },
      error: (err: any) => {
        this.showToast(`Error saving settings: ${err?.message || 'Server error'}`, 'error');
      }
    });
  }

  // ---------------- FEATHERS API EXPLORER ----------------
  runApiExplorer() {
    this.apiLoading.set(true);
    const endpoint = this.apiEndpoint();
    const url = `${this.api.apiUrl}${endpoint}`;

    fetch(url)
      .then(res => res.json())
      .then(json => {
        this.apiLoading.set(false);
        this.apiResponse.set(JSON.stringify(json, null, 2));
      })
      .catch(err => {
        this.apiLoading.set(false);
        this.apiResponse.set(JSON.stringify({ error: err?.message || 'Unknown error', status: 'Failed to reach Feathers server' }, null, 2));
      });
  }

  getApiCurlSnippet(): string {
    return `curl -X GET "${this.api.apiUrl}${this.apiEndpoint()}" \\\n  -H "Accept: application/json"`;
  }

  getApiFetchSnippet(): string {
    return `const res = await fetch('${this.api.apiUrl}${this.apiEndpoint()}');\nconst data = await res.json();\nconsole.log(data);`;
  }

  getColumnKeys(columns: Record<string, any> | undefined): string[] {
    return columns ? Object.keys(columns) : [];
  }
}
