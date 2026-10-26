import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../services/api.service';
import { Article, ServiceItem, TeamMember, SiteSettings, Inquiry } from '../models/cms.models';
import { TOPIC_CURRICULUM_DATA, TopicDetailContent } from '../data/topic-curriculum.data';
import { TopicDetailComponent } from './topic-detail.component';
import { environment } from '../../environments/environment';

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
  isLive?: boolean;
}

export interface TutorialStep {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  completed: boolean;
  content: TutorialContent;
}

export interface TutorialContent {
  intro: string;
  objectives: string[];
  explanation: string;
  codeLanguage: string;
  codeLabel: string;
  code: string;
  practicalTip: string;
  youtubeQuery: string;
}

export interface DiagramNode {
  id: string;
  title: string;
  type: string;
  color: string;
  description: string;
  protocol: string;
  responsibilities: string[];
  communicates: string[];
}

export interface SetupGuideStep {
  id: number;
  title: string;
  category: string;
  instruction: string;
  badge?: string;
  code?: string;
  codeLanguage?: string;
  params?: { label: string; value: string }[];
  imageName: string;
  tip?: string;
}

@Component({
  selector: 'app-website',
  standalone: true,
  imports: [CommonModule, FormsModule, TopicDetailComponent],
  templateUrl: './website.component.html'
})
export class WebsiteComponent implements OnInit, OnDestroy {
  public api: ApiService = inject(ApiService);
  private sanitizer = inject(DomSanitizer);

  @Output() switchToStudio = new EventEmitter<string>();
  @ViewChild('dashboardIframe') dashboardIframe?: ElementRef<HTMLIFrameElement>;

  // ─── NAVIGATION ───────────────────────────────────────────────────────────
  activeNav = signal<string>('home');
  mobileMenuOpen = signal<boolean>(false);

  // ─── Node-RED Dashboard ─────────────────────────────────────────────────
  readonly nodeRedUrl = environment.nodeRedUrl;
  readonly nodeRedDashboardUrl = environment.nodeRedDashboardUrl;

  dashboardIframeUrl = signal<SafeResourceUrl>(
    this.sanitizer.bypassSecurityTrustResourceUrl(environment.nodeRedDashboardUrl)
  );
  dashboardLoading = signal<boolean>(true);
  dashboardError = signal<boolean>(false);
  dashboardConnected = signal<boolean>(false);
  dashboardFullscreen = signal<boolean>(false);
  dashboardLoadStartTime = 0;

  // ─── CMS DATA ─────────────────────────────────────────────────────────────
  settings = signal<SiteSettings>({
    site_name: 'Node-RED Academy',
    tagline: 'Industrial IoT, Edge Computing & Directus CMS Educational Platform',
    hero_title: 'Master Node-RED Flow Architecture & Industrial Edge Telemetry',
    hero_subtitle:
      'An interactive educational platform exploring risk telemetry pipelines, distributed edge microservices, and SQLite persistence orchestrated through Directus Headless CMS.',
    contact_email: 'lab@nodered-academy.edu',
    contact_phone: '+1 (800) 492-3000',
    office_address: 'Advanced IoT Systems Building, Science Park, Suite 400',
    primary_color: '#2563EB',
    inquiries_enabled: 1
  });

  articles = signal<Article[]>([]);
  services = signal<ServiceItem[]>([
    {
      id: 1,
      title: 'Risk Monitoring & Environmental Telemetry',
      slug: 'risk-monitoring-environmental-telemetry',
      category: 'Risk Telemetry',
      badge: 'Core Topic 01',
      icon: 'shield-alert',
      short_description: 'Real-time hazard detection, automated multi-tier threshold alerts, and sensor telemetry analysis utilizing Node-RED event processing.',
      detailed_description: 'Examine how physical safety networks continuously ingest analog sensor signals (flammable gas, structural vibration, ambient thermal variance). Students master configuring dynamic rule engines, exponential moving-average smoothing, and triggering audible or automated shutdown protocols.',
      features: JSON.stringify([
        'Multi-Tier Thresholds (Normal, Warning, Critical)',
        'MQTT & HTTP Telemetry Ingestion Flow Nodes',
        'Exponential Smoothing & Sensor Debouncing',
        'Automated Hazard Dispatch & Directus Event Logging'
      ]),
      order_num: 1,
      status: 'published'
    },
    {
      id: 2,
      title: 'Distributed Systems & Edge Computing',
      slug: 'distributed-systems-edge-computing',
      category: 'Distributed Systems',
      badge: 'Core Topic 02',
      icon: 'network',
      short_description: 'Deploying partitioned Node-RED flow architectures across edge controllers and central servers with offline resiliency.',
      detailed_description: 'Learn to design resilient topologies where microcontrollers publish to local edge gateways, sustaining operations during communication outages and synchronizing historical payloads to centralized Directus data models upon reconnection.',
      features: JSON.stringify([
        'Edge Gateway Node-RED Containerization',
        'Store-and-Forward Offline Buffering',
        'Microservice REST & WebSocket Communication',
        'Zero-Downtime Hot-Reload Flow Deployments'
      ]),
      order_num: 2,
      status: 'published'
    },
    {
      id: 3,
      title: 'Database Integration & SQLite/Directus Sync',
      slug: 'database-integration-sqlite-directus-sync',
      category: 'Database Architecture',
      badge: 'Core Topic 03',
      icon: 'database',
      short_description: 'Seamless relational persistence with SQLite in WAL mode, Knex service mappings, and Directus schema reflection.',
      detailed_description: 'Master writing high-throughput sensor telemetry into structured SQLite tables. Explore Knex ORM migrations, Feathers service event hooks, and automated UI reflection inside the Directus CMS Studio.',
      features: JSON.stringify([
        'SQLite Write-Ahead Logging (WAL) Configuration',
        'FeathersJS Knex Service CRUD Pipelines',
        'Directus Dynamic Schema Reflection & Field Studio',
        'Relational Audit Trail & Incident Logs'
      ]),
      order_num: 3,
      status: 'published'
    }
  ]);
  team = signal<TeamMember[]>([]);

  // ─── DEDICATED TOPIC MODULE WEB PAGES ──────────────────────────────────────
  readonly topicDetailsData = TOPIC_CURRICULUM_DATA;
  activeTopicPage = signal<TopicDetailContent | null>(null);
  topicDetailActiveTab = signal<'code' | 'flow' | 'hardware' | 'directus'>('code');
  copiedTopicCode = signal<boolean>(false);
  copiedFlowJson = signal<boolean>(false);
  completedLabSteps = signal<Set<number>>(new Set());

  // ─── MODAL / FILTER STATE ─────────────────────────────────────────────────
  selectedCategory = signal<string>('All');
  selectedArticle = signal<Article | null>(null);
  selectedService = signal<ServiceItem | null>(null);
  selectedTopic = signal<ServiceItem | null>(null);
  searchQuery = signal<string>('');
  tutorialSearch = signal<string>('');

  // ─── TUTORIAL STATE ────────────────────────────────────────────────────────
  activeTutorialStep = signal<number>(1);
  completedSteps = signal<Set<number>>(new Set());
  expandedStep = signal<number | null>(null);

  // ─── AUTHOR & RESEARCHER ───────────────────────────────────────────────────
  readonly authorName = 'David, Lance B.';

