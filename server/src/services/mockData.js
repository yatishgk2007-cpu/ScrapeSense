/**
 * mockData.js
 * Centralized realistic mock data for MOCK_MODE=true.
 * These are fictional competitors used for demonstration only.
 * dataSource: "mock" is always set to distinguish from real Bright Data results.
 */

const MOCK_COMPETITORS = [
  {
    id: 1,
    name: 'Notion',
    url: 'https://www.notion.com/pricing',
    status: 'active',
    health: 100,
    lastScrape: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    plans: [
      {
        name: 'Free',
        price: 0,
        billingPeriod: 'month',
        features: ['Unlimited pages', 'Basic blocks', 'Collaborate with 10 guests'],
        limits: { members: 1, storage: '5MB' },
      },
      {
        name: 'Plus',
        price: 10,
        billingPeriod: 'month',
        features: ['Unlimited blocks', 'Unlimited file uploads', 'Version history (30 days)', 'Custom domain'],
        limits: { members: 'unlimited', storage: 'unlimited' },
      },
      {
        name: 'Business',
        price: 15,
        billingPeriod: 'month',
        features: ['SAML SSO', 'Version history (90 days)', 'Bulk PDF export', 'Advanced analytics'],
        limits: { members: 'unlimited', storage: 'unlimited' },
      },
      {
        name: 'Enterprise',
        price: null,
        billingPeriod: 'custom',
        features: ['SAML SSO', 'Advanced security', 'Dedicated CSM', 'Custom contract'],
        limits: { members: 'unlimited', storage: 'unlimited' },
      },
    ],
  },
  {
    id: 2,
    name: 'Coda',
    url: 'https://coda.io/pricing',
    status: 'active',
    health: 97,
    lastScrape: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    plans: [
      {
        name: 'Free',
        price: 0,
        billingPeriod: 'month',
        features: ['Unlimited docs', 'Basic formulas', '1000 row limit per table'],
        limits: { members: 'unlimited', rows: 1000 },
      },
      {
        name: 'Pro',
        price: 10,
        billingPeriod: 'month',
        features: ['Unlimited rows', 'Version history', 'Custom branding', 'Priority support'],
        limits: { members: 'unlimited', rows: 'unlimited' },
      },
      {
        name: 'Team',
        price: 30,
        billingPeriod: 'month',
        features: ['Admin controls', 'Advanced permissions', 'SAML SSO', 'Audit logs'],
        limits: { members: 'unlimited', rows: 'unlimited' },
      },
      {
        name: 'Enterprise',
        price: null,
        billingPeriod: 'custom',
        features: ['Custom contract', 'SLA', 'Dedicated support'],
        limits: { members: 'unlimited', rows: 'unlimited' },
      },
    ],
  },
  {
    id: 3,
    name: 'Confluence',
    url: 'https://www.atlassian.com/software/confluence/pricing',
    status: 'healing',
    health: 42,
    lastScrape: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    plans: [
      {
        name: 'Free',
        price: 0,
        billingPeriod: 'month',
        features: ['Up to 10 users', 'Unlimited pages', 'Basic templates'],
        limits: { members: 10, storage: '2GB' },
      },
      {
        name: 'Standard',
        price: 5.75,
        billingPeriod: 'month',
        features: ['Unlimited users', 'Analytics', 'Page history (unlimited)', 'Audit logs'],
        limits: { members: 'unlimited', storage: '250GB' },
      },
      {
        name: 'Premium',
        price: 11,
        billingPeriod: 'month',
        features: ['Advanced analytics', 'Team calendars', 'Priority support', 'Whiteboards'],
        limits: { members: 'unlimited', storage: 'unlimited' },
      },
    ],
  },
  {
    id: 4,
    name: 'ClickUp',
    url: 'https://clickup.com/pricing',
    status: 'active',
    health: 100,
    lastScrape: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    plans: [
      {
        name: 'Free Forever',
        price: 0,
        billingPeriod: 'month',
        features: ['100MB storage', 'Unlimited tasks', 'Two-factor authentication'],
        limits: { members: 'unlimited', storage: '100MB' },
      },
      {
        name: 'Unlimited',
        price: 7,
        billingPeriod: 'month',
        features: ['Unlimited storage', 'Unlimited integrations', 'Unlimited dashboards', 'Guests'],
        limits: { members: 'unlimited', storage: 'unlimited' },
      },
      {
        name: 'Business',
        price: 12,
        billingPeriod: 'month',
        features: ['Google SSO', 'Advanced automation', 'Custom exporting', 'Workload management'],
        limits: { members: 'unlimited', storage: 'unlimited' },
      },
      {
        name: 'Enterprise',
        price: null,
        billingPeriod: 'custom',
        features: ['SAML SSO', 'Custom roles', 'Dedicated CSM', 'Advanced permissions'],
        limits: { members: 'unlimited', storage: 'unlimited' },
      },
    ],
  },
];

