export interface TopicDetailContent {
  moduleId: number;
  badge: string;
  topicTitle: string;
  category: string;
  subtitle: string;
  heroSummary: string;
  readingTime: string;
  level: string;
  prerequisites: string[];
  competencies: {
    title: string;
    description: string;
    badge: string;
    keyTakeaway: string;
  }[];
  architectureSummary: string;
  pipelineSteps: {
    phase: string;
    component: string;
    description: string;
    protocol: string;
  }[];
  functionScript: string;
  functionScriptLabel: string;
  functionScriptNotes: string[];
  flowJson: string;
  hardwareSpecs: {
    component: string;
    wiring: string;
    purpose: string;
  }[];
  directusIntegration: {
    tableName: string;
    tableDescription: string;
    fields: { name: string; type: string; desc: string }[];
    sampleRecord: string;
    studioAction: string;
  };
  labExercise: {
    title: string;
    overview: string;
    prerequisites: string;
    steps: string[];
    expectedResult: string;
  };
}

export const TOPIC_CURRICULUM_DATA: Record<number, TopicDetailContent> = {
  1: {
    moduleId: 1,
    badge: 'Core Topic 01',
    category: 'Risk Telemetry',
    topicTitle: 'Risk Monitoring & Environmental Telemetry',
    subtitle: 'Real-time hazard detection, automated multi-tier threshold alerts, and sensor telemetry analysis utilizing Node-RED event processing.',
    heroSummary:
      'An engineering deep-dive into physical plant safety and environmental telemetry. Ingest real-time analog signals from ESP32 edge nodes (ultrasonic proximity, capacitive soil moisture, BH1750 ambient light), apply digital exponential smoothing to eliminate false alarms, evaluate multi-tier risk thresholds (Normal, Warning, Critical), and automate hazard dispatches to SQLite and Directus CMS.',
    readingTime: '45 mins • Hands-on Laboratory',
    level: 'Undergraduate & Industrial IoT Systems',
    prerequisites: [
      'ESP32 Wi-Fi & MQTT Ingestion',
      'Node-RED Function & Switch Nodes',
      'JSON Payload Parsing',
      'FeathersJS REST API'
    ],
    competencies: [
      {
        title: 'Multi-Tier Safety Thresholds (Normal, Warning, Critical)',
        badge: 'Condition Logic',
        description:
          'Configuring hierarchical condition branches in Node-RED switch nodes to categorize telemetry into Normal (Soil 40-70%, Light < 400 lux), Warning (Soil 25-40% or 70-85%, Light 400-800 lux), and Critical (Soil < 25% dry or Light > 800 lux contaminated) states without false alarms.',
        keyTakeaway:
          'Multi-tier alerting prevents alarm fatigue by differentiating between advisory warnings and actionable critical shutdowns.'
      },
      {
        title: 'MQTT & HTTP Telemetry Ingestion Flow Nodes',
        badge: 'Ingestion Pipeline',
        description:
          'Subscribing to esp32/sensor_data via local Mosquitto MQTT broker at QoS 1 with clean session handling, while providing secondary HTTP POST webhook endpoints for heterogeneous telemetry gateways.',
        keyTakeaway:
          'MQTT provides sub-10ms pub/sub overhead, while HTTP fallback accommodates legacy PLCs and external webhooks.'
      },
      {
        title: 'Exponential Smoothing & Sensor Debouncing',
        badge: 'Signal DSP',
        description:
          'Eliminating electrical noise, transient ADC voltage ripples on GPIO 34/35, and ultrasonic acoustic dropouts using an exponential moving average (EMA) filter: S_t = α · Y_t + (1 - α) · S_{t-1}.',
        keyTakeaway:
          'An alpha factor of 0.35 achieves the ideal balance between noise rejection and responsiveness to rapid environmental changes.'
      },
      {
        title: 'Automated Hazard Dispatch & Directus Event Logging',
        badge: 'Directus Event Sync',
        description:
          'Dispatching critical hazard events directly to the FeathersJS core service (POST /api/incidents) which writes directly to SQLite in WAL mode, instantly reflecting alerts in Directus CMS Studio in real time.',
        keyTakeaway:
          'Decoupled REST/SQLite dispatch ensures physical alarms are recorded permanently even if the visualization layer drops.'
      }
    ],
    architectureSummary:
      'Continuous telemetry pipeline connecting ESP32 edge hardware, local Mosquitto broker, Node-RED analytical flow engine, Feathers SQLite service, and Directus CMS Studio.',
    pipelineSteps: [
      {
        phase: '1. Ingestion',
        component: 'mqtt in (esp32/sensor_data)',
        description: 'Ingests JSON telemetry packets every 5 seconds over local Wi-Fi port 1883.',
        protocol: 'MQTT v3.1.1 (QoS 1)'
      },
      {
        phase: '2. DSP Smoothing',
        component: 'function (Exponential Moving Average)',
        description: 'Damps sensor jitter and validates ultrasonic echo pulse widths.',
        protocol: 'V8 JavaScript Engine'
      },
      {
        phase: '3. Classification',
        component: 'switch (3-Tier Risk Rules)',
        description: 'Evaluates soil moisture and low ambient light against configured thresholds.',
        protocol: 'Event Rule Routing'
      },
      {
        phase: '4. REST Dispatch',
        component: 'http request (Feathers Core API)',
        description: 'Dispatches critical hazard alerts with timestamp and reading to port 3030.',
        protocol: 'HTTP REST JSON'
      },
      {
        phase: '5. Directus Sync',
        component: 'Directus CMS Studio',
        description: 'Dynamic SQLite schema reflection updates incident table and notification center.',
        protocol: 'SQLite 3 (WAL mode)'
      }
    ],
    functionScript: `// Exponential Moving Average (EMA) & 3-Tier Risk Evaluation
const SENSORS = msg.payload;
const context = flow;

// Retrieve previous smoothed values from flow memory or initialize
let smoothed = context.get('smoothed_telemetry') || {
  soil_percent: SENSORS.soil_percent,
  light_lux: SENSORS.light_lux,
  distance_cm: SENSORS.distance_cm || 0
};

const ALPHA = 0.35; // Smoothing factor (0 = pure historical, 1 = raw instant)

smoothed.soil_percent = Math.round(ALPHA * SENSORS.soil_percent + (1 - ALPHA) * smoothed.soil_percent);
smoothed.light_lux = Number((ALPHA * SENSORS.light_lux + (1 - ALPHA) * smoothed.light_lux).toFixed(2));

if (SENSORS.distance_cm !== null && !isNaN(SENSORS.distance_cm)) {
  smoothed.distance_cm = Number((ALPHA * SENSORS.distance_cm + (1 - ALPHA) * smoothed.distance_cm).toFixed(1));
} else {
  smoothed.distance_cm = null;
}

context.set('smoothed_telemetry', smoothed);

// Multi-Tier Risk Evaluation Engine
let riskLevel = 'NORMAL';
let hazardDetails = [];

// Rule A: Low ambient light (lux)
if (smoothed.light_lux < 20) {
  riskLevel = 'CRITICAL';
  hazardDetails.push(\`CRITICAL low light: \${smoothed.light_lux} lux is below 20 lux.\`);
} else if (smoothed.light_lux < 100) {
  riskLevel = 'WARNING';
  hazardDetails.push(\`WARNING low light: \${smoothed.light_lux} lux is below 100 lux.\`);
}

// Rule B: Capacitive Soil Moisture (Desiccation / Over-saturation)
if (smoothed.soil_percent < 20) {
  riskLevel = 'CRITICAL';
  hazardDetails.push(\`CRITICAL Soil Desiccation: \${smoothed.soil_percent}% is below survival minimum\`);
} else if (smoothed.soil_percent < 35) {
  if (riskLevel !== 'CRITICAL') riskLevel = 'WARNING';
  hazardDetails.push(\`WARNING Soil Dryness: \${smoothed.soil_percent}% requires irrigation\`);
} else if (smoothed.soil_percent > 85) {
  if (riskLevel !== 'CRITICAL') riskLevel = 'WARNING';
  hazardDetails.push(\`WARNING Soil Over-saturation: \${smoothed.soil_percent}% root rot risk\`);
}

// Package enriched message payload
msg.payload = {
  timestamp: new Date().toISOString(),
  risk_level: riskLevel,
  hazards: hazardDetails,
  raw_readings: SENSORS,
  smoothed_readings: smoothed,
  author: 'David, Lance B.'
};

// Dispatch to 3 dedicated output terminals:
// Terminal 1: NORMAL -> Dashboard Live Indicators
// Terminal 2: WARNING -> Warning Gauge + Slack/Email Notice
// Terminal 3: CRITICAL -> Directus Incident Record + Automated Solenoid Cutoff
if (riskLevel === 'NORMAL') {
  return [msg, null, null];
} else if (riskLevel === 'WARNING') {
  return [null, msg, null];
} else {
  return [null, null, msg];
}`,
    functionScriptLabel: 'Node-RED Function Node (On Message Tab)',
    functionScriptNotes: [
      'Alpha factor 0.35 suppresses capacitive analog ADC jitter without lagging response.',
      'Returning a 3-element array sends the payload exclusively to the corresponding terminal output.',
      'Context memory retains state across asynchronous message invocations.'
    ],
    flowJson: `[
  {
    "id": "mqtt_in_risk",
    "type": "mqtt in",
    "z": "tab_risk_monitoring",
    "name": "ESP32 Sensor Telemetry Inbound",
    "topic": "esp32/sensor_data",
    "qos": "1",
    "datatype": "json",
    "broker": "mosquitto_localhost",
    "nl": false,
    "rap": true,
    "rh": 0,
    "inputs": 0,
    "x": 170,
    "y": 140,
    "wires": [["fn_risk_filter"]]
  },
  {
    "id": "fn_risk_filter",
    "type": "function",
    "z": "tab_risk_monitoring",
    "name": "Exponential Smoothing & 3-Tier Risk Classifier",
    "func": "/* Paste functionScript here */",
    "outputs": 3,
    "noerr": 0,
    "x": 480,
    "y": 140,
    "wires": [
      ["ui_normal_status"],
      ["ui_warning_gauge", "log_warning_debug"],
      ["ui_critical_alarm", "post_directus_incident", "gpio_safety_relay"]
    ]
  }
]`,
    hardwareSpecs: [
      {
        component: 'ESP32 DevKit V1 (30-pin)',
        wiring: 'Micro-USB 5V 1A power / 2.4GHz Wi-Fi (802.11 b/g/n)',
        purpose: 'Main edge telemetry controller with dual Xtensa 32-bit cores'
      },
      {
        component: 'Capacitive Soil Moisture Sensor v1.2',
        wiring: 'VCC->3.3V, GND->GND, AOUT->GPIO 34 (ADC1_CH6)',
        purpose: 'Corrosion-resistant analog soil permittivity measurement'
      },
      {
        component: 'BH1750 Light Sensor',
        wiring: 'VCC->3.3V, GND->GND, SDA->GPIO 21, SCL->GPIO 22',
        purpose: 'Digital ambient illuminance measurement in lux over I²C'
      },
      {
        component: 'HC-SR04 Ultrasonic Distance Sensor',
        wiring: 'VCC->5V (VIN), GND->GND, TRIG->GPIO 25, ECHO->1k/2k Divider->GPIO 26',
        purpose: 'Reservoir / barrier height tracking with 3.3V protection'
      }
    ],
    directusIntegration: {
      tableName: 'incident_logs',
      tableDescription:
        'Directus collection tracking threshold violations, risk classifications, and automated remediation actions.',
      fields: [
        { name: 'id', type: 'INTEGER (Auto Increment)', desc: 'Primary key index for relational audit trail' },
        { name: 'severity', type: 'VARCHAR(20)', desc: 'NORMAL | WARNING | CRITICAL' },
        { name: 'sensor_topic', type: 'VARCHAR(100)', desc: 'Source MQTT topic (esp32/sensor_data)' },
        { name: 'reading_value', type: 'FLOAT', desc: 'Triggering value (e.g. 845.0 lux Light or 18% soil)' },
        { name: 'hazard_description', type: 'TEXT', desc: 'Detailed diagnostic explanation generated by Node-RED' },
        { name: 'created_at', type: 'DATETIME', desc: 'ISO 8601 UTC timestamp created automatically' }
      ],
      sampleRecord: `{
  "id": 104,
  "severity": "CRITICAL",
  "sensor_topic": "esp32/sensor_data",
  "reading_value": 12.4,
  "hazard_description": "CRITICAL low light: 12.4 lux is below 20 lux.",
  "created_at": "2026-10-25T10:18:32.000Z"
}`,
      studioAction: 'View & Filter Incident Logs in Directus Studio'
    },
    labExercise: {
      title: 'Laboratory Exercise 01: Simulating Low Light & Auto-Dispatch',
      overview:
        'In this exercise, you will inject anomalous telemetry into the MQTT broker, observe the exponential smoothing curve, verify the multi-tier switch classification, and inspect the incident log generated in Directus CMS.',
      prerequisites: 'Node-RED running at port 1880, Mosquitto MQTT running at port 1883, Directus Studio accessible.',
      steps: [
        'Publish normal telemetry: mosquitto_pub -h localhost -t esp32/sensor_data -m \'{"soil_percent":65,"light_lux":220,"distance_cm":12.5,"rssi":-55}\'',
        'Verify Output 1 activates and dashboard indicators show Green (NORMAL).',
        'Simulate low light: mosquitto_pub -h localhost -t esp32/sensor_data -m \'{"soil_percent":65,"light_lux":5,"distance_cm":12.5,"rssi":-55}\'',
        'Observe the function node dampening the sudden spike before elevating state to CRITICAL.',
        'Confirm Output 3 fires, dispatching an incident payload to FeathersJS and inserting row into SQLite.',
        'Switch to Directus Studio -> Foundational Topics / Database to confirm the incident audit trail.'
      ],
      expectedResult:
        'Telemetry is classified with 0 false triggers, and Directus Studio displays the new CRITICAL hazard event within 250ms.'
    }
  },

  2: {
    moduleId: 2,
    badge: 'Core Topic 02',
    category: 'Distributed Systems',
    topicTitle: 'Distributed Systems & Edge Computing',
    subtitle: 'Deploying partitioned Node-RED flow architectures across edge controllers and central servers with offline resiliency.',
    heroSummary:
      'A comprehensive guide to resilient edge-to-cloud architectures for industrial environments with intermittent network connectivity. Learn to containerize Node-RED runtimes on edge gateways, partition computational workloads, implement local store-and-forward FIFO queues during network outages, and execute zero-downtime hot-reload flow deployments.',
    readingTime: '50 mins • Hands-on Laboratory',
    level: 'Industrial Edge Architecture & Distributed Systems',
    prerequisites: [
      'Linux Systemd & Docker Basics',
      'TCP/IP Socket Networking',
      'MQTT Bridge Configuration',
      'Git Flow Projects'
    ],
    competencies: [
      {
        title: 'Edge Gateway Node-RED Containerization',
        badge: 'Containerization',
        description:
          'Deploying isolated, memory-bounded Node-RED microservices on Raspberry Pi edge hardware using Docker Compose or Alpine Linux containers with automatic healthcheck restarts and volume persistence.',
        keyTakeaway:
          'Containerization guarantees consistent dependencies and enables rollback without affecting operating system host services.'
      },
      {
        title: 'Store-and-Forward Offline Buffering',
        badge: 'Offline Fault Tolerance',
        description:
          'Implementing durable disk-backed FIFO buffering that automatically catches telemetry packets when WAN or central broker connectivity drops, preventing data loss and replaying payloads chronologically upon reconnection.',
        keyTakeaway:
          'Store-and-forward architectures maintain 100% data fidelity across unpredictable Wi-Fi and cellular backhauls.'
      },
      {
        title: 'Microservice REST & WebSocket Communication',
        badge: 'Microservices',
        description:
          'Employing decoupled communication paradigms: sub-50ms WebSocket streams for real-time operator cockpit updates, and idempotent REST endpoints for durable transactional operations.',
        keyTakeaway:
          'Choosing the right transport protocol prevents head-of-line blocking and ensures high-frequency telemetry doesn\'t bottleneck database writes.'
      },
      {
        title: 'Zero-Downtime Hot-Reload Flow Deployments',
        badge: 'DevOps & CI/CD',
        description:
          'Leveraging Node-RED\'s partial deployment API ("Modified Nodes" vs "Modified Flows") and Git-backed project integration to roll out updated control logic without interrupting running hardware threads.',
        keyTakeaway:
          'Atomic node reloads prevent sensor drops and eliminate physical machinery downtime during software upgrades.'
      }
    ],
    architectureSummary:
      'Two-tier distributed architecture: Edge Gateways ingest and buffer local ESP32 telemetry, synchronizing upstream to the Central Node-RED Engine and Directus CMS.',
    pipelineSteps: [
      {
        phase: '1. Local Edge Ingestion',
        component: 'Edge Mosquitto Broker',
        description: 'Ingests sensor telemetry locally over LAN with sub-5ms latency.',
        protocol: 'MQTT Local (1883)'
      },
      {
        phase: '2. WAN Liveness Probe',
        component: 'ping / http heartbeat node',
        description: 'Monitors cloud gateway reachability every 10 seconds.',
        protocol: 'ICMP / TCP KeepAlive'
      },
      {
        phase: '3. Store & Forward Queue',
        component: 'Local SQLite Disk Queue',
        description: 'Buffers packets during WAN blackout; tracks FIFO sequence order.',
        protocol: 'File-backed Buffer'
      },
      {
        phase: '4. Batch Replay Sync',
        component: 'Batch Replay Flow Handler',
        description: 'Flushes queued payloads in 25-message bursts with replay headers upon reconnect.',
        protocol: 'MQTT Bridge QoS 1'
      },
      {
        phase: '5. Central Ingestion',
        component: 'Central Feathers Core API',
        description: 'Reassembles continuous historical timeline without gaps.',
        protocol: 'HTTPS / REST (3030)'
      }
    ],
    functionScript: `// Edge Store-and-Forward Buffer Handler
const isOnline = flow.get('wan_online') ?? true;
const currentPayload = msg.payload;
const context = flow;

// Access local durable buffer in flow context
let buffer = context.get('offline_telemetry_queue') || [];
const MAX_BUFFER_CAPACITY = 10000; // retain ~14 hours of data at 5s cadence

if (!isOnline) {
  // OFFLINE MODE: Append to queue and alert operator UI
  if (buffer.length < MAX_BUFFER_CAPACITY) {
    buffer.push({
      queued_at: new Date().toISOString(),
      payload: currentPayload
    });
    context.set('offline_telemetry_queue', buffer);
    node.status({ fill: 'yellow', shape: 'dot', text: \`Offline: \${buffer.length} pkts buffered\` });
  } else {
    node.status({ fill: 'red', shape: 'ring', text: 'CRITICAL: Buffer Full (>10k pkts)' });
  }
  // Suppress immediate upstream transmission
  return [null, null];
}

// ONLINE MODE: Check for backlog to drain
if (buffer.length > 0) {
  node.status({ fill: 'blue', shape: 'dot', text: \`Syncing: \${buffer.length} pkts remaining\` });
  
  // Extract batch of 25 messages to prevent downstream API throttling
  const batch = buffer.splice(0, 25);
  context.set('offline_telemetry_queue', buffer);

  const replayedMessages = batch.map(item => ({
    payload: item.payload,
    headers: {
      'x-telemetry-replayed': 'true',
      'x-original-enqueued-time': item.queued_at
    }
  }));

  // Output 1: Live current reading, Output 2: Array of replayed historical records
  return [msg, replayedMessages];
}

// Normal steady-state operation
node.status({ fill: 'green', shape: 'dot', text: 'Online • Real-time Stream Active' });
return [msg, null];`,
    functionScriptLabel: 'Store-and-Forward Buffer Script',
    functionScriptNotes: [
      'Throttled batching (25 pkts/cycle) avoids overwhelming the central SQLite database.',
      'Custom HTTP/MQTT headers flag historical data so charts preserve true timestamps.',
      'Queue survives temporary Node-RED restarts when backed by context storage.'
    ],
    flowJson: `[
  {
    "id": "edge_ping_wan",
    "type": "ping",
    "z": "tab_distributed_systems",
    "name": "Check WAN Gateway",
    "host": "8.8.8.8",
    "timer": "10",
    "x": 160,
    "y": 120,
    "wires": [["set_wan_state"]]
  },
  {
    "id": "store_forward_fn",
    "type": "function",
    "z": "tab_distributed_systems",
    "name": "Store & Forward Buffer Router",
    "func": "/* Paste functionScript here */",
    "outputs": 2,
    "x": 450,
    "y": 180,
    "wires": [
      ["live_central_dispatch"],
      ["replay_batch_dispatch"]
    ]
  }
]`,
    hardwareSpecs: [
      {
        component: 'Raspberry Pi 4 / 5 (Edge Gateway)',
        wiring: 'Ethernet LAN + 2.4GHz Wi-Fi AP + Local Mosquitto Broker',
        purpose: 'Runs local Node-RED container, stores local buffer, brokers sensor data'
      },
      {
        component: 'ESP32 Sensor Edge Node',
        wiring: 'Connected to Edge Pi via private Wi-Fi SSID "Industrial_IoT_Lab"',
        purpose: 'Acquires raw sensor readings and publishes at 5s intervals'
      },
      {
        component: 'MicroSD / NVMe SSD Storage',
        wiring: 'Mounted at /var/lib/node-red for context persistence',
        purpose: 'Guarantees store-and-forward queue survives edge power loss'
      }
    ],
    directusIntegration: {
      tableName: 'edge_nodes',
      tableDescription:
        'Directus registry tracking all active edge gateways, their heartbeat health, and buffer synchronization status.',
      fields: [
        { name: 'id', type: 'INTEGER', desc: 'Unique edge node identifier' },
        { name: 'node_name', type: 'VARCHAR(100)', desc: 'Human-readable node tag (e.g. "Lab Alpha Gateway")' },
        { name: 'ip_address', type: 'VARCHAR(45)', desc: 'Current LAN IP (10.219.89.43)' },
        { name: 'connection_status', type: 'VARCHAR(20)', desc: 'ONLINE | OFFLINE | SYNCING' },
        { name: 'buffered_packets', type: 'INTEGER', desc: 'Number of messages waiting in edge queue' },
        { name: 'firmware_version', type: 'VARCHAR(20)', desc: 'David, Lance B. v2.4-edge' }
      ],
      sampleRecord: `{
  "id": 1,
  "node_name": "ESP32 Sensor Edge Gateway",
  "ip_address": "10.219.89.43",
  "connection_status": "ONLINE",
  "buffered_packets": 0,
  "firmware_version": "David, Lance B. v2.4-edge",
  "created_at": "2026-10-25T08:00:00.000Z"
}`,
      studioAction: 'Inspect Edge Gateways in Directus Studio'
    },
    labExercise: {
      title: 'Laboratory Exercise 02: Simulating WAN Outage & Verifying Zero Data Loss',
      overview:
        'Simulate an unexpected internet disconnection on the edge gateway while sensor telemetry is publishing, verify that the local buffer queues every payload, and confirm automatic chronological replay upon reconnect.',
      prerequisites: 'Two terminal windows, Node-RED dashboard active, Mosquitto broker running.',
      steps: [
        'Verify active telemetry stream on the Live Dashboard.',
        'Simulate WAN outage by triggering the offline flag: flow.set("wan_online", false) in Node-RED.',
        'Observe the function node status turning yellow: "Offline: X pkts buffered".',
        'Allow the ESP32 to publish 6 packets (30 seconds) while offline.',
        'Restore connectivity: flow.set("wan_online", true).',
        'Verify that Output 2 flushes all 6 buffered packets with original timestamps into Directus CMS.'
      ],
      expectedResult:
        'Zero packets dropped; Directus CMS database timeline shows continuous 5s data points across the outage window.'
    }
  },

  3: {
    moduleId: 3,
    badge: 'Core Topic 03',
    category: 'Database Architecture',
    topicTitle: 'Database Integration & SQLite/Directus Sync',
    subtitle: 'Seamless relational persistence with SQLite in WAL mode, Knex service mappings, and Directus schema reflection.',
    heroSummary:
      'An in-depth exploration of high-throughput relational persistence for event-driven IoT ecosystems. Master SQLite Write-Ahead Logging (WAL) concurrency, construct Knex.js query pipelines and FeathersJS service event hooks, and explore how Directus Headless CMS dynamically inspects SQLite catalogs to generate interactive field studios and real-time dashboards.',
    readingTime: '40 mins • Hands-on Laboratory',
    level: 'Relational Persistence & Headless CMS Engineering',
    prerequisites: [
      'SQL DDL / DML Syntax',
      'SQLite Architecture & Pragma Settings',
      'Knex.js ORM Query Builder',
      'Directus Studio Schema Reflection'
    ],
    competencies: [
      {
        title: 'SQLite Write-Ahead Logging (WAL) Configuration',
        badge: 'Storage Engine',
        description:
          'Configuring PRAGMA journal_mode = WAL; and PRAGMA synchronous = NORMAL;, allowing concurrent reader processes (Directus Studio, Feathers API) to query data without blocking writer threads from Node-RED.',
        keyTakeaway:
          'WAL mode completely eliminates "database is locked" (SQLITE_BUSY) exceptions in multi-process IoT architectures.'
      },
      {
        title: 'FeathersJS Knex Service CRUD Pipelines',
        badge: 'Service Architecture',
        description:
          'Designing typed FeathersJS backend services powered by Knex.js query builder, orchestrating structured CRUD operations across articles, services, inquiries, and sensor telemetry tables.',
        keyTakeaway:
          'Knex provides parameterized SQL generation to prevent injection, while Feathers hooks handle validation and audit trails.'
      },
      {
        title: 'Directus Dynamic Schema Reflection & Field Studio',
        badge: 'Headless CMS Reflection',
        description:
          'Leveraging Directus\'s unique architecture: inspecting native SQLite system tables (sqlite_master, pragma_table_info) directly without proprietary metadata wrappers, automatically generating administrative UIs.',
        keyTakeaway:
          'Directus treats your SQL database as the single source of truth; schema migrations are instantly reflected in the CMS Studio.'
      },
      {
        title: 'Relational Audit Trail & Incident Logs',
        badge: 'Relational Modeling',
        description:
          'Creating normalized schemas with indexed timestamps, foreign key relationships, and automated cascade rules to maintain an immutable compliance log of all physical sensor readings.',
        keyTakeaway:
          'Proper B-Tree indexing on created_at enables sub-millisecond range queries across millions of historical telemetry rows.'
      }
    ],
    architectureSummary:
      'Relational data pipeline from Node-RED SQL generators through SQLite 3 WAL storage, surfaced dynamically in Directus Headless CMS Studio.',
    pipelineSteps: [
      {
        phase: '1. Ingestion & Transformation',
        component: 'Node-RED Data Prep Function',
        description: 'Formats ESP32 readings into parameterized SQL insert tuples.',
        protocol: 'JSON -> SQL Tuple'
      },
      {
        phase: '2. Batch Transaction Commit',
        component: 'SQLite Node / Knex Writer',
        description: 'Executes atomic transaction committing sensor rows to cms.sqlite.',
        protocol: 'Knex.js / SQLite3 Driver'
      },
      {
        phase: '3. WAL Journal Buffer',
        component: 'cms.sqlite-wal file',
        description: 'Appends writes to WAL file sequentially; readers read from main DB without locking.',
        protocol: 'OS Memory Mapped I/O'
      },
      {
        phase: '4. Dynamic Schema Introspection',
        component: 'Directus Schema Engine',
        description: 'Polls table metadata and maps columns to Directus Field interfaces.',
        protocol: 'Directus Reflection API'
      },
      {
        phase: '5. Directus Studio Visualization',
        component: 'Directus Headless CMS UI',
        description: 'Operators view tabular records, configure custom form fields, and build telemetry dashboards.',
        protocol: 'Vue 3 / Directus App'
      }
    ],
    functionScript: `// Parameterized SQL Ingestion Generator for Node-RED SQLite Node
const d = msg.payload;

// Validate and sanitize data types
const distance = d.distance_cm === null ? null : parseFloat(d.distance_cm);
const soil = parseInt(d.soil_percent, 10) || 0;
const light = parseFloat(d.light_lux) || 0;
const rssi = parseInt(d.rssi, 10) || -99;

// Determine operational status
let status = 'NORMAL';
if (light < 20 || soil < 20) {
  status = 'CRITICAL';
} else if (light < 100 || soil < 35) {
  status = 'WARNING';
}

// Prepare parameterized SQL statement:
// Parameterized queries guarantee immunity against SQL injection and optimize query plan caching
msg.topic = \`
  INSERT INTO readings (
    distance_cm,
    soil_percent,
    light_lux,
    rssi,
    status,
    created_at
  ) VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'));
\`;

// Array of parameters matching ? placeholders in exact sequence
msg.payload = [
  distance,
  soil,
  light,
  rssi,
  status
];

// Return message to Node-RED SQLite node connected to readings.sqlite
return msg;`,
    functionScriptLabel: 'Parameterized SQL Ingestion Script',
    functionScriptNotes: [
      'Using parameterized query syntax (?, ?, ...) prevents SQL injection vulnerabilities.',
      'NULL values for ultrasonic echo timeouts are preserved cleanly in the SQLite database.',
      'created_at is set by SQLite using the local time when the row is inserted.'
    ],
    flowJson: `[
  {
    "id": "sql_prep_fn",
    "type": "function",
    "z": "tab_database_sqlite",
    "name": "Prepare Parameterized INSERT Statement",
    "func": "/* Paste functionScript here */",
    "outputs": 1,
    "x": 380,
    "y": 160,
    "wires": [["sqlite_writer_node"]]
  },
  {
    "id": "sqlite_writer_node",
    "type": "sqlite",
    "z": "tab_database_sqlite",
    "name": "cms.sqlite (WAL Engine)",
    "mydb": "cms_sqlite_wal_config",
    "sqlquery": "via msg.topic",
    "sql": "",
    "x": 640,
    "y": 160,
    "wires": [["log_insert_confirmation"]]
  }
]`,
    hardwareSpecs: [
      {
        component: 'SQLite 3 Database Engine',
        wiring: 'Database file: backend/cms.sqlite (WAL mode enabled)',
        purpose: 'Zero-configuration, serverless, self-contained relational SQL database engine'
      },
      {
        component: 'Directus Headless CMS v10/11',
        wiring: 'Connected to cms.sqlite via Knex SQLite3 dialect',
        purpose: 'Auto-generates REST/GraphQL API and administrative visual dashboard'
      },
      {
        component: 'FeathersJS Backend Core',
        wiring: 'Port 3030 / Socket.io / Knex service adapters',
        purpose: 'Serves API endpoints, executes business logic, and emits real-time events'
      }
    ],
    directusIntegration: {
      tableName: 'readings',
      tableDescription:
        'Core relational table storing every 5-second sensor telemetry record from ESP32 edge nodes.',
      fields: [
        { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT', desc: 'Unique record identifier' },
        { name: 'distance_cm', type: 'FLOAT', desc: 'Ultrasonic distance reading in centimeters' },
        { name: 'soil_percent', type: 'INTEGER', desc: 'Soil moisture percentage (0-100%)' },
        { name: 'light_lux', type: 'FLOAT', desc: 'BH1750 ambient illuminance in lux' },
        { name: 'rssi', type: 'INTEGER', desc: 'Wi-Fi received signal strength indicator in dBm' },
        { name: 'status', type: 'VARCHAR(20)', desc: 'NORMAL | WARNING | CRITICAL' },
        { name: 'created_at', type: 'DATETIME', desc: 'ISO 8601 publication timestamp' }
      ],
      sampleRecord: `{
  "id": 8421,
  "distance_cm": 15.2,
  "soil_percent": 62,
  "light_lux": 218,
  "rssi": -52,
  "status": "NORMAL",
  "created_at": "2026-10-25T10:19:40.000Z"
}`,
      studioAction: 'Open Schema Studio in Directus CMS'
    },
    labExercise: {
      title: 'Laboratory Exercise 03: Verifying WAL Concurrency & Directus Reflection',
      overview:
        'Configure SQLite in WAL mode, simulate high-frequency concurrent telemetry writes from Node-RED while performing complex filter queries in Directus Studio, and verify that zero database locks occur.',
      prerequisites: 'SQLite 3 CLI or DB Browser for SQLite, Feathers backend running, Directus Studio active.',
      steps: [
        'Verify WAL mode: sqlite3 backend/cms.sqlite "PRAGMA journal_mode;" (should output: "wal").',
        'In Node-RED, trigger the Ingestion flow to write 100 rows into readings.',
        'Concurrently in Directus Studio, navigate to the Foundational Topics / Telemetry collection.',
        'Apply filters: status = "NORMAL" and sort by created_at DESC.',
        'Inspect the filesystem: observe the temporary cms.sqlite-wal journal handling writes concurrently.',
        'Verify that Directus Studio reads updated rows seamlessly without SQLITE_BUSY lock errors.'
      ],
      expectedResult:
        'All 100 writes commit cleanly while Directus Studio displays live query results without blocking.'
    }
  }
};
