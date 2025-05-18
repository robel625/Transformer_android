import apiClient from '../apiClient';

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

const roleService = {
  // Permission operations
  createPermission: async (data: Partial<Permission>) => {
    return apiClient.post('/auth/permissions', data);
  },

  getPermissions: async () => {
    return apiClient.get('/auth/permissions');
  },

  getPopulatedPermissions: async () => {
    return apiClient.get('/auth/populatedPermissions');
  },

  updatePermission: async (id: string, data: Partial<Permission>) => {
    return apiClient.patch(`/auth/permissions/${id}`, data);
  },

  deletePermission: async (id: string) => {
    return apiClient.delete(`/auth/permissions/${id}`);
  },

  // Role operations
  createRole: async (data: Partial<Role>) => {
    return apiClient.post('/auth/roles', data);
  },

  getRoles: async () => {
    return apiClient.get('/auth/roles');
  },

  updateRole: async (id: string, data: Partial<Role>) => {
    return apiClient.patch(`/auth/roles/${id}`, data);
  },

  deleteRole: async (id: string) => {
    return apiClient.delete(`/auth/roles/${id}`);
  },
};

export default roleService;

