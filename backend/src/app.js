const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { KnexService } = require('@feathersjs/knex');
const { db, readingsDb } = require('./db');

// Multer storage for media uploads
const uploadsDir = path.resolve(__dirname, '../public/uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const app = express(feathers());

// Enable CORS & body parsing
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Host static uploaded files
app.use('/uploads', express.static(uploadsDir));

// Configure REST transport
app.configure(express.rest());

// Configure Socket.io transport with CORS
app.configure(socketio({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
}));

// Real-time channel setup
app.on('connection', (connection) => {
  app.channel('everybody').join(connection);
});
app.publish(() => app.channel('everybody'));

// Activity logger hook
async function logActivityHook(context) {
  if (['create', 'patch', 'update', 'remove'].includes(context.method)) {
    try {
      const actionMap = {
        create: 'CREATE',
        patch: 'UPDATE',
        update: 'UPDATE',
        remove: 'DELETE'
      };
      const collection = context.path.replace('api/', '');
      if (collection === 'activity') return context;

      const itemTitle = context.result ? (context.result.title || context.result.name || context.result.subject || `#${context.id || 'item'}`) : `#${context.id}`;
      
      await db('activity_log').insert({
        action: actionMap[context.method] || 'ACTION',
        collection: collection,
        item_id: String(context.id || (context.result && context.result.id) || ''),
        item_title: String(itemTitle).substring(0, 200),
        user: 'Directus Admin',
        details: JSON.stringify(context.data || { removedId: context.id })
      });
    } catch (err) {
      console.warn('[Activity Log Warning]', err.message);
    }
  }
  return context;
}

// Register SQLite Knex Services (Main CMS Database: cms.sqlite)
const collectionsList = [
  { name: 'articles', path: 'api/articles' },
  { name: 'services', path: 'api/services' },
  { name: 'team', path: 'api/team' },
  { name: 'inquiries', path: 'api/inquiries' },
  { name: 'media', path: 'api/media' },
  { name: 'settings', path: 'api/settings' },
  { name: 'collections_meta', path: 'api/collections' },
  { name: 'activity_log', path: 'api/activity' }
];

collectionsList.forEach(col => {
  app.use(col.path, new KnexService({
    Model: db,
    name: col.name,
    paginate: false,
    multi: true
  }));

  // Attach activity logging hook
  app.service(col.path).hooks({
    after: {
      create: [logActivityHook],
      patch: [logActivityHook],
      remove: [logActivityHook]
    }
  });
});

// Register Sensor Readings Service (Separate Database: readings.sqlite)
app.use('api/readings', new KnexService({
  Model: readingsDb,
  name: 'readings',
  paginate: false,
  multi: true
}));

// Custom Dashboard Stats Service (Directus Insights)
app.use('api/stats', {
  async find() {
    const [articlesCount] = await db('articles').count('id as count');
    const [publishedArticles] = await db('articles').where('status', 'published').count('id as count');
    const [servicesCount] = await db('services').count('id as count');
    const [teamCount] = await db('team').count('id as count');
    const [inquiriesCount] = await db('inquiries').count('id as count');
    const [newInquiriesCount] = await db('inquiries').where('status', 'new').count('id as count');
    const [mediaCount] = await db('media').count('id as count');
    const [collectionsCount] = await db('collections_meta').count('id as count');

    const recentInquiries = await db('inquiries').orderBy('created_at', 'desc').limit(5);
    const recentActivity = await db('activity_log').orderBy('created_at', 'desc').limit(8);
    const recentArticles = await db('articles').orderBy('created_at', 'desc').limit(5);

    // Sum views
    const viewsResult = await db('articles').sum('views as total_views').first();

    return {
      overview: {
        articles: Number(articlesCount.count),
        publishedArticles: Number(publishedArticles.count),
        services: Number(servicesCount.count),
        team: Number(teamCount.count),
        inquiries: Number(inquiriesCount.count),
        newInquiries: Number(newInquiriesCount.count),
        media: Number(mediaCount.count),
        collections: Number(collectionsCount.count),
        totalViews: Number(viewsResult?.total_views || 0)
      },
      recentInquiries,
      recentActivity,
      recentArticles,
      systemInfo: {
        cmsEngine: 'Directus-Style CMS (FeathersJS Core + Knex SQLite3)',
        database: 'SQLite 3 (WAL mode)',
        feathersVersion: '5.x',
        realtime: 'Socket.io Transport Active',
        serverUptime: Math.floor(process.uptime())
      }
    };
  }
});

// Directus Dynamic Schema Inspector Service
app.use('api/schema', {
  async find() {
    const tables = ['articles', 'services', 'team', 'inquiries', 'media', 'settings', 'collections_meta', 'activity_log', 'readings'];
    const schemaDetails = [];

    for (const table of tables) {
      const targetDb = table === 'readings' ? readingsDb : db;
      const columnInfo = await targetDb(table).columnInfo();
      const meta = await db('collections_meta').where('id', table).first();
      const [countResult] = await targetDb(table).count('* as count');

      schemaDetails.push({
        table,
        database: table === 'readings' ? 'readings.sqlite' : 'cms.sqlite',
        meta: meta ? { ...meta, fields: typeof meta.fields === 'string' ? JSON.parse(meta.fields) : meta.fields } : null,
        columns: columnInfo,
        itemCount: Number(countResult.count)
      });
    }

    return {
      database: 'cms.sqlite + readings.sqlite',
      collections: schemaDetails
    };
  }
});

// Media Upload REST Route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const host = req.protocol + '://' + req.get('host');
    const fileUrl = `${host}/uploads/${req.file.filename}`;
    const mediaItem = {
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      file_size: req.file.size,
      url: fileUrl,
      thumbnail_url: fileUrl,
      folder: req.body.folder || 'Uploads',
      tags: req.body.tags || 'upload'
    };

    const [id] = await db('media').insert(mediaItem);
    const created = await db('media').where('id', id).first();

    // Log upload activity
    await db('activity_log').insert({
      action: 'UPLOAD',
      collection: 'media',
      item_id: String(id),
      item_title: created.title,
      user: 'Directus Admin',
      details: JSON.stringify({ filename: req.file.filename, size: req.file.size })
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Directus System Health & Info
app.get('/api/server-info', (req, res) => {
  res.json({
    name: 'Directus CMS Headless API',
    version: '1.0.0',
    backend: 'FeathersJS Core + Knex + SQLite3',
    status: 'ONLINE',
    timestamp: new Date().toISOString()
  });
});

// Configure Express Error Handler
app.use(express.errorHandler());

module.exports = app;