/**
 * Previous snapshots — used by changeDetectionService to diff against current.
 * Reflect realistic pricing history for demo.
 */
const MOCK_PREVIOUS_SNAPSHOTS = {
  1: {
    // Notion — Plus plan was $8, now $10
    plans: [
      { name: 'Free', price: 0 },
      { name: 'Plus', price: 8 },
      { name: 'Business', price: 15 },
      { name: 'Enterprise', price: null },
    ],
  },
  2: {
    // Coda — had a "Starter" plan, now removed
    plans: [
      { name: 'Free', price: 0 },
      { name: 'Starter', price: 5 },
      { name: 'Pro', price: 10 },
      { name: 'Team', price: 30 },
    ],
  },
  3: {
    // Confluence — Standard was $4.89, now $5.75
    plans: [
      { name: 'Free', price: 0 },
      { name: 'Standard', price: 4.89 },
      { name: 'Premium', price: 11 },
    ],
  },
  4: {
    // ClickUp — Business was $12, added "Enterprise" plan
    plans: [
      { name: 'Free Forever', price: 0 },
      { name: 'Unlimited', price: 7 },
      { name: 'Business', price: 12 },
    ],
  },
};

const MOCK_CHANGES = [
  {
    id: 1,
    competitor_id: 1,
    competitorName: 'Notion',
    change_type: 'PRICE_CHANGED',
    field_name: 'Plus plan monthly price',
    old_value: '$8/month',
    new_value: '$10/month',
    detected_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    competitor_id: 2,
    competitorName: 'Coda',
    change_type: 'PLAN_REMOVED',
    field_name: 'Starter',
    old_value: '$5/month',
    new_value: null,
    detected_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    competitor_id: 3,
    competitorName: 'Confluence',
    change_type: 'PRICE_CHANGED',
    field_name: 'Standard plan monthly price',
    old_value: '$4.89/month',
    new_value: '$5.75/month',
    detected_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    competitor_id: 4,
    competitorName: 'ClickUp',
    change_type: 'PLAN_ADDED',
    field_name: 'Enterprise',
    old_value: null,
    new_value: 'Custom pricing',
    detected_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    competitor_id: 1,
    competitorName: 'Notion',
    change_type: 'FEATURE_ADDED',
    field_name: 'Business plan',
    old_value: null,
    new_value: 'Advanced analytics',
    detected_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_HEALING_EVENTS = [
  {
    id: 1,
    job_id: 'mock-job-001',
    collector_id: 'mock-collector',
    status: 'RECOVERED',
    error_message: 'CSS selector .pricing-table-v2 not found',
    action: 'DOM selector updated to .pricing-section',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    job_id: 'mock-job-002',
    collector_id: 'mock-collector',
    status: 'RECOVERED',
    error_message: 'Price element changed from span.price to div.plan-price',
    action: 'Selector repaired via Bright Data Studio analysis',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
  },
];

module.exports = {
  MOCK_COMPETITORS,
  MOCK_PREVIOUS_SNAPSHOTS,
  MOCK_CHANGES,
  MOCK_HEALING_EVENTS,
};
