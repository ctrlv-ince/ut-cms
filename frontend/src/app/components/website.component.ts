import { Component, OnInit, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Article, ServiceItem, TeamMember, SiteSettings, Inquiry } from '../models/cms.models';

export interface SensorTelemetry {
  id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  thresholdNormal: number;
  thresholdWarning: number;
  history: number[];
  lastUpdated: string;
}

@Component({
  selector: 'app-website',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './website.component.html'
})
export class WebsiteComponent implements OnInit {
  public api: ApiService = inject(ApiService);

  @Output() switchToStudio = new EventEmitter<string>();

  // Active section for navigation
  activeNav = signal<string>('home');

  // Settings & CMS data
  settings = signal<SiteSettings>({
    site_name: 'Node-RED Academy',
    tagline: 'Industrial IoT, Edge Computing & Directus CMS Educational Platform',
    hero_title: 'Master Node-RED Flow Architecture & Industrial Edge Telemetry',
    hero_subtitle: 'An interactive educational platform exploring risk telemetry pipelines, distributed edge microservices, and SQLite persistence orchestrated through Directus Headless CMS.',
    contact_email: 'lab@nodered-academy.edu',
    contact_phone: '+1 (800) 492-3000',
    office_address: 'Advanced IoT Systems Building, Science Park, Suite 400',
    primary_color: '#2563EB',
    inquiries_enabled: 1
  });

  articles = signal<Article[]>([]);
  services = signal<ServiceItem[]>([]);
  team = signal<TeamMember[]>([]);

  // Filtering & Modal state
  selectedCategory = signal<string>('All');
  selectedArticle = signal<Article | null>(null);
  selectedService = signal<ServiceItem | null>(null);
  searchQuery = signal<string>('');

  // Active tutorial step
  activeTutorialStep = signal<number>(1);

  // Architecture diagram active node info
  activeDiagramNode = signal<{
    id: string;
    title: string;
    type: string;
    color: string;
    description: string;
    protocol: string;
  }>({
    id: 'nodered-engine',
    title: 'Node-RED Flow Runtime',
    type: 'Event Processing Core',
    color: '#E11D48',
    description: 'Ingests MQTT payloads, applies exponential moving averages, executes rule switches, and dispatches HTTP requests.',
    protocol: 'Internal Event Loop / Node.js Engine'
  });

  // Interactive Sensor Simulation
  simulatedSensors = signal<SensorTelemetry[]>([
    {
      id: 'temp-1',
      name: 'Exhaust Thermal Probe (DHT22)',
      type: 'Temperature',
      value: 38.4,
      unit: '°C',
      status: 'normal',
      thresholdNormal: 45,
      thresholdWarning: 75,
      history: [35, 36, 37, 36.5, 38, 38.4],
      lastUpdated: '1s ago'
    },
    {
      id: 'gas-1',
      name: 'Hazardous Vapor Sensor (MQ-2)',
      type: 'Gas Concentration',
      value: 120,
      unit: 'PPM',
      status: 'normal',
      thresholdNormal: 250,
      thresholdWarning: 500,
      history: [110, 115, 112, 118, 122, 120],
      lastUpdated: 'Just now'
    },
    {
      id: 'vib-1',
      name: 'Compressor Vibration (ADXL345)',
      type: 'Vibrational Shift',
      value: 1.8,
      unit: 'mm/s',
      status: 'normal',
      thresholdNormal: 3.5,
      thresholdWarning: 7.0,
      history: [1.2, 1.4, 1.5, 1.6, 1.7, 1.8],
      lastUpdated: '2s ago'
    },
    {
      id: 'hum-1',
      name: 'Chamber Humidity (BME280)',
      type: 'Relative Humidity',
      value: 52.1,
      unit: '%',
      status: 'normal',
      thresholdNormal: 70,
      thresholdWarning: 85,
      history: [50, 51, 51.5, 52, 51.8, 52.1],
      lastUpdated: 'Just now'
    }
  ]);

  simulationMode = signal<'normal' | 'warning' | 'critical'>('normal');

  // Inquiry form
  inquiryForm: Partial<Inquiry> = {
    name: '',
    email: '',
    company: '',
    phone: '',
    service_interest: 'Risk Monitoring & Environmental Telemetry',
    subject: '',
    message: '',
    priority: 'normal'
  };
  inquirySubmitting = signal<boolean>(false);
  inquirySuccess = signal<string | null>(null);
  inquiryError = signal<string | null>(null);

