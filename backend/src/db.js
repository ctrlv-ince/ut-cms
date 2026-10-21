const path = require('path');
const fs = require('fs');
const knex = require('knex');

const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const uploadsDir = path.resolve(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(dbDir, 'cms.sqlite')
  },
  useNullAsDefault: true
});

async function initializeDatabase() {
  // 1. Collections Meta (Directus Schema / Collection Registry)
  const hasCollections = await db.schema.hasTable('collections_meta');
  if (!hasCollections) {
    await db.schema.createTable('collections_meta', (table) => {
      table.string('id').primary(); // e.g. 'articles'
      table.string('name').notNullable();
      table.string('slug').notNullable().unique();
      table.string('icon').defaultTo('folder');
      table.string('color').defaultTo('#6644ff');
      table.text('description');
      table.boolean('singleton').defaultTo(false);
      table.boolean('system').defaultTo(false);
      table.text('fields'); // JSON serialized field definitions
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
  }

  // 2. Articles Table
  const hasArticles = await db.schema.hasTable('articles');
  if (!hasArticles) {
    await db.schema.createTable('articles', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('slug').notNullable().unique();
      table.string('category').defaultTo('Insights');
      table.text('excerpt');
      table.text('content');
      table.string('cover_image');
      table.string('author_name').defaultTo('Editorial Team');
      table.string('author_role').defaultTo('Lead Analyst');
      table.string('author_avatar');
      table.string('reading_time').defaultTo('5 min read');
      table.string('status').defaultTo('published'); // published, draft, archived
      table.boolean('featured').defaultTo(false);
      table.integer('views').defaultTo(0);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
  }

  // 3. Services Table
  const hasServices = await db.schema.hasTable('services');
  if (!hasServices) {
    await db.schema.createTable('services', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('slug').notNullable().unique();
      table.string('category').defaultTo('Consulting');
      table.text('short_description');
      table.text('detailed_description');
      table.string('icon').defaultTo('cpu');
      table.string('badge').defaultTo('Enterprise');
      table.text('features'); // JSON array of features
      table.integer('order_num').defaultTo(0);
      table.string('status').defaultTo('published'); // published, draft
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
  }

  // 4. Team Table
  const hasTeam = await db.schema.hasTable('team');
  if (!hasTeam) {
    await db.schema.createTable('team', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('role').notNullable();
      table.string('department').defaultTo('Executive');
      table.text('bio');
      table.string('avatar');
      table.string('email');
      table.string('linkedin');
      table.string('twitter');
      table.integer('order_num').defaultTo(0);
      table.string('status').defaultTo('published');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
  }

  // 5. Inquiries Table
  const hasInquiries = await db.schema.hasTable('inquiries');
  if (!hasInquiries) {
    await db.schema.createTable('inquiries', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable();
      table.string('phone');
      table.string('company');
      table.string('subject');
      table.string('service_interest');
      table.text('message').notNullable();
      table.string('status').defaultTo('new'); // new, in_review, contacted, resolved, archived
      table.string('priority').defaultTo('normal'); // low, normal, high, urgent
      table.text('internal_notes');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
  }

  // 6. Media Library Table
  const hasMedia = await db.schema.hasTable('media');
  if (!hasMedia) {
    await db.schema.createTable('media', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('filename').notNullable();
      table.string('original_name');
      table.string('mime_type').defaultTo('image/jpeg');
      table.integer('file_size').defaultTo(0);
      table.string('url').notNullable();
      table.string('thumbnail_url');
      table.string('folder').defaultTo('General');
      table.string('tags').defaultTo('');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 7. Site Settings Table (Singleton)
  const hasSettings = await db.schema.hasTable('settings');
  if (!hasSettings) {
    await db.schema.createTable('settings', (table) => {
      table.increments('id').primary();
      table.string('site_name').defaultTo('Nexus Directus Corporate');
      table.string('tagline').defaultTo('Enterprise Content & Digital Transformation Portal');
      table.text('hero_title').defaultTo('Pioneering Next-Generation Digital Experiences');
      table.text('hero_subtitle').defaultTo('Power your enterprise with intelligent cloud systems, bespoke architectures, and real-time headless CMS orchestration.');
      table.string('contact_email').defaultTo('hello@nexus-corporate.io');
      table.string('contact_phone').defaultTo('+1 (888) 492-3000');
      table.string('office_address').defaultTo('742 Silicon Valley Boulevard, Suite 500, San Francisco, CA');
      table.string('primary_color').defaultTo('#6644ff');
      table.boolean('inquiries_enabled').defaultTo(true);
      table.text('social_links'); // JSON object
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
  }

  // 8. Activity Log Table
  const hasActivity = await db.schema.hasTable('activity_log');
  if (!hasActivity) {
    await db.schema.createTable('activity_log', (table) => {
      table.increments('id').primary();
      table.string('action').notNullable(); // CREATE, UPDATE, DELETE, PUBLISH
      table.string('collection').notNullable();
      table.string('item_id');
      table.string('item_title');
      table.string('user').defaultTo('Admin User');
      table.text('details');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  console.log('[SQLite DB] Schema tables verified & ready.');
}

module.exports = {
  db,
  initializeDatabase
};