  // ─── ESP32 EDGE FIRMWARE & SENSORS ─────────────────────────────────────────
  selectedFirmwareTab = signal<'code' | 'wiring' | 'payload'>('code');
  copiedEsp32Code = signal<boolean>(false);

  // ─── MQTT & NODE-RED SETUP GUIDE (14 STEPS) ────────────────────────────────
  activeGuideStep = signal<number>(1);
  guideViewMode = signal<'spotlight' | 'grid'>('spotlight');
  copiedStepCode = signal<boolean>(false);
  selectedZoomImage = signal<{ src: string; title: string; stepNumber: number } | null>(null);
  imageErrorMap = signal<Record<number, boolean>>({});

  readonly setupGuideSteps: SetupGuideStep[] = [
    {
      id: 1,
      title: 'Open Node-RED & Palette Manager',
      category: 'Palette Setup',
      badge: 'Step 1 • Browser',
      instruction: 'Open Node-RED at http://YOUR_RASPBERRY_PI_IP:1880. Go to the menu (top right), then Manage palette, then the Install tab.',
      params: [
        { label: 'Target URL', value: 'http://YOUR_RASPBERRY_PI_IP:1880' },
        { label: 'Menu Navigation', value: 'Top-Right ☰ Menu → Manage palette → Install tab' }
      ],
      imageName: 'step-1.jpg',
      tip: 'Make sure your Raspberry Pi or host system is running Node-RED (port 1880) and accessible on your local network.'
    },
    {
      id: 2,
      title: 'Install @flowfuse/node-red-dashboard',
      category: 'Palette Setup',
      badge: 'Step 2 • Package',
      instruction: 'Search for @flowfuse/node-red-dashboard and click Install.',
      params: [
        { label: 'Package Name', value: '@flowfuse/node-red-dashboard' },
        { label: 'Action', value: 'Click "install" button and accept the prompt' }
      ],
      imageName: 'step-2.jpg',
      tip: 'This installs the modern FlowFuse Dashboard 2.0 component library with responsive Vue 3 widgets.'
    },
    {
      id: 3,
      title: 'Add MQTT In Node to Canvas',
      category: 'Broker Configuration',
      badge: 'Step 3 • Canvas',
      instruction: 'Drag an mqtt in node onto the canvas and double-click it.',
      params: [
        { label: 'Node Type', value: 'mqtt in (under network category in left palette)' },
        { label: 'Action', value: 'Drag onto canvas & double-click to open configuration tray' }
      ],
      imageName: 'step-3.jpg',
      tip: 'The mqtt in node connects to Mosquitto and subscribes to telemetry publications from the ESP32.'
    },
    {
      id: 4,
      title: 'Configure MQTT Broker Connection',
      category: 'Broker Configuration',
      badge: 'Step 4 • Broker',
      instruction: 'Next to Server, click the pencil icon to add a broker:\nServer: localhost\nPort: 1883',
      params: [
        { label: 'Server', value: 'localhost' },
        { label: 'Port', value: '1883' },
        { label: 'Broker Client ID', value: 'Auto-generated or custom (e.g. nodered-listener)' }
      ],
      imageName: 'step-4.jpg',
      tip: 'If Mosquitto runs on the same Raspberry Pi as Node-RED, use "localhost". Otherwise use the Raspberry Pi static IP.'
    },
    {
      id: 5,
      title: 'Set Topic, JSON Output & QoS',
      category: 'Broker Configuration',
      badge: 'Step 5 • Subscription',
      instruction: 'Set Topic to esp32/sensor_data.\nSet Output to a parsed JSON object.\nSet QoS to 0 or 1 and click Done.',
      params: [
        { label: 'Topic', value: 'esp32/sensor_data' },
        { label: 'Output', value: 'a parsed JSON object' },
        { label: 'QoS', value: '0 or 1' }
      ],
      imageName: 'step-5.jpg',
      tip: 'Choosing "a parsed JSON object" automatically parses the ESP32 JSON string into a native JavaScript object in msg.payload.'
    },
    {
      id: 6,
      title: 'Add Function Node with 4 Outputs',
      category: 'Data Processing',
      badge: 'Step 6 • Function',
      instruction: 'Add a function node after the mqtt in node. Set Outputs to 4 on the Setup tab',
      params: [
        { label: 'Node Type', value: 'function (from function category)' },
        { label: 'Setup Tab', value: 'Outputs: 4' },
        { label: 'Wiring', value: 'Wire mqtt in node output to function node input' }
      ],
      imageName: 'step-6.jpg',
      tip: 'Configuring 4 outputs provides dedicated wiring pins for Distance, Soil Moisture, Light, and RSSI telemetry streams.'
    },
    {
      id: 7,
      title: 'Paste Telemetry Routing Script',
      category: 'Data Processing',
      badge: 'Step 7 • JavaScript',
      instruction: 'Paste this into the On Message tab:\n\nconst d = msg.payload;\n\nreturn [\n  { payload: d.distance_cm === null ? "No echo" : d.distance_cm.toFixed(1) + " cm" },\n  { payload: d.soil_percent },\n  { payload: d.light_lux },\n  { payload: d.rssi }\n];',
      code: `const d = msg.payload;

return [
  { payload: d.distance_cm === null ? "No echo" : d.distance_cm.toFixed(1) + " cm" },
  { payload: d.soil_percent },
  { payload: d.light_lux },
  { payload: d.rssi }
];`,
      codeLanguage: 'javascript',
      params: [
        { label: 'Terminal 1', value: 'd.distance_cm ("No echo" or formatted "X.X cm")' },
        { label: 'Terminal 2', value: 'd.soil_percent (0-100% moisture)' },
        { label: 'Terminal 3', value: 'd.light_lux (light intensity in lux)' },
        { label: 'Terminal 4', value: 'd.rssi (Wi-Fi signal strength in dBm)' }
      ],
      imageName: 'step-7.jpg',
      tip: 'Returning an array of 4 objects routes each object directly to the corresponding numeric output index (1, 2, 3, 4).'
    },
    {
      id: 8,
      title: 'Add Widget & Create Page and Group',
      category: 'UI Widgets & History',
      badge: 'Step 8 • Page & Group',
      instruction: 'Add a widget text. The first time, you’ll create a page and group from inside the first widget’s settings, and you can reuse them afterwards. Each widget needs a Group. Click the pencil next to Group, then create a new Page (for example “Sensors”) and a new Group (for example “Readings”).',
      params: [
        { label: 'Page Name', value: 'Sensors' },
        { label: 'Group Name', value: 'Readings' },
        { label: 'Scope', value: 'Reusable by all dashboard widgets' }
      ],
      imageName: 'step-8.jpg',
      tip: 'Pages define URL paths and Groups render responsive layout cards. You only need to create them once, then select them.'
    },
    {
      id: 9,
      title: 'Output 1 -> Distance Text Widget',
      category: 'UI Widgets & History',
      badge: 'Step 9 • Output 1',
      instruction: 'Output 1 -> text widget Label: “Distance”',
      params: [
        { label: 'Source', value: 'Function Output 1 (Distance)' },
        { label: 'Widget Type', value: 'ui-text' },
        { label: 'Label', value: 'Distance' },
        { label: 'Group', value: 'Sensors > Readings' }
      ],
      imageName: 'step-9.jpg',
      tip: 'Wire Output 1 of the function node to this text widget. Displays formatted distance or "No echo".'
    },
    {
      id: 10,
      title: 'Output 2 -> Soil Moisture Gauge',
      category: 'UI Widgets & History',
      badge: 'Step 10 • Output 2',
      instruction: 'Output 2 -> Gauge widget Label: “Soil Moisture”, range 0 to 100, unit %',
      params: [
        { label: 'Source', value: 'Function Output 2 (Soil)' },
        { label: 'Widget Type', value: 'ui-gauge' },
        { label: 'Label', value: 'Soil Moisture' },
        { label: 'Range', value: '0 to 100' },
        { label: 'Unit', value: '%' }
      ],
      imageName: 'step-10.jpg',
      tip: 'Wire Output 2 to this gauge. It provides instant visual dial feedback for capacitive soil moisture.'
    },
    {
      id: 11,
      title: 'Output 3 -> Light Intensity Gauge',
      category: 'UI Widgets & History',
      badge: 'Step 11 • Output 3',
      instruction: 'Output 3 -> Gauge widget Label: “Light Intensity”, range 0 to 10000, unit lux',
      params: [
        { label: 'Source', value: 'Function Output 3 (Light)' },
        { label: 'Widget Type', value: 'ui-gauge' },
        { label: 'Label', value: 'Light Intensity' },
        { label: 'Range', value: '0 to 10000' },
        { label: 'Unit', value: 'lux' }
      ],
      imageName: 'step-11.jpg',
      tip: 'Wire Output 3 to this gauge. Tracks ambient illuminance in lux.'
    },
    {
      id: 12,
      title: 'Output 3 -> Light History Chart',
      category: 'UI Widgets & History',
      badge: 'Step 12 • Output 3',
      instruction: 'Output 3 -> Chart widget Label: “Light Intensity history”, type Line, X-axis: last 10 seconds',
      params: [
        { label: 'Source', value: 'Function Output 3 (Light - branched wire)' },
        { label: 'Widget Type', value: 'ui-chart' },
        { label: 'Label', value: 'Light Intensity history' },
        { label: 'Type', value: 'Line' },
        { label: 'X-axis Window', value: 'last 10 seconds' }
      ],
      imageName: 'step-12.jpg',
      tip: 'You can branch multiple wires from Output 3: one to the Gauge for current value, and one to this Chart for temporal trend.'
    },
    {
      id: 13,
      title: 'Output 2 -> Soil History Chart',
      category: 'UI Widgets & History',
      badge: 'Step 13 • Output 2',
      instruction: 'Output 2 -> Chart widget Label: “Soil history”, same settings',
      params: [
        { label: 'Source', value: 'Function Output 2 (Soil - branched wire)' },
        { label: 'Widget Type', value: 'ui-chart' },
        { label: 'Label', value: 'Soil history' },
        { label: 'Type', value: 'Line' },
        { label: 'X-axis Window', value: 'last 10 seconds' }
      ],
      imageName: 'step-13.jpg',
      tip: 'Branch a second wire from Output 2 to this Chart widget to graph soil moisture stability in real time.'
    },
    {
      id: 14,
      title: 'Deploy Flow & Open Live Dashboard',
      category: 'Deploy & Verification',
      badge: 'Step 14 • Complete',
      instruction: 'Click the red Deploy button.\nOpen http://RASPBERRY_PI_IP:1880/dashboard in a browser. You should see values update every 5 seconds.',
      params: [
        { label: 'Deploy Action', value: 'Click the red "Deploy" button (top-right header)' },
        { label: 'Dashboard URL', value: 'http://YOUR_RASPBERRY_PI_IP:1880/dashboard' },
        { label: 'Expected Cadence', value: 'Telemetry updates every 5 seconds' }
      ],
      imageName: 'step-14.jpg',
      tip: 'The live dashboard is now active! You can view it directly in your browser or embed it within this CMS site.'
    }
  ];

