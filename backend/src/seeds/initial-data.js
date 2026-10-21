const { db } = require('../db');

const initialCollections = [
  {
    id: 'articles',
    name: 'Tutorials & Guides',
    slug: 'articles',
    icon: 'book-open',
    color: '#2563EB',
    description: 'Node-RED tutorials, hardware documentation, and architectural guides.',
    singleton: 0,
    system: 0,
    fields: JSON.stringify([
      { key: 'title', label: 'Tutorial Title', type: 'string', interface: 'input', required: true, width: 'full' },
      { key: 'slug', label: 'URL Slug', type: 'string', interface: 'slug', required: true, width: 'half' },
      { key: 'category', label: 'Category', type: 'string', interface: 'select', options: ['Node-RED Flows', 'Hardware Setup', 'Risk Monitoring', 'Database & SQLite'], required: true, width: 'half' },
      { key: 'status', label: 'Publication Status', type: 'string', interface: 'status', options: ['published', 'draft', 'archived'], width: 'half' },
      { key: 'featured', label: 'Featured on Homepage', type: 'boolean', interface: 'boolean', width: 'half' },
      { key: 'excerpt', label: 'Short Summary', type: 'text', interface: 'textarea', required: true, width: 'full' },
      { key: 'content', label: 'Full Documentation Body', type: 'text', interface: 'wysiwyg', required: true, width: 'full' },
      { key: 'cover_image', label: 'Cover Image URL', type: 'string', interface: 'image', width: 'full' },
      { key: 'author_name', label: 'Author Name', type: 'string', interface: 'input', width: 'half' },
      { key: 'author_role', label: 'Author Role', type: 'string', interface: 'input', width: 'half' },
      { key: 'author_avatar', label: 'Author Avatar URL', type: 'string', interface: 'image', width: 'half' },
      { key: 'reading_time', label: 'Read Duration', type: 'string', interface: 'input', width: 'half' }
    ])
  },
  {
    id: 'services',
    name: 'Core Educational Topics',
    slug: 'services',
    icon: 'cpu',
    color: '#E11D48',
    description: 'Three foundational modules: Risk Monitoring, Distributed Systems, and Database Integration.',
    singleton: 0,
    system: 0,
    fields: JSON.stringify([
      { key: 'title', label: 'Topic Name', type: 'string', interface: 'input', required: true, width: 'half' },
      { key: 'slug', label: 'Topic Slug', type: 'string', interface: 'slug', required: true, width: 'half' },
      { key: 'category', label: 'Domain Category', type: 'string', interface: 'select', options: ['Risk Telemetry', 'Distributed Systems', 'Database Architecture'], width: 'half' },
      { key: 'badge', label: 'Highlight Badge', type: 'string', interface: 'input', width: 'half' },
      { key: 'icon', label: 'Topic Icon', type: 'string', interface: 'icon', width: 'half' },
      { key: 'status', label: 'Status', type: 'string', interface: 'status', options: ['published', 'draft'], width: 'half' },
      { key: 'short_description', label: 'Brief Overview', type: 'text', interface: 'textarea', width: 'full' },
      { key: 'detailed_description', label: 'Comprehensive Details', type: 'text', interface: 'wysiwyg', width: 'full' },
      { key: 'features', label: 'Key Technologies (JSON List)', type: 'text', interface: 'tags', width: 'full' }
    ])
  },
  {
    id: 'team',
    name: 'Instructors & Researchers',
    slug: 'team',
    icon: 'users',
    color: '#2563EB',
    description: 'Laboratory instructors and IoT systems engineers.',
    singleton: 0,
    system: 0,
    fields: JSON.stringify([
      { key: 'name', label: 'Full Name', type: 'string', interface: 'input', required: true, width: 'half' },
      { key: 'role', label: 'Role / Designation', type: 'string', interface: 'input', required: true, width: 'half' },
      { key: 'department', label: 'Department', type: 'string', interface: 'select', options: ['Embedded Systems', 'Industrial IoT', 'Cloud Architecture'], width: 'half' },
      { key: 'status', label: 'Status', type: 'string', interface: 'status', options: ['published', 'draft'], width: 'half' },
      { key: 'email', label: 'Academic Email', type: 'string', interface: 'input', width: 'half' },
      { key: 'linkedin', label: 'LinkedIn Profile', type: 'string', interface: 'input', width: 'half' },
      { key: 'avatar', label: 'Avatar Photo URL', type: 'string', interface: 'image', width: 'full' },
      { key: 'bio', label: 'Professional Biography', type: 'text', interface: 'textarea', width: 'full' }
    ])
  },
  {
    id: 'inquiries',
    name: 'Lab Inquiries & Demonstrations',
    slug: 'inquiries',
    icon: 'inbox',
    color: '#E11D48',
    description: 'Student inquiries, hardware demonstration requests, and lab bookings.',
    singleton: 0,
    system: 0,
    fields: JSON.stringify([
      { key: 'name', label: 'Student / Researcher Name', type: 'string', interface: 'input', required: true, width: 'half' },
      { key: 'email', label: 'Email Address', type: 'string', interface: 'input', required: true, width: 'half' },
      { key: 'company', label: 'Institution / Lab', type: 'string', interface: 'input', width: 'half' },
      { key: 'phone', label: 'Phone Number', type: 'string', interface: 'input', width: 'half' },
      { key: 'service_interest', label: 'Topic of Interest', type: 'string', interface: 'select', width: 'half' },
      { key: 'priority', label: 'Urgency Priority', type: 'string', interface: 'select', options: ['low', 'normal', 'high', 'urgent'], width: 'half' },
      { key: 'status', label: 'Status', type: 'string', interface: 'status', options: ['new', 'in_review', 'contacted', 'resolved', 'archived'], width: 'half' },
      { key: 'subject', label: 'Subject', type: 'string', interface: 'input', width: 'full' },
      { key: 'message', label: 'Inquiry Details', type: 'text', interface: 'textarea', required: true, width: 'full' },
      { key: 'internal_notes', label: 'Instructor Notes', type: 'text', interface: 'textarea', width: 'full' }
    ])
  },
  {
    id: 'media',
    name: 'Hardware & Documentation Assets',
    slug: 'media',
    icon: 'image',
    color: '#2563EB',
    description: 'Circuit schematics, hardware photos, and Node-RED flow diagrams.',
    singleton: 0,
    system: 1,
    fields: JSON.stringify([
      { key: 'title', label: 'Asset Title', type: 'string', interface: 'input', required: true, width: 'half' },
      { key: 'folder', label: 'Folder Category', type: 'string', interface: 'select', options: ['Hardware Photos', 'Flow Diagrams', 'Wiring Schematics'], width: 'half' },
      { key: 'url', label: 'Asset URL', type: 'string', interface: 'input', required: true, width: 'full' },
      { key: 'tags', label: 'Tags', type: 'string', interface: 'input', width: 'full' }
    ])
  },
  {
    id: 'settings',
    name: 'Platform Settings',
    slug: 'settings',
    icon: 'settings',
    color: '#2563EB',
    description: 'Educational platform title, hero messaging, and lab contact information.',
    singleton: 1,
    system: 1,
    fields: JSON.stringify([
      { key: 'site_name', label: 'Platform Name', type: 'string', interface: 'input', required: true, width: 'half' },
      { key: 'tagline', label: 'Tagline', type: 'string', interface: 'input', width: 'half' },
      { key: 'hero_title', label: 'Hero Headline', type: 'string', interface: 'input', width: 'full' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text', interface: 'textarea', width: 'full' },
      { key: 'contact_email', label: 'Lab Contact Email', type: 'string', interface: 'input', width: 'half' },
      { key: 'contact_phone', label: 'Phone Line', type: 'string', interface: 'input', width: 'half' },
      { key: 'office_address', label: 'Lab Campus Address', type: 'string', interface: 'input', width: 'full' }
    ])
  }
];

const initialArticles = [
  {
    title: 'Building Real-Time Risk Telemetry Pipelines with Node-RED and MQTT',
    slug: 'building-real-time-risk-telemetry-node-red',
    category: 'Risk Monitoring',
    excerpt: 'Step-by-step guide to configuring industrial sensor nodes, calculating moving-average threshold alerts, and publishing instant notifications.',
    content: `<h2>1. Telemetry Ingestion Architecture</h2>
<p>Modern industrial safety systems require sub-second reaction times to prevent environmental hazards. In this tutorial, we construct a resilient Node-RED flow that subscribes to MQTT broker payloads published by ESP32 microcontrollers measuring temperature, toxic gas concentrations, and vibrational shifts.</p>
<h3>Key Processing Blocks:</h3>
<ul>
  <li><strong>MQTT In Node:</strong> Subscribes to <code>sensors/telemetry/#</code> with QoS Level 1.</li>
  <li><strong>Function Node (Moving Average):</strong> Applies an exponential moving average filter to dampen jitter and noise spikes.</li>
  <li><strong>Switch Node (Risk Thresholds):</strong> Compares telemetry against Normal (&lt; 45°C), Warning (45°C - 75°C), and Critical (&gt; 75°C) limits.</li>
  <li><strong>Directus REST Node:</strong> Executes an HTTP POST against our Feathers SQLite endpoint when a state transition occurs.</li>
</ul>
<blockquote>"Edge processing in Node-RED prevents alert fatigue by verifying hazard persistence before escalating to sirens or SMS dispatchers."</blockquote>`,
    cover_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Dr. Alistair Finch',
    author_role: 'Lead Embedded Systems Instructor',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    reading_time: '6 min read',
    status: 'published',
    featured: 1,
    views: 890
  },
  {
    title: 'Distributed Edge Computing: Microservice Orchestration with Node-RED',
    slug: 'distributed-edge-computing-microservice-node-red',
    category: 'Distributed Systems',
    excerpt: 'How to partition processing workflows across edge gateways (Raspberry Pi) and centralized SQLite/Directus servers for uninterrupted offline operations.',
    content: `<h2>Why Edge-First Architecture Matters</h2>
<p>When physical facilities lose internet connectivity, safety-critical loops must continue autonomous operation without interruption. By running local Node-RED runtime engines on edge hardware paired with lightweight embedded SQLite databases, remote facilities remain 100% compliant and protected.</p>
<h3>Core Implementation Steps:</h3>
<ol>
  <li>Deploy containerized Node-RED edge daemon using Docker Compose on the gateway.</li>
  <li>Configure local SQLite buffer for offline persistence during network partitions.</li>
  <li>Implement two-way sync hooks that push buffered logs to the central Directus CMS upon link recovery.</li>
</ol>`,
    cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Sophia Sterling',
    author_role: 'Principal IoT Architect',
    author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    reading_time: '5 min read',
    status: 'published',
    featured: 1,
    views: 640
  },
  {
    title: 'SQLite Database Integration and Relational Logging for Industrial Sensors',
    slug: 'sqlite-database-integration-industrial-sensors',
    category: 'Database & SQLite',
    excerpt: 'Optimizing high-frequency sensor writes in SQLite using WAL mode, parameterized queries, and FeathersJS Knex service listeners.',
    content: `<h2>Mastering SQLite for Time-Series & Sensor Streams</h2>
<p>A common misconception is that SQLite cannot handle concurrent write operations in IoT applications. By enabling Write-Ahead Logging (WAL mode) and batching sensor writes via Node-RED buffer queues, SQLite effortlessly sustains thousands of sensor writes per second with microscopic RAM overhead.</p>`,
    cover_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Marcus Vance',
    author_role: 'Database Systems Fellow',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    reading_time: '7 min read',
    status: 'published',
    featured: 0,
    views: 1210
  }
];

// The Three Main Topic Cards requested by user
const initialServices = [
  {
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
];

const initialTeam = [
  {
    name: 'Dr. Alistair Finch',
    role: 'Lead Embedded Systems Instructor',
    department: 'Embedded Systems',
    bio: 'Specialist in low-power industrial sensor telemetry and real-time event processing with 14 years of teaching experience.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    email: 'a.finch@nodered-academy.edu',
    linkedin: 'https://linkedin.com',
    twitter: '',
    order_num: 1,
    status: 'published'
  },
  {
    name: 'Sophia Sterling',
    role: 'Principal IoT Systems Architect',
    department: 'Industrial IoT',
    bio: 'Designs mission-critical edge gateways for manufacturing facilities, specializing in containerized Node-RED flow networks.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    email: 's.sterling@nodered-academy.edu',
    linkedin: 'https://linkedin.com',
    twitter: '',
    order_num: 2,
    status: 'published'
  },
  {
    name: 'Marcus Vance',
    role: 'Database Systems Fellow',
    department: 'Cloud Architecture',
    bio: 'Author of several open-source SQLite telemetry adapters and developer of high-concurrency FeathersJS microservice platforms.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    email: 'm.vance@nodered-academy.edu',
    linkedin: 'https://linkedin.com',
    twitter: '',
    order_num: 3,
    status: 'published'
  }
];

const initialInquiries = [
  {
    name: 'Jonathan Meyers',
    email: 'j.meyers@apex-engineering.com',
    phone: '+1 (415) 555-0192',
    company: 'Apex Automation Labs',
    subject: 'Hardware Lab Demonstration Request',
    service_interest: 'Risk Monitoring & Environmental Telemetry',
    message: 'We would like to book a hardware demonstration session on integrating MQ-2 gas sensors and temperature probes with the Node-RED flow engine.',
    status: 'new',
    priority: 'high',
    internal_notes: 'Demonstration hardware kit B confirmed ready.'
  },
  {
    name: 'Elena Rostova',
    email: 'elena@polytech.edu',
    phone: '+1 (617) 555-4821',
    company: 'Polytechnic Engineering Dept',
    subject: 'Distributed Systems Curriculum Access',
    service_interest: 'Distributed Systems & Edge Computing',
    message: 'Inquiring about syllabus licensing and laboratory exercises for our upcoming semester course on edge computing.',
    status: 'in_review',
    priority: 'normal',
    internal_notes: 'Sent course outline and syllabus PDF.'
  }
];

const initialMedia = [
  {
    title: 'Hardware Setup Demonstration Unit',
    filename: 'hardware-setup.jpg',
    original_name: 'hardware-setup.jpg',
    mime_type: 'image/jpeg',
    file_size: 480000,
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
    folder: 'Hardware Photos',
    tags: 'hardware, sensors, esp32, breadboard'
  },
  {
    title: 'Node-RED Flow Architecture Screenshot',
    filename: 'flow-architecture.png',
    original_name: 'flow-architecture.png',
    mime_type: 'image/jpeg',
    file_size: 610000,
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80',
    folder: 'Flow Diagrams',
    tags: 'flow, nodered, diagram, mqtt'
  }
];

const initialSettings = {
  id: 1,
  site_name: 'Node-RED Academy',
  tagline: 'Industrial IoT, Edge Computing & Directus CMS Educational Platform',
  hero_title: 'Master Node-RED Flow Architecture & Industrial Edge Telemetry',
  hero_subtitle: 'An interactive educational platform exploring risk telemetry pipelines, distributed edge microservices, and SQLite persistence orchestrated through Directus Headless CMS.',
  contact_email: 'lab@nodered-academy.edu',
  contact_phone: '+1 (800) 492-3000',
  office_address: 'Advanced IoT Systems Building, Science Park, Suite 400',
  primary_color: '#2563EB',
  inquiries_enabled: 1,
  social_links: JSON.stringify({
    github: 'https://github.com',
    nodered: 'https://nodered.org',
    docs: 'https://nodered.org/docs'
  })
};

async function seedData() {
  // Always update settings
  await db('settings').del();
  await db('settings').insert(initialSettings);

  // Update collections_meta
  await db('collections_meta').del();
  await db('collections_meta').insert(initialCollections);

  // Update articles
  await db('articles').del();
  await db('articles').insert(initialArticles);

  // Update services (the 3 main topic cards)
  await db('services').del();
  await db('services').insert(initialServices);

  // Update team
  await db('team').del();
  await db('team').insert(initialTeam);

  // Inquiries
  const countInq = await db('inquiries').count('id as count').first();
  if (countInq.count === 0) {
    await db('inquiries').insert(initialInquiries);
  }

  // Media
  const countMedia = await db('media').count('id as count').first();
  if (countMedia.count === 0) {
    await db('media').insert(initialMedia);
  }

  console.log('[Seeder] Database updated with Node-RED educational topics and light theme content.');
}

module.exports = { seedData };
