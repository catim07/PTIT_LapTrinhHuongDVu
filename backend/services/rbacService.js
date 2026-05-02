import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

export const DEFAULT_PERMISSIONS = [
  { key: 'products.read', group: 'products', label: 'Read products' },
  { key: 'products.write', group: 'products', label: 'Write products' },
  { key: 'orders.read', group: 'orders', label: 'Read orders' },
  { key: 'orders.write', group: 'orders', label: 'Write orders' },
  { key: 'inventory.read', group: 'inventory', label: 'Read inventory' },
  { key: 'inventory.write', group: 'inventory', label: 'Write inventory' },
  { key: 'imports.read', group: 'imports', label: 'Read imports' },
  { key: 'imports.write', group: 'imports', label: 'Write imports' },
  { key: 'suppliers.read', group: 'suppliers', label: 'Read suppliers' },
  { key: 'suppliers.write', group: 'suppliers', label: 'Write suppliers' },
  { key: 'promotions.read', group: 'promotions', label: 'Read promotions' },
  { key: 'promotions.write', group: 'promotions', label: 'Write promotions' },
  { key: 'coupons.read', group: 'coupons', label: 'Read coupons' },
  { key: 'coupons.write', group: 'coupons', label: 'Write coupons' },
  { key: 'events.read', group: 'events', label: 'Read events' },
  { key: 'events.write', group: 'events', label: 'Write events' },
  { key: 'settings.read', group: 'settings', label: 'Read settings' },
  { key: 'settings.write', group: 'settings', label: 'Write settings' },
  { key: 'audit.read', group: 'audit', label: 'Read audit logs' },
];

const DEFAULT_ROLES = [
  {
    key: 'super_admin',
    name: 'Super Admin',
    role_id: 1,
    is_system: true,
    permissions: DEFAULT_PERMISSIONS.map((p) => p.key),
  },
  {
    key: 'admin',
    name: 'Admin',
    role_id: 2,
    is_system: true,
    permissions: [
      'products.read', 'products.write',
      'orders.read', 'orders.write',
      'inventory.read', 'inventory.write',
      'imports.read', 'imports.write',
      'suppliers.read', 'suppliers.write',
      'promotions.read', 'promotions.write',
      'coupons.read', 'coupons.write',
      'events.read', 'events.write',
      'settings.read', 'settings.write',
      'audit.read',
    ],
  },
  {
    key: 'manager',
    name: 'Manager',
    role_id: 4,
    is_system: true,
    permissions: [
      'products.read', 'products.write',
      'orders.read',
      'inventory.read', 'inventory.write',
      'imports.read', 'imports.write',
      'suppliers.read',
      'promotions.read',
      'coupons.read',
      'events.read',
      'settings.read',
      'audit.read',
    ],
  },
  {
    key: 'staff',
    name: 'Staff',
    role_id: 5,
    is_system: true,
    permissions: [
      'products.read',
      'orders.read',
      'inventory.read',
      'imports.read',
      'suppliers.read',
    ],
  },
  {
    key: 'customer',
    name: 'Customer',
    role_id: 3,
    is_system: true,
    permissions: [],
  },
];

const ROLE_ID_TO_KEY = {
  1: 'super_admin',
  2: 'admin',
  3: 'customer',
  4: 'manager',
  5: 'staff',
};

export const mapRoleIdToKey = (roleId) => ROLE_ID_TO_KEY[Number(roleId)] || 'customer';

export async function ensureRbacSeed() {
  for (const perm of DEFAULT_PERMISSIONS) {
    await Permission.findOneAndUpdate(
      { key: perm.key },
      { $setOnInsert: { ...perm, is_active: true } },
      { upsert: true, new: true }
    );
  }

  for (const role of DEFAULT_ROLES) {
    await Role.findOneAndUpdate(
      { key: role.key },
      {
        $setOnInsert: {
          key: role.key,
          name: role.name,
          role_id: role.role_id,
          is_system: role.is_system,
          is_active: true,
          permissions: role.permissions,
        },
      },
      { upsert: true, new: true }
    );
  }
}

export async function getRoleByUser(user) {
  if (!user) return null;
  const roleKey = user.role_key || mapRoleIdToKey(user.role_id);
  return Role.findOne({ key: roleKey, is_active: true }).lean();
}

export async function getPermissionsForUser(user) {
  if (!user) return [];
  if (Number(user.role_id) === 1) {
    const all = await Permission.find({ is_active: true }).select('key -_id').lean();
    return all.map((p) => p.key);
  }
  if (Array.isArray(user.permissions) && user.permissions.length > 0) return user.permissions;

  const role = await getRoleByUser(user);
  return Array.isArray(role?.permissions) ? role.permissions : [];
}

export default { ensureRbacSeed, getPermissionsForUser, mapRoleIdToKey };