  // Filtered computed lists
  filteredArticles = computed(() => {
    let list = this.articles().filter(a => a.status === 'published');
    const cat = this.selectedCategory();
    if (cat !== 'All') {
      list = list.filter(a => a.category.toLowerCase() === cat.toLowerCase());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q));
    }
    return list;
  });

  articleCategories = computed(() => {
    const cats = new Set<string>();
    cats.add('All');
    this.articles().forEach(a => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getSettings().subscribe((s: SiteSettings) => {
      if (s) this.settings.set(s);
    });

    this.api.getArticles().subscribe((arts: Article[]) => {
      this.articles.set(arts);
    });

    this.api.getServices().subscribe((srvs: ServiceItem[]) => {
      this.services.set(srvs);
    });

    this.api.getTeam().subscribe((t: TeamMember[]) => {
      this.team.set(t);
    });
  }

  // Interactive Simulation Controls
  setSimulationMode(mode: 'normal' | 'warning' | 'critical') {
    this.simulationMode.set(mode);
    const updated = this.simulatedSensors().map(sensor => {
      let val = sensor.value;
      let status: 'normal' | 'warning' | 'critical' = 'normal';

      if (mode === 'normal') {
        if (sensor.type === 'Temperature') val = 38.4;
        else if (sensor.type === 'Gas Concentration') val = 120;
        else if (sensor.type === 'Vibrational Shift') val = 1.8;
        else val = 52.1;
        status = 'normal';
      } else if (mode === 'warning') {
        if (sensor.type === 'Temperature') val = 58.2;
        else if (sensor.type === 'Gas Concentration') val = 340;
        else if (sensor.type === 'Vibrational Shift') val = 4.8;
        else val = 76.5;
        status = 'warning';
      } else if (mode === 'critical') {
        if (sensor.type === 'Temperature') val = 89.6;
        else if (sensor.type === 'Gas Concentration') val = 680;
        else if (sensor.type === 'Vibrational Shift') val = 9.2;
        else val = 92.4;
        status = 'critical';
      }

      const history = [...sensor.history.slice(1), val];
      return {
        ...sensor,
        value: val,
        status,
        history,
        lastUpdated: 'Just now'
      };
    });

    this.simulatedSensors.set(updated);
  }

  // Diagram Node selection
  selectDiagramNode(id: string) {
    const nodes: Record<string, any> = {
      'sensors': {
        id: 'sensors',
        title: 'Sensor Hardware & Edge Nodes',
        type: 'Physical Hardware',
        color: '#2563EB',
        description: 'DHT22, MQ-2, and ADXL345 sensors connected via I2C/SPI to ESP32 microcontrollers sampling analog telemetry.',
        protocol: 'I2C / SPI / GPIO'
      },
      'mqtt-broker': {
        id: 'mqtt-broker',
        title: 'MQTT Messaging Broker (Mosquitto)',
        type: 'Data Communication',
        color: '#2563EB',
        description: 'Lightweight publish/subscribe messaging broker routing sensor topics (sensors/telemetry/#) with sub-millisecond overhead.',
        protocol: 'MQTT v3.1.1 / TCP Port 1883'
      },
      'nodered-engine': {
        id: 'nodered-engine',
        title: 'Node-RED Processing Flow Engine',
        type: 'Rule Engine & Orchestration',
        color: '#E11D48',
        description: 'Visual event-driven flow canvas executing debouncing, moving averages, risk threshold switches, and alerting rules.',
        protocol: 'Node-RED v3 / Node.js Engine'
      },
      'feathers-api': {
        id: 'feathers-api',
        title: 'FeathersJS Microservice API',
        type: 'REST & WebSocket Gateway',
        color: '#7C3AED',
        description: 'Feathers core service layers exposing REST endpoints (/api/articles, /api/inquiries) and Socket.io real-time channels.',
        protocol: 'HTTP REST / WebSockets Port 3030'
      },
      'sqlite-db': {
        id: 'sqlite-db',
        title: 'SQLite Database & Directus CMS',
        type: 'Relational Persistence',
        color: '#0D9488',
        description: 'SQLite 3 running in Write-Ahead Logging (WAL) mode for atomic, zero-overhead persistence reflected in Directus Studio.',
        protocol: 'Knex.js SQL / cms.sqlite File'
      },
      'dashboard-ui': {
        id: 'dashboard-ui',
        title: 'Angular 19 + Tailwind UI & Sinks',
        type: 'Presentation & Alarms',
        color: '#16A34A',
        description: 'Real-time telemetry dashboard, alert banners, and Directus Data Studio running on client web browsers.',
        protocol: 'Reactive Angular Signals / Tailwind CSS'
      }
    };

    if (nodes[id]) {
      this.activeDiagramNode.set(nodes[id]);
    }
  }

  openArticleReader(article: Article) {
    this.selectedArticle.set(article);
    if (article.id) {
      this.api.updateArticle(article.id, { views: (article.views || 0) + 1 }).subscribe(() => {
        article.views = (article.views || 0) + 1;
      });
    }
  }

  closeArticleReader() {
    this.selectedArticle.set(null);
  }

  openServiceModal(service: ServiceItem) {
    this.selectedService.set(service);
  }

  closeServiceModal() {
    this.selectedService.set(null);
  }

  submitInquiry() {
    if (!this.inquiryForm.name || !this.inquiryForm.email || !this.inquiryForm.message) {
      this.inquiryError.set('Please fill out all required fields: Name, Email, and Message.');
      return;
    }

    this.inquirySubmitting.set(true);
    this.inquiryError.set(null);

    this.api.createInquiry({
      ...this.inquiryForm,
      status: 'new'
    }).subscribe({
      next: (res: Inquiry) => {
        this.inquirySubmitting.set(false);
        this.inquirySuccess.set(`Thank you, ${res.name}! Your request (#${res.id}) has been recorded in the SQLite database and sent to the lab team.`);
        this.inquiryForm = {
          name: '',
          email: '',
          company: '',
          phone: '',
          service_interest: 'Risk Monitoring & Environmental Telemetry',
          subject: '',
          message: '',
          priority: 'normal'
        };
        setTimeout(() => this.inquirySuccess.set(null), 8000);
      },
      error: (err: any) => {
        this.inquirySubmitting.set(false);
        this.inquiryError.set('Failed to transmit request to Feathers API. Please check server status.');
      }
    });
  }

  parseFeatures(features: string | any): string[] {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return features.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return [features];
  }

  onSwitchToStudio(collection?: string) {
    this.switchToStudio.emit(collection || 'dashboard');
  }
}
