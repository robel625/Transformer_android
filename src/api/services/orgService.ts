import apiClient from '../apiClient';

const orgService = {
  getOrgList: async () => {
    return apiClient.get('/auth/regions');
  },

  updateOrganization: async (id: string, data: any) => {
    return apiClient.put(`/auth/regions/${id}`, data);
  },

  // Region operations
  createRegion: async (data: any) => {
    return apiClient.post('/auth/regions', data);
  },

  updateRegion: async (cscCode: string, data: any) => {
    return apiClient.put(`/auth/regions/${cscCode}`, data);
  },

  getRegionOnly: async () => {
    return apiClient.get('/auth/regionsOnly');
  },

  deleteRegion: async (cscCode: string) => {
    return apiClient.delete(`/auth/regions/${cscCode}`);
  },

  // CSC operations
  createCSC: async (data: any) => {
    return apiClient.post('/auth/csc', data);
  },

  updateCSC: async (cscCode: string, data: any) => {
    return apiClient.put(`/auth/csc/${cscCode}`, data);
  },

  getRegionCSC: async () => {
    return apiClient.get('/auth/csc');
  },

  deleteCSC: async (cscCode: string) => {
    return apiClient.delete(`/auth/csc/${cscCode}`);
  },

  getCSCOnly: async (cscCode: string) => {
    return apiClient.get(`/auth/regions/${cscCode}/csc`);
  },

  // Substation & Feeder operations
  createSubstation: async (data: any) => {
    return apiClient.post('/auth/substation', data);
  },

  deleteSubstation: async (id: string) => {
    return apiClient.delete(`/auth/substation/${id}`);
  },

  deleteFeeder: async (id: string) => {
    return apiClient.delete(`/auth/feeders/${id}`);
  },
};

export default orgService;

