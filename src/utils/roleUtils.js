const ROLE_KEYS = [
  'role',
  'user_role',
  'userRole',
  'employee_role',
  'employeeRole',
  'designation',
  'type',
];

const normalizeRole = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const pickRoleFromObject = (obj) => {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of ROLE_KEYS) {
    const candidate = normalizeRole(obj[key]);
    if (candidate) {
      return candidate.toLowerCase();
    }
  }
  return null;
};

const digForRole = (payload) => {
  if (!payload) return null;

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nested = digForRole(item);
      if (nested) return nested;
    }
    return null;
  }

  if (typeof payload === 'string') {
    const normalized = normalizeRole(payload);
    return normalized ? normalized.toLowerCase() : null;
  }

  if (typeof payload !== 'object') return null;

  const direct = pickRoleFromObject(payload);
  if (direct) return direct;

  const nestedCandidates = [
    payload.data,
    payload.user,
    payload.employee,
    payload.profile,
    payload.details,
    payload.record,
    payload.payload,
  ];

  for (const candidate of nestedCandidates) {
    const nestedRole = digForRole(candidate);
    if (nestedRole) return nestedRole;
  }

  return null;
};

export const detectRoleFromPayload = (payload) => digForRole(payload);