  // ─── ARCHITECTURE DIAGRAM ─────────────────────────────────────────────────
  activeDiagramNode = signal<DiagramNode>({
    id: 'nodered-engine',
    title: 'Node-RED Flow Runtime',
    type: 'Event Processing Core',
    color: '#E11D48',
    description:
      'Ingests MQTT payloads from ESP32, applies moving averages, executes rule switches, and dispatches alerts to Feathers API endpoints.',
    protocol: 'Internal Event Loop / Node.js Engine',
    responsibilities: [
      'Subscribe to MQTT sensor topics (esp32/sensor_data)',
      'Apply moving-average smoothing to Ultrasonic, Soil, and Light telemetry',
      'Execute threshold switch rules and hazard triggers',
      'Forward alerts to Feathers REST API and SQLite',
      'Serve live dashboard at /dashboard'
    ],
    communicates: ['Mosquitto MQTT Broker (inbound)', 'FeathersJS API (outbound HTTP)', 'Angular Dashboard (WebSocket/iframe)']
  });

  readonly esp32Code: string = `#include <Wire.h>
#include <BH1750.h>
BH1750 lightMeter;
void setup() {
  Serial.begin(115200);
  delay(1000);
  Wire.begin(21, 22);
  Serial.println("ESP32 LIGHT SENSOR - BH1750");
  Serial.println("---------------------------");
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("BH1750 sensor ready!");
  } else {
    Serial.println("ERROR: BH1750 not detected!");
    Serial.println("Check SDA, SCL, VCC, and GND.");
    while (1) {
      delay(100);
    }
  }
}
void loop() {
  float lux = lightMeter.readLightLevel();
  if (lux >= 0) {
    Serial.print("Light Intensity: ");
    Serial.print(lux, 2);
    Serial.println(" lux");
  } else {
    Serial.println("Failed to read light sensor!");
  }
  delay(1000);
}`

