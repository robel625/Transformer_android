import apiClient from '../apiClient';

export type ModelType = 'Transformer Data' | 'Inspection' | 'LV Feeder' | 'Basestation';

const MODEL_PREFIXES: Record<ModelType, string> = {
  'Transformer Data': 'TR',
  'Inspection': 'IN',
  'LV Feeder': 'LV',
  'Basestation': 'BS'
};

const logService = {
  getActivityLogs: async (params: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    return apiClient.get('/api/logs/activity', { params });
  },

  getErrorLogs: async (params: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    return apiClient.get('/api/logs/errors', { params });
  },

  getDataChangeLogs: async (params: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    changedBy?: string;
    modelName?: string;
    fieldName?: string;
  } = {}) => {
    return apiClient.get('/api/logs/changes', { params });
  },

  clearLogs: {
    activity: () => apiClient.delete('/api/logs/activity_clear'),
    errors: () => apiClient.delete('/api/logs/errors_clear'),
    changes: () => apiClient.delete('/api/logs/changes_clear'),
  },

  getSpecificChangeLogs: async (
    id: string,
    modelType: ModelType,
    params: {
      page?: number;
      pageSize?: number;
      user?: string;
      changedBy?: string;
      fieldName?: string;
    } = {}
  ) => {
    const prefix = MODEL_PREFIXES[modelType];
    const recordId = `${prefix}-${id}`;

    return apiClient.get('/api/logs/changes', {
      params: {
        ...params,
        model_name: modelType,
        record_id: recordId,
      },
    });
  },
};

export default logService;