  copyEsp32Code() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.esp32Code).then(() => {
        this.copiedEsp32Code.set(true);
        setTimeout(() => this.copiedEsp32Code.set(false), 2500);
      });
    }
  }

  // ─── TUTORIALS DATA ────────────────────────────────────────────────────────
  readonly tutorials: TutorialStep[] = [
    {
      id: 1,
      title: 'Introduction to Node-RED',
      subtitle: 'What is Node-RED and why use it for IoT?',
      category: 'Foundations',
      completed: false,
      content: {
        intro: 'Node-RED is a flow-based development tool for visual programming, built on Node.js. Originally developed by IBM for wiring together hardware devices, APIs, and online services, it is now a cornerstone tool for IoT solutions.',
        objectives: [
          'Understand what Node-RED is and its history',
          'Know the difference between flow-based and traditional programming',
          'Identify key use cases: IoT, home automation, data pipelines',
          'Understand how Node-RED fits into the IoT stack'
        ],
        explanation: 'Node-RED uses a browser-based flow editor to wire together nodes. Each node performs a specific function — reading from MQTT, transforming data, writing to a database, or sending an alert. Messages flow between nodes as JavaScript objects. This makes it ideal for rapid prototyping and for non-programmers to build complex IoT workflows.',
        codeLanguage: 'json',
        codeLabel: 'Simple Node-RED Flow (JSON export)',
        code: `[
  {
    "id": "inject-1",
    "type": "inject",
    "name": "Every 5 seconds",
    "repeat": "5",
    "payload": "Hello from Node-RED",
    "wires": [["debug-1"]]
  },
  {
    "id": "debug-1",
    "type": "debug",
    "name": "Show in Debug Panel",
    "active": true
  }
]`,
        practicalTip: 'Install Node-RED globally with: npm install -g --unsafe-perm node-red. Then run with: node-red. Access the editor at http://localhost:1880',
        youtubeQuery: 'Introduction to Node-RED for beginners IoT'
      }
    },
    {
      id: 2,
      title: 'Node-RED Interface & Workspace',
      subtitle: 'Navigating the flow editor and panels',
      category: 'Foundations',
      completed: false,
      content: {
        intro: 'The Node-RED workspace consists of the node palette on the left, the flow canvas in the center, the info and debug panels on the right, and the deploy button at the top. Understanding this layout is essential for efficient development.',
        objectives: [
          'Navigate the Node-RED editor interface',
          'Use the node palette to find and add nodes',
          'Understand the flow canvas and how to wire nodes',
          'Use the Debug sidebar to inspect messages',
          'Deploy flows and understand what deployment means'
        ],
        explanation: 'The flow canvas is where you build flows by dragging nodes from the palette. Double-click any node to configure it. The Debug panel shows messages passed to debug nodes. The Info panel shows documentation for selected nodes. Flows are saved by clicking Deploy — this compiles and runs your flow.',
        codeLanguage: 'javascript',
        codeLabel: 'Accessing Node-RED settings via flows.json',
        code: `// Node-RED stores flows in: ~/.node-red/flows.json
// Settings are in: ~/.node-red/settings.js

// Key settings to configure:
module.exports = {
  uiPort: 1880,              // Editor port
  httpAdminRoot: '/editor',  // Editor URL path
  httpNodeRoot: '/api',      // HTTP-in node root path
  userDir: '/home/pi/.node-red/',
  functionGlobalContext: {
    // Global variables accessible in function nodes
    os: require('os')
  }
}`,
        practicalTip: 'Use Ctrl+Z to undo, Ctrl+F to search for nodes, and Ctrl+A to select all. The keyboard shortcut Ctrl+D deploys the flow.',
        youtubeQuery: 'Node-RED interface walkthrough editor workspace tutorial'
      }
    },
    {
      id: 3,
      title: 'Understanding Nodes and Flows',
      subtitle: 'Core concepts: nodes, wires, and messages',
      category: 'Core Concepts',
      completed: false,
      content: {
        intro: 'In Node-RED, everything revolves around three core concepts: nodes (processing units), wires (connections), and messages (data packets). Mastering these concepts unlocks the full power of Node-RED.',
        objectives: [
          'Understand the message object structure (msg.payload, msg.topic)',
          'Know the difference between input and output nodes',
          'Understand how wires pass messages between nodes',
          'Identify common node types: inject, debug, function, http-in, mqtt'
        ],
        explanation: 'Every message in Node-RED is a JavaScript object. The most important property is msg.payload — the main data body. msg.topic is used for routing (especially with MQTT). You can add any custom properties. Nodes receive messages on input ports (left side) and send them on output ports (right side).',
        codeLanguage: 'javascript',
        codeLabel: 'Anatomy of a Node-RED message object',
        code: `// A typical sensor message flowing through Node-RED:
msg = {
  payload: {
    sensor_id: "temp-1",
    temperature: 38.4,
    humidity: 52.1,
    timestamp: "2026-10-24T12:00:00Z"
  },
  topic: "sensors/telemetry/dht22",
  _msgid: "abc123",
  // Custom properties you can add:
  isHazard: false,
  smoothed: 37.8
};

// Access in a function node:
let temp = msg.payload.temperature;
let topic = msg.topic;
return msg;  // Always return msg to pass it forward`,
        practicalTip: 'Always use msg.payload for the main data. Never delete msg._msgid as it is used for tracking. Use context.set() for persistent state between messages.',
        youtubeQuery: 'Node-RED nodes wires messages explained tutorial'
      }
    },
    {
      id: 4,
      title: 'Creating Your First Flow',
      subtitle: 'Build a hello-world IoT pipeline step by step',
      category: 'Getting Started',
      completed: false,
      content: {
        intro: 'Your first flow will read a simulated sensor value every 5 seconds and display it in the debug panel. This establishes the fundamental inject → process → output pattern used in all Node-RED IoT pipelines.',
        objectives: [
          'Create a new flow tab',
          'Add and configure an Inject node',
          'Add and wire a Function node for processing',
          'Add a Debug node to view output',
          'Deploy and test the flow'
        ],
        explanation: 'Drag an Inject node from the palette. Set it to repeat every 5 seconds with a random number payload. Wire it to a Function node that formats the data as a sensor reading. Wire that to a Debug node. Click Deploy and open the Debug panel to see messages flowing every 5 seconds.',
        codeLanguage: 'javascript',
        codeLabel: 'Function node: Simulate sensor reading',
        code: `// Function node: "Format Sensor Reading"
// Receives: msg.payload = random number from Inject
// Outputs: formatted sensor object

let rawValue = msg.payload;

// Simulate temperature between 20°C and 50°C
let temperature = 20 + (rawValue * 30);

msg.payload = {
  sensor_id: "temp-sim-1",
  temperature: parseFloat(temperature.toFixed(1)),
  unit: "°C",
  status: temperature > 45 ? "WARNING" :
          temperature > 35 ? "NORMAL" : "NORMAL",
  timestamp: new Date().toISOString()
};

msg.topic = "sensors/simulated/temperature";

return msg;`,
        practicalTip: 'Use the Inject node\'s "Inject once after X seconds" option to trigger the flow immediately on deploy. This is useful for testing.',
        youtubeQuery: 'Node-RED create first flow beginner tutorial step by step'
      }
    },
    {
      id: 5,
      title: 'Inject and Debug Nodes',
      subtitle: 'Triggering flows and inspecting message payloads',
      category: 'Core Nodes',
      completed: false,
      content: {
        intro: 'The Inject node is the trigger for most Node-RED flows, and the Debug node is your main tool for inspecting what is flowing through your pipeline. Together they form the backbone of Node-RED development and testing.',
        objectives: [
          'Configure Inject node for different payload types (string, number, JSON, timestamp)',
          'Set up repeating intervals and cron-style scheduling',
          'Use Debug node to inspect full message objects',
          'Filter debug output by topic',
          'Use the Debug sidebar effectively'
        ],
        explanation: 'The Inject node supports payloads of type: string, number, boolean, JSON object, Buffer, timestamp, or environment variable. You can inject once, on startup, at a fixed interval, or on a cron schedule. The Debug node can output msg.payload (default), msg (full object), or any specified property.',
        codeLanguage: 'json',
        codeLabel: 'Inject node with JSON payload (flow export)',
        code: `{
  "id": "inject-sensor",
  "type": "inject",
  "name": "Trigger Sensor Read",
  "props": [
    {
      "p": "payload",
      "v": "{\"sensor\":\"dht22\",\"pin\":4}",
      "vt": "json"
    },
    {
      "p": "topic",
      "v": "sensors/request/read",
      "vt": "str"
    }
  ],
  "repeat": "5",
  "crontab": "",
  "once": true,
  "onceDelay": 0.1,
  "wires": [["function-process"]]
}`,
        practicalTip: 'Right-click any wire to add a debug node inline. This lets you inspect data at any point in your flow without rewiring. Use "Complete msg object" in the Debug node to see all properties.',
        youtubeQuery: 'Node-RED inject debug node tutorial complete guide'
      }
    },
    {
      id: 6,
      title: 'Function Nodes',
      subtitle: 'Writing JavaScript logic inside Node-RED',
      category: 'Core Nodes',
      completed: false,
      content: {
        intro: 'The Function node lets you write any JavaScript code to process messages. It is the most powerful core node in Node-RED, allowing you to implement business logic, data transformation, threshold checking, and complex routing.',
        objectives: [
          'Write JavaScript functions that process msg objects',
          'Use flow context to store persistent state',
          'Use global context for shared data between flows',
          'Return multiple outputs from a single function',
          'Handle errors with try-catch in function nodes'
        ],
        explanation: 'Function nodes run in a sandboxed Node.js environment. They have access to flow.get/set() for flow-scoped variables, global.get/set() for globally shared state, context.get/set() for node-scoped state, and node.send() for async message sending. You can return an array to send to multiple outputs.',
        codeLanguage: 'javascript',
        codeLabel: 'Advanced Function node: Moving average + threshold switch',
        code: `// Function node: Moving Average Risk Calculator
// Setup: 2 outputs — [Normal, Warning/Critical]

const WINDOW_SIZE = 5;
let history = flow.get('temp_history') || [];

// Add current reading to history
history.push(msg.payload.temperature);
if (history.length > WINDOW_SIZE) history.shift();
flow.set('temp_history', history);

// Calculate moving average
const avg = history.reduce((a, b) => a + b, 0) / history.length;
msg.payload.smoothed_temp = parseFloat(avg.toFixed(2));
msg.payload.window_size = history.length;

// Determine risk level
if (avg >= 75) {
  msg.payload.risk_level = 'CRITICAL';
  msg.payload.alert = true;
  return [null, msg];  // Route to output 2 (warning)
} else if (avg >= 45) {
  msg.payload.risk_level = 'WARNING';
  msg.payload.alert = true;
  return [null, msg];
} else {
  msg.payload.risk_level = 'NORMAL';
  msg.payload.alert = false;
  return [msg, null];  // Route to output 1 (normal)
}`,
        practicalTip: 'Set the number of outputs in the function node configuration panel. Use node.warn() and node.error() for logging — these appear in the Debug panel with different formatting.',
        youtubeQuery: 'Node-RED function node JavaScript tutorial context state'
      }
    },
    {
      id: 7,
      title: 'MQTT Communication',
      subtitle: 'Publish and subscribe to sensor topics',
      category: 'Protocols',
      completed: false,
      content: {
        intro: 'MQTT (Message Queuing Telemetry Transport) is the primary protocol for IoT sensor communication. It is lightweight, designed for constrained devices, and uses a publish-subscribe model. Node-RED has built-in MQTT nodes that make integration effortless.',
        objectives: [
          'Understand the MQTT publish-subscribe model',
          'Configure an MQTT broker connection in Node-RED',
          'Subscribe to sensor topics with mqtt-in nodes',
          'Publish processed data with mqtt-out nodes',
          'Use QoS levels and retained messages correctly'
        ],
        explanation: 'MQTT works by having a central broker (like Mosquitto) that routes messages between publishers and subscribers. Sensors (ESP32) publish to topics like "sensors/telemetry/temperature". Node-RED subscribes to these topics and processes the incoming JSON payloads. Use "#" as a wildcard to subscribe to all sub-topics.',
        codeLanguage: 'bash',
        codeLabel: 'Mosquitto MQTT broker setup and testing',
        code: `# Install Mosquitto on Raspberry Pi 5 / Ubuntu Server
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients -y

# Enable and start the broker
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Configure Mosquitto for remote access (/etc/mosquitto/conf.d/default.conf)
listener 1883 0.0.0.0
allow_anonymous true
log_type all

# Test: Subscribe to all sensor topics
mosquitto_sub -h 10.219.89.43 -t "sensors/#" -v

# Test: Publish a simulated sensor reading
mosquitto_pub -h 10.219.89.43 -t "sensors/telemetry/temperature" \\
  -m '{"sensor_id":"temp-1","temperature":38.4,"unit":"C"}'`,
        practicalTip: 'In Node-RED, create a shared MQTT broker configuration node — all MQTT-in and MQTT-out nodes can reuse it. Set QoS to 1 for at-least-once delivery for important sensor data.',
        youtubeQuery: 'Node-RED MQTT tutorial subscribe publish sensor IoT Mosquitto'
      }
    },
    {
      id: 8,
      title: 'Connecting Sensors (ESP32)',
      subtitle: 'Reading sensor data and publishing to MQTT',
      category: 'Hardware',
      completed: false,
      content: {
        intro: 'The ESP32 microcontroller is the ideal edge device for this project — it has built-in Wi-Fi, analog-to-digital converters (ADC), I2C/SPI interfaces, and is compatible with the Arduino framework. It reads sensors and publishes data via MQTT to Node-RED.',
        objectives: [
          'Wire DHT22 (temperature/humidity) and MQ-2 (gas) sensors to ESP32',
          'Read analog and digital sensor values with Arduino code',
          'Connect ESP32 to Wi-Fi and MQTT broker',
          'Publish structured JSON telemetry at regular intervals',
          'Handle brownout and reconnection logic'
        ],
        explanation: 'The ESP32 reads sensor values through its GPIO pins. DHT22 uses a single-wire digital protocol (pin 4). MQ-2 outputs an analog voltage proportional to gas concentration (pin 34). The ADXL345 accelerometer communicates via I2C (SDA=21, SCL=22). PubSubClient library handles MQTT publishing.',
        codeLanguage: 'cpp',
        codeLabel: 'ESP32 firmware: Multi-sensor MQTT publisher',
        code: `#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "YourNetworkSSID";
const char* WIFI_PASS = "YourPassword";
const char* MQTT_HOST = "10.219.89.43";
const int   MQTT_PORT = 1883;

#define DHT_PIN  4
#define GAS_PIN  34
DHT dht(DHT_PIN, DHT22);

WiFiClient espClient;
PubSubClient mqtt(espClient);

void publishTelemetry() {
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  int gasRaw = analogRead(GAS_PIN);
  float ppm  = map(gasRaw, 0, 4095, 20, 1000);

  StaticJsonDocument<256> doc;
  doc["sensor_id"] = "esp32-lab-01";
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["gas_ppm"] = ppm;
  doc["timestamp"] = millis();

  char buffer[256];
  serializeJson(doc, buffer);
  mqtt.publish("sensors/telemetry/all", buffer);
}

void loop() {
  if (!mqtt.connected()) reconnect();
  mqtt.loop();
  publishTelemetry();
  delay(2000);  // Publish every 2 seconds
}`,
        practicalTip: 'Use a 4.7kΩ pull-up resistor on the DHT22 data line. Power the MQ-2 from 5V but read its analog output through a voltage divider (to keep ADC input ≤3.3V on ESP32).',
        youtubeQuery: 'ESP32 DHT22 MQ-2 MQTT sensor publish tutorial Arduino IoT'
      }
    },
    {
      id: 9,
      title: 'Database Integration',
      subtitle: 'Storing sensor data in SQLite and InfluxDB',
      category: 'Data Storage',
      completed: false,
      content: {
        intro: 'Sensor data is only useful if it is stored persistently and queryable. This tutorial covers integrating Node-RED with SQLite for relational storage (via FeathersJS), and introduces InfluxDB for time-series data — the optimal database for sensor telemetry.',
        objectives: [
          'Use the node-red-node-sqlite node to write data directly from flows',
          'Connect to FeathersJS REST API from Node-RED using http-request nodes',
          'Understand the difference between relational (SQLite) and time-series (InfluxDB) storage',
          'Query stored data and send it back to the dashboard',
          'Handle database write failures with retry logic'
        ],
        explanation: 'SQLite is best for structured CMS data (articles, settings, inquiries) managed via Directus. InfluxDB is ideal for high-frequency sensor time-series data with built-in retention policies and aggregation queries. In this project, Node-RED POSTs sensor readings to the FeathersJS API, which writes them to SQLite using Knex.js ORM.',
        codeLanguage: 'javascript',
        codeLabel: 'Node-RED → FeathersJS API → SQLite: HTTP request node setup',
        code: `// Function node: "Prepare API payload"
// Runs before an HTTP Request node (POST)

msg.url = "http://localhost:3030/api/telemetry";
msg.method = "POST";
msg.headers = {
  "Content-Type": "application/json"
};

msg.payload = {
  sensor_id:   msg.payload.sensor_id,
  type:        "temperature",
  value:       msg.payload.temperature,
  unit:        "°C",
  risk_level:  msg.payload.risk_level,
  recorded_at: new Date().toISOString()
};

return msg;

// ─── SQLite WAL mode (backend/src/db.js) ───────────────
// knex({ client: 'sqlite3',
//   connection: { filename: './data/cms.sqlite' },
//   useNullAsDefault: true
// }).raw("PRAGMA journal_mode=WAL")`,
        practicalTip: 'Install the SQLite node: go to Menu → Manage Palette → Install → search "node-red-node-sqlite". For InfluxDB use "node-red-contrib-influxdb". InfluxDB is recommended for any data sampled more than once per minute.',
        youtubeQuery: 'Node-RED SQLite InfluxDB database integration tutorial IoT sensor data'
      }
    },
    {
      id: 10,
      title: 'Building Dashboards',
      subtitle: 'Create real-time UI with node-red-dashboard',
      category: 'Visualization',
      completed: false,
      content: {
        intro: 'The node-red-dashboard package adds a complete set of UI nodes to create web-based dashboards directly from Node-RED flows. Your live dashboard at http://10.219.89.43:1880/dashboard was created using these nodes — this tutorial shows you how.',
        objectives: [
          'Install and configure node-red-dashboard',
          'Create groups, tabs, and layouts',
          'Add gauge, chart, and text widgets for sensor display',
          'Add button and slider controls for interactive flows',
          'Use ui_template nodes for custom HTML/CSS widgets'
        ],
        explanation: 'Dashboard nodes appear in a separate "dashboard" section of the palette. Each widget belongs to a group (like a card) within a tab (like a page). The Chart node supports line, bar, and pie charts with real-time updates. Gauge nodes display a single value with configurable min/max and color ranges matching your thresholds.',
        codeLanguage: 'javascript',
        codeLabel: 'Function node: Format data for Dashboard chart',
        code: `// Format sensor history for node-red-dashboard chart node
// The chart node expects: [{series:[], data:[[]], labels:[]}]

let history = flow.get('temp_history') || [];
history.push(msg.payload.temperature);
if (history.length > 20) history.shift();
flow.set('temp_history', history);

// Send to chart node (line chart format)
msg.payload = [{
  series: ["Temperature °C"],
  data: [history.map((v, i) => ({ x: i, y: v }))],
  labels: [""]
}];

return msg;

// ─── Dashboard gauge threshold colors ───────────────────
// Gauge node configuration:
// Segments: 0-45 green | 45-75 yellow | 75-100 red
// Min: 0, Max: 100, Units: °C`,
        practicalTip: 'Access your dashboard at http://YOUR-IP:1880/dashboard. Install dashboard with: npm install node-red-dashboard (in ~/.node-red). Remember to restart Node-RED after installation.',
        youtubeQuery: 'Node-RED dashboard tutorial gauge chart real-time IoT sensor'
      }
    },
    {
      id: 11,
      title: 'Monitoring & Analyzing Sensor Data',
      subtitle: 'Alerts, thresholds, and data analytics pipelines',
      category: 'Analytics',
      completed: false,
      content: {
        intro: 'Raw sensor data is only useful when analyzed and acted upon. This tutorial covers building a complete monitoring pipeline: smoothing noisy data, applying threshold rules, generating alerts, and producing analytical summaries.',
        objectives: [
          'Implement exponential moving average (EMA) in function nodes',
          'Build switch nodes for threshold-based routing',
          'Send email or HTTP alerts when thresholds are exceeded',
          'Aggregate historical data with join and batch nodes',
          'Calculate statistics (min, max, average) over time windows'
        ],
        explanation: 'A Switch node routes messages to different outputs based on conditions (e.g., payload.temperature > 75 → critical output). Combine with a Rate Limit node to prevent alert storms. Use the Join node to batch readings into windows before aggregating. The Delay node adds backpressure to prevent overloading downstream services.',
        codeLanguage: 'javascript',
        codeLabel: 'EMA filter + dual-threshold alert pipeline',
        code: `// Function node: EMA Smoother + Alert Generator
const ALPHA = 0.3;  // EMA smoothing factor (0=heavy smoothing, 1=no smoothing)
const WARN_THRESHOLD  = 45;
const CRIT_THRESHOLD  = 75;

// Calculate Exponential Moving Average
let prevEMA = flow.get('ema_temp') || msg.payload.temperature;
let ema = ALPHA * msg.payload.temperature + (1 - ALPHA) * prevEMA;
flow.set('ema_temp', ema);

msg.payload.raw_temp  = msg.payload.temperature;
msg.payload.ema_temp  = parseFloat(ema.toFixed(2));
msg.payload.spike     = Math.abs(msg.payload.temperature - prevEMA) > 5;

// Generate alert payload
if (ema >= CRIT_THRESHOLD) {
  msg.alert = {
    level: 'CRITICAL',
    message: \`🚨 CRITICAL: Temperature \${ema.toFixed(1)}°C exceeds \${CRIT_THRESHOLD}°C\`,
    action: 'SHUTDOWN_REQUIRED'
  };
  return [null, null, msg];  // → output 3 (critical)
} else if (ema >= WARN_THRESHOLD) {
  msg.alert = { level: 'WARNING', message: \`⚠️ WARNING: Temperature at \${ema.toFixed(1)}°C\` };
  return [null, msg, null];  // → output 2 (warning)
} else {
  return [msg, null, null];  // → output 1 (normal)
}`,
        practicalTip: 'Use the node-red-contrib-moment node for time-based analytics. Combine with the Aggregator node to calculate hourly/daily averages. Store analytics results in a separate SQLite table for trend visualization.',
        youtubeQuery: 'Node-RED sensor monitoring threshold alerts analytics pipeline tutorial'
      }
    },
    {
      id: 12,
      title: 'Deploying Node-RED on a Server',
      subtitle: 'Production setup on Raspberry Pi 5 & Ubuntu Server',
      category: 'Deployment',
      completed: false,
      content: {
        intro: 'Deploying Node-RED for production on a Raspberry Pi 5 or Ubuntu server requires proper configuration: running as a system service, securing the editor, enabling HTTPS, and setting up automatic restarts. This tutorial covers a production-ready deployment.',
        objectives: [
          'Install Node-RED as a systemd service for automatic startup',
          'Configure Node-RED admin authentication',
          'Set up PM2 as a process manager for reliability',
          'Configure the Angular frontend to point to the correct Node-RED IP',
          'Set up Docker containerization for consistent deployment'
        ],
        explanation: 'For Raspberry Pi 5, use the official install script. For Ubuntu Server, install via npm and create a systemd service. Use PM2 for process management — it auto-restarts on crashes and supports log rotation. Secure the editor with username/password in settings.js. Update the Angular environment.ts file to point to the Pi\'s IP address.',
        codeLanguage: 'bash',
        codeLabel: 'Raspberry Pi 5 production deployment script',
        code: `# ─── Raspberry Pi 5 / Ubuntu Server Setup ───────────────────

# 1. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install Node-RED
sudo npm install -g --unsafe-perm node-red

# 3. Install node-red-dashboard
cd ~/.node-red && npm install node-red-dashboard

# 4. Create systemd service
sudo nano /etc/systemd/system/nodered.service
# [Unit]
# Description=Node-RED
# After=network.target
# [Service]
# ExecStart=/usr/bin/node-red --settings /home/pi/.node-red/settings.js
# User=pi
# WorkingDirectory=/home/pi
# Restart=on-failure
# [Install]
# WantedBy=multi-user.target

sudo systemctl enable nodered
sudo systemctl start nodered

# 5. Update Angular frontend to point to Pi's IP
# Edit: frontend/src/environments/environment.ts
# Set: nodeRedDashboardUrl = 'http://192.168.x.x:1880/dashboard'

# 6. Check Node-RED logs
sudo journalctl -u nodered -f`,
        practicalTip: 'Use the Raspberry Pi\'s static IP (set in /etc/dhcpcd.conf) to ensure the Node-RED URL never changes. Update the nodeRedUrl in environment.ts before building the Angular app for deployment.',
        youtubeQuery: 'Node-RED Raspberry Pi production deployment systemd service tutorial'
      }
    }
  ];

  // ─── COMPUTED ──────────────────────────────────────────────────────────────
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
    this.articles().forEach(a => { if (a.category) cats.add(a.category); });
    return Array.from(cats);
  });

  filteredTutorials = computed(() => {
    const q = this.tutorialSearch().toLowerCase().trim();
    if (!q) return this.tutorials;
    return this.tutorials.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.subtitle.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  completionPercent = computed(() => {
    const total = this.tutorials.length;
    const done = this.completedSteps().size;
    return Math.round((done / total) * 100);
  });

  tutorialCategories = computed(() => {
    const cats = new Set<string>();
    this.tutorials.forEach(t => cats.add(t.category));
    return Array.from(cats);
  });

  currentTutorial = computed(() => {
    const step = this.activeTutorialStep();
    return this.tutorials.find(t => t.id === step) || this.tutorials[0];
  });

  diagramNodes: Record<string, DiagramNode> = {
    'sensors': {
      id: 'sensors',
      title: 'Sensor Hardware & ESP32 Edge Node',
      type: 'Physical Hardware Layer',
      color: '#2563EB',
      description: 'ESP32 running the BH1750 light sensor sketch. The sensor connects over I²C (SDA GPIO 21, SCL GPIO 22) and reports illuminance in lux over Serial.',
      protocol: 'I²C / Serial 115200 baud',
      responsibilities: [
        'Read ambient illuminance in lux from the BH1750 over I²C',
        'Report readings over Serial once per second'
      ],
      communicates: ['BH1750 via I²C (GPIO 21/22)', 'Serial Monitor at 115200 baud']
    },
    'mqtt-broker': {
      id: 'mqtt-broker',
      title: 'MQTT Messaging Broker (Mosquitto)',
      type: 'Data Communication Layer',
      color: '#0EA5E9',
      description: 'Lightweight publish/subscribe messaging broker routing esp32/sensor_data and esp32/status with sub-millisecond overhead. Runs on the Raspberry Pi 5 alongside Node-RED.',
      protocol: 'MQTT v3.1.1 / TCP Port 1883',
      responsibilities: [
        'Receive telemetry from ESP32 edge node (David, Lance B.)',
        'Manage topic subscriptions for Node-RED runtime engine',
        'Publish Last Will & Testament (LWT) when node goes offline',
        'Ensure low-latency sub-millisecond packet routing'
      ],
      communicates: ['ESP32 Node (inbound publish)', 'Node-RED (outbound subscription)']
    },
    'nodered-engine': {
      id: 'nodered-engine',
      title: 'Node-RED Flow Processing Engine',
      type: 'Rule Engine & Orchestration',
      color: '#E11D48',
      description: 'Visual event-driven flow canvas executing EMA smoothing, risk threshold switches, HTTP alerts, MQTT message routing, and serving the live dashboard at /dashboard.',
      protocol: 'Node-RED v3 / Node.js Runtime',
      responsibilities: ['Subscribe to MQTT sensor topics', 'Apply EMA smoothing algorithm', 'Execute threshold switch logic', 'Forward data to FeathersJS REST API', 'Serve real-time dashboard UI'],
      communicates: ['MQTT Broker (subscribe)', 'FeathersJS API (HTTP POST)', 'Angular Frontend (WebSocket/iframe)']
    },
    'feathers-api': {
      id: 'feathers-api',
      title: 'FeathersJS Microservice API',
      type: 'REST & WebSocket Gateway',
      color: '#7C3AED',
      description: 'Feathers core service layers exposing REST endpoints (/api/articles, /api/inquiries, /api/telemetry) and Socket.io real-time channels. Uses Knex.js ORM to write data to SQLite.',
      protocol: 'HTTP REST / WebSockets Port 3030',
      responsibilities: ['Expose CRUD REST endpoints', 'Handle real-time Socket.io connections', 'Write sensor data to SQLite via Knex', 'Serve Directus-style collection metadata'],
      communicates: ['Node-RED (HTTP POST inbound)', 'SQLite Database (read/write)', 'Angular Frontend (REST & WebSocket)']
    },
    'sqlite-db': {
      id: 'sqlite-db',
      title: 'SQLite Database & Directus CMS',
      type: 'Relational Persistence Layer',
      color: '#0D9488',
      description: 'SQLite 3 running in Write-Ahead Logging (WAL) mode for atomic, zero-overhead persistence. Directus Studio provides a visual admin interface to manage all CMS content and view sensor data.',
      protocol: 'Knex.js SQL / cms.sqlite File',
      responsibilities: ['Persist CMS content (articles, topics, settings)', 'Store sensor telemetry incidents', 'Provide Directus Studio admin interface', 'WAL mode enables concurrent reads during writes'],
      communicates: ['FeathersJS API (read/write)', 'Directus Studio (visual admin)']
    },
    'dashboard-ui': {
      id: 'dashboard-ui',
      title: 'Angular 22 + Node-RED Dashboard',
      type: 'Presentation & Alert Layer',
      color: '#16A34A',
      description: 'Angular 22 educational portal with Tailwind CSS presenting all content. Node-RED Dashboard (at /dashboard) provides real-time sensor charts. Both are accessible from the same browser window.',
      protocol: 'Angular Signals / Tailwind CSS / iframe',
      responsibilities: ['Render educational content from Directus CMS', 'Embed Node-RED Dashboard via iframe', 'Display simulated telemetry with interactive controls', 'Provide Directus Studio link for content management'],
      communicates: ['FeathersJS API (HTTP GET)', 'Node-RED Dashboard (iframe embed)']
    }
  };

  // ─── LIFECYCLE ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
  }

  // ─── DATA LOADING ──────────────────────────────────────────────────────────
  loadData() {
    this.api.getSettings().subscribe((s: SiteSettings) => { if (s) this.settings.set(s); });
    this.api.getArticles().subscribe((arts: Article[]) => { this.articles.set(arts); });
    this.api.getServices().subscribe((srvs: ServiceItem[]) => { this.services.set(srvs); });
    this.api.getTeam().subscribe((t: TeamMember[]) => { this.team.set(t); });
  }

  // ─── LIVE DASHBOARD ────────────────────────────────────────────────────────
  onDashboardLoad() {
    this.dashboardLoading.set(false);
    this.dashboardConnected.set(true);
    this.dashboardError.set(false);
  }

  onDashboardError() {
    this.dashboardLoading.set(false);
    this.dashboardConnected.set(false);
    this.dashboardError.set(true);
  }

  refreshDashboard() {
    this.dashboardLoading.set(true);
    this.dashboardError.set(false);
    this.dashboardConnected.set(false);
    // Cycle the URL to force iframe reload
    const url = environment.nodeRedDashboardUrl + '?t=' + Date.now();
    this.dashboardIframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  toggleDashboardFullscreen() {
    this.dashboardFullscreen.set(!this.dashboardFullscreen());
    if (this.dashboardFullscreen()) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }

  openDashboardNewTab() {
    window.open(environment.nodeRedDashboardUrl, '_blank', 'noopener,noreferrer');
  }



  // ─── ARCHITECTURE DIAGRAM ─────────────────────────────────────────────────
  selectDiagramNode(id: string) {
    const node = this.diagramNodes[id];
    if (node) this.activeDiagramNode.set(node);
  }

  // ─── TUTORIALS ─────────────────────────────────────────────────────────────
  selectTutorial(step: number) {
    this.activeTutorialStep.set(step);
    this.expandedStep.set(step);
  }

  markComplete(stepId: number) {
    const set = new Set(this.completedSteps());
    set.add(stepId);
    this.completedSteps.set(set);
  }

  markIncomplete(stepId: number) {
    const set = new Set(this.completedSteps());
    set.delete(stepId);
    this.completedSteps.set(set);
  }

  isCompleted(stepId: number): boolean {
    return this.completedSteps().has(stepId);
  }

  nextTutorial() {
    const current = this.activeTutorialStep();
    if (current < this.tutorials.length) {
      this.markComplete(current);
      this.selectTutorial(current + 1);
    }
  }

  prevTutorial() {
    const current = this.activeTutorialStep();
    if (current > 1) {
      this.selectTutorial(current - 1);
    }
  }

  openYouTube(query: string) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // ─── TOPIC DETAIL & DEDICATED WEB PAGES ────────────────────────────────────
  openTopicDetail(service: ServiceItem) {
    this.selectedTopic.set(service);
    this.selectedService.set(service);
  }

  openServiceModal(service: ServiceItem) {
    this.selectedService.set(service);
  }

  closeServiceModal() {
    this.selectedService.set(null);
    this.selectedTopic.set(null);
  }

  openDedicatedTopicPage(itemOrModuleNum: number | ServiceItem) {
    let moduleId = 1;
    if (typeof itemOrModuleNum === 'number') {
      moduleId = itemOrModuleNum;
    } else if (itemOrModuleNum && itemOrModuleNum.order_num) {
      moduleId = itemOrModuleNum.order_num;
    }
    const detail = this.topicDetailsData[moduleId] || this.topicDetailsData[1];
    this.activeTopicPage.set(detail);
    this.topicDetailActiveTab.set('code');
    this.closeServiceModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDedicatedTopicPage() {
    this.activeTopicPage.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  selectTopicModule(moduleId: number) {
    if (this.topicDetailsData[moduleId]) {
      this.activeTopicPage.set(this.topicDetailsData[moduleId]);
      this.topicDetailActiveTab.set('code');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  copyTopicCode(code: string) {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.copiedTopicCode.set(true);
      setTimeout(() => this.copiedTopicCode.set(false), 2000);
    });
  }

  copyFlowJson(json: string) {
    if (!json) return;
    navigator.clipboard.writeText(json).then(() => {
      this.copiedFlowJson.set(true);
      setTimeout(() => this.copiedFlowJson.set(false), 2000);
    });
  }

  toggleLabStep(stepIdx: number) {
    this.completedLabSteps.update(set => {
      const updated = new Set(set);
      if (updated.has(stepIdx)) {
        updated.delete(stepIdx);
      } else {
        updated.add(stepIdx);
      }
      return updated;
    });
  }

  // ─── ARTICLE READER ────────────────────────────────────────────────────────
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

  // ─── SETUP GUIDE METHODS ───────────────────────────────────────────────────
  selectGuideStep(stepNum: number) {
    if (stepNum >= 1 && stepNum <= this.setupGuideSteps.length) {
      this.activeGuideStep.set(stepNum);
    }
  }

  nextGuideStep() {
    const cur = this.activeGuideStep();
    if (cur < this.setupGuideSteps.length) {
      this.activeGuideStep.set(cur + 1);
    }
  }

  prevGuideStep() {
    const cur = this.activeGuideStep();
    if (cur > 1) {
      this.activeGuideStep.set(cur - 1);
    }
  }

  getActiveGuideStep(): SetupGuideStep {
    const step = this.setupGuideSteps.find((s) => s.id === this.activeGuideStep());
    return step || this.setupGuideSteps[0];
  }

  copyStepCode(code?: string) {
    const textToCopy = code || this.getActiveGuideStep().code;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.copiedStepCode.set(true);
      setTimeout(() => this.copiedStepCode.set(false), 2000);
    });
  }

  onImageError(stepId: number) {
    this.imageErrorMap.update((map) => ({ ...map, [stepId]: true }));
  }

  onImageLoad(stepId: number) {
    this.imageErrorMap.update((map) => ({ ...map, [stepId]: false }));
  }

  isImageMissing(stepId: number): boolean {
    return !!this.imageErrorMap()[stepId];
  }

  openZoomImage(src: string, title: string, stepNumber: number) {
    this.selectedZoomImage.set({ src, title, stepNumber });
  }

  closeZoomImage() {
    this.selectedZoomImage.set(null);
  }

  // ─── NAVIGATION ───────────────────────────────────────────────────────────
  scrollTo(sectionId: string) {
    if (this.activeTopicPage()) {
      this.activeTopicPage.set(null);
    }
    this.activeNav.set(sectionId);
    this.mobileMenuOpen.set(false);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  onSwitchToStudio(collection?: string) {
    this.switchToStudio.emit(collection || 'dashboard');
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────
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



  getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      'Foundations': 'bg-blue-100 text-blue-700',
      'Core Concepts': 'bg-purple-100 text-purple-700',
      'Getting Started': 'bg-green-100 text-green-700',
      'Core Nodes': 'bg-rose-100 text-rose-700',
      'Protocols': 'bg-amber-100 text-amber-700',
      'Hardware': 'bg-orange-100 text-orange-700',
      'Data Storage': 'bg-teal-100 text-teal-700',
      'Visualization': 'bg-indigo-100 text-indigo-700',
      'Analytics': 'bg-cyan-100 text-cyan-700',
      'Deployment': 'bg-slate-100 text-slate-700'
    };
    return colors[cat] || 'bg-slate-100 text-slate-700';
  }

  // Keyboard shortcut: Escape exits fullscreen
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.dashboardFullscreen()) {
      this.toggleDashboardFullscreen();
    }
  }
}
