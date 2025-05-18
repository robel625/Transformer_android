import apiClient from '../apiClient';
import { syncService, dataSyncService } from '../../services';
import NetInfo from '@react-native-community/netinfo';

export interface BasestationReq {
  station_code: string;
  region: string;
  csc: string;
  substation: string;
  feeder: string;
  address: string;
  gps_location: string;
  station_type?: string;
}

const transformerService = {
  // Basestation operations
  createBasestation: async (data: BasestationReq) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.post('/api/transformer/basestations/', data);
    } else {
      // Store for later sync
      return syncService.addToQueue({
        endpoint: '/api/transformer/basestations/',
        method: 'POST',
        title: 'Create Basestation',
        data
      });
    }
  },

  getBasestations: async (params: { page?: number, pageSize?: number } = {}) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.get('/api/transformer/basestations/', { params });
    } else {
      // Use local data when offline
      console.log('Network offline, using local basestation data');
      try {
        const localData = await dataSyncService.getLocalBasestations();
        
        // Apply pagination to local data
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        const paginatedData = localData.slice(startIndex, endIndex);
        
        return {
          count: localData.length,
          next: endIndex < localData.length ? `/api/transformer/basestations/?page=${page + 1}` : null,
          previous: page > 1 ? `/api/transformer/basestations/?page=${page - 1}` : null,
          results: paginatedData.map(item => ({
            station_code: item.station_code,
            region: item.region,
            regionId: item.region_id,
            csc: item.csc,
            cscId: item.csc_id,
            substation: item.substation,
            substationId: item.substation_id,
            feeder: item.feeder,
            feederId: item.feeder_id,
            address: item.address,
            gps_location: item.gps_location,
            station_type: item.station_type,
            created_by: item.created_by,
            updated_by: item.updated_by
          }))
        };
      } catch (error) {
        console.error('Error fetching local basestation data:', error);
        throw new Error('Failed to fetch basestation data while offline');
      }
    }
  },

  getBasestation: async (stationCode: string) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.get(`/api/transformer/basestations/${stationCode}/`);
    } else {
      // Use local data when offline
      console.log(`Network offline, using local data for basestation ${stationCode}`);
      try {
        const basestation = await dataSyncService.getLocalBasestationByStationCode(stationCode);
        
        if (!basestation) {
          throw new Error(`Basestation ${stationCode} not found in local database`);
        }
        
        return {
          station_code: basestation.station_code,
          region: basestation.region,
          regionId: basestation.region_id,
          csc: basestation.csc,
          cscId: basestation.csc_id,
          substation: basestation.substation,
          substationId: basestation.substation_id,
          feeder: basestation.feeder,
          feederId: basestation.feeder_id,
          address: basestation.address,
          gps_location: basestation.gps_location,
          station_type: basestation.station_type,
          created_by: basestation.created_by,
          updated_by: basestation.updated_by
        };
      } catch (error) {
        console.error(`Error fetching local data for basestation ${stationCode}:`, error);
        throw new Error(`Failed to fetch basestation ${stationCode} while offline`);
      }
    }
  },

  updateBasestation: async (stationCode: string, data: Partial<BasestationReq>) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.patch(`/api/transformer/basestations/${stationCode}/`, data);
    } else {
      return syncService.addToQueue({
        endpoint: `/api/transformer/basestations/${stationCode}/`,
        method: 'PATCH',
        title: 'Update Basestation',
        data
      });
    }
  },

  deleteBasestation: async (stationCode: string) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.delete(`/api/transformer/basestations/${stationCode}/`);
    } else {
      return syncService.addToQueue({
        endpoint: `/api/transformer/basestations/${stationCode}/`,
        method: 'DELETE',
        title: 'Delete Basestation',
        data: null
      });
    }
  },

  // // Transformer operations
  // createTransformer: async (data: any) => {
  //   return apiClient.post('/api/transformer/transformerdata/', data);
  // },

  createTransformer: async (data: any) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      try {
        const response = await apiClient.post<any>('/api/transformer/transformerdata/', data);
        return response; // Return the created transformer data
      } catch (error) {
        console.log("Error creating Transformer:", error.response?.data);
        if (error.response?.data?.basestation?.[0]?.includes("object does not exist")) {
          return { error: "Base Station does not exist" };
        }
        else if (error.response?.data?.basestation?.[0]?.includes("transformer data with this basestation already exists.")) {
          return { error: "Transformer with this Base Station already exists." };
        }
        else if (error.response?.data?.serial_number?.[0]?.includes("with this Serial Number already exists.")) {
          return { error: "Transformer with this Serial Number already exists." };
        }
        else if (error.response?.data) {
          return { error: JSON.stringify(error.response?.data) };
        }
        throw new Error("Failed to create Transformer");
      }
    } else {
      return syncService.addToQueue({
        endpoint: '/api/transformer/transformerdata/',
        method: 'POST',
        title: 'Create Transformer',
        data
      });
    }
  },

  getTransformer: async (params: { page?: number, pageSize?: number } = {}) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.get('/api/transformer/transformerdata', { params });
    } else {
      // Use local data when offline
      console.log('Network offline, using local transformer data');
      try {
        const localData = await dataSyncService.getLocalTransformerData();
        
        // Apply pagination to local data
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        const paginatedData = localData.slice(startIndex, endIndex);
        
        return {
          count: localData.length,
          next: endIndex < localData.length ? `/api/transformer/transformerdata?page=${page + 1}` : null,
          previous: page > 1 ? `/api/transformer/transformerdata?page=${page - 1}` : null,
          results: paginatedData.map(item => ({
            id: item.transformer_id,
            trafo_type: item.trafo_type,
            capacity: item.capacity,
            dt_number: item.dt_number,
            primary_voltage: item.primary_voltage,
            colling_type: item.colling_type,
            serial_number: item.serial_number,
            manufacturer: item.manufacturer,
            vector_group: item.vector_group,
            impedance_voltage: item.impedance_voltage,
            winding_weight: item.winding_weight,
            oil_weight: item.oil_weight,
            year_of_manufacturing: item.year_of_manufacturing,
            date_of_installation: item.date_of_installation ? 
              new Date(item.date_of_installation).toISOString().split('T')[0] : null,
            service_type: item.service_type,
            status: item.status,
            basestation: item.basestation_id,
            created_by: item.created_by,
            updated_by: item.updated_by
          }))
        };
      } catch (error) {
        console.error('Error fetching local transformer data:', error);
        throw new Error('Failed to fetch transformer data while offline');
      }
    }
  },

  getPopulatedTransformer: async (id: string) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.get(`/api/transformer/populatedtransformerdata/${id}/`);
    } else {
      // Use local data when offline
      console.log(`Network offline, using local data for transformer ${id}`);
      try {
        const transformer = await dataSyncService.getLocalTransformerById(id);
        
        if (!transformer) {
          throw new Error(`Transformer ${id} not found in local database`);
        }
        
        // Get basestation data
        const basestation = await dataSyncService.getLocalBasestationByStationCode(transformer.basestation_id);
        
        return {
          id: transformer.transformer_id,
          trafo_type: transformer.trafo_type,
          capacity: transformer.capacity,
          dt_number: transformer.dt_number,
          primary_voltage: transformer.primary_voltage,
          colling_type: transformer.colling_type,
          serial_number: transformer.serial_number,
          manufacturer: transformer.manufacturer,
          vector_group: transformer.vector_group,
          impedance_voltage: transformer.impedance_voltage,
          winding_weight: transformer.winding_weight,
          oil_weight: transformer.oil_weight,
          year_of_manufacturing: transformer.year_of_manufacturing,
          date_of_installation: transformer.date_of_installation ? 
            new Date(transformer.date_of_installation).toISOString().split('T')[0] : null,
          service_type: transformer.service_type,
          status: transformer.status,
          basestation: basestation ? {
            station_code: basestation.station_code,
            region: basestation.region,
            csc: basestation.csc,
            substation: basestation.substation,
            feeder: basestation.feeder,
            address: basestation.address,
            gps_location: basestation.gps_location,
            station_type: basestation.station_type
          } : transformer.basestation_id,
          created_by: transformer.created_by,
          updated_by: transformer.updated_by
        };
      } catch (error) {
        console.error(`Error fetching local data for transformer ${id}:`, error);
        throw new Error(`Failed to fetch transformer ${id} while offline`);
      }
    }
  },

  updateTransformer: async (id: number, data: any) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.put(`/api/transformer/transformerdata/${id}/`, data);
    } else {
      return syncService.addToQueue({
        endpoint: `/api/transformer/transformerdata/${id}/`,
        method: 'PUT',
        title: 'Update Transformer',
        data
      });
    }
  },

  deleteTransformer: async (id: number) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.delete(`/api/transformer/transformerdata/${id}/`);
    } else {
      return syncService.addToQueue({
        endpoint: `/api/transformer/transformerdata/${id}/`,
        method: 'DELETE',
        title: 'Delete Transformer',
        data: null
      });
    }
  },

  // Filtered operations
  getBasestationsFiltered: async (params: any) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.get('/api/transformer/basestationsFiltered', { params });
    } else {
      // Use local data when offline
      console.log('Network offline, using local filtered data');
      try {
        const searchType = params.searchType;
        delete params.searchType; // Remove searchType from filters

        const response = await dataSyncService.getFilteredData(searchType, params);
        
        // If this is transformer data, map the id to use transformer_id
        if (searchType === 'Transformer' && response?.results) {
          console.log("Transformer Response offline :", response);
          response.results = response.results.map(item => {
            // Check if item is a WatermelonDB model object
            if (item._raw) {
              // Extract properties from _raw
              return {
                ...item._raw,
                id: item._raw.transformer_id
              };
            } else {
              // Regular object
              return {
                ...item,
                id: item.transformer_id
              };
            }
          });
        }
        
        return response;
      } catch (error) {
        console.error('Error fetching filtered data while offline:', error);
        throw new Error('Failed to fetch filtered data while offline');
      }
    }
  },

  getBasestationTransformerHistory: async (stationCode: string, page = 1) => {
    return apiClient.get(`/api/transformer/basestations/${stationCode}/transformer-history`, {
      params: { page, page_size: 10 },
    });
  },


  createInspection: async (data: any) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      const response = await apiClient.post<any>('/api/transformer/inspections/', data);
      return response;
    } else {
      return syncService.addToQueue({
        endpoint: '/api/transformer/inspections/',
        method: 'POST',
        title: 'Create Inspection',
        data
      });
    }
  },
  
  getInspections: async (params: { page?: number; transformer_data?: number } = {}) =>
    apiClient.get<any>('/api/transformer/inspections/', { params }),
  
  updateInspection: async (station_code: string, data: Partial<any>) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.patch(`/api/transformer/inspections/${station_code}/`, data);
    } else {
      return syncService.addToQueue({
        endpoint: `/api/transformer/inspections/${station_code}/`,
        method: 'PATCH',
        title: 'Update Inspection',
        data
      });
    }
  },
  
  deleteInspection: async (station_code: string) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.delete(`/api/transformer/inspections/${station_code}/`);
    } else {
      return syncService.addToQueue({
        endpoint: `/api/transformer/inspections/${station_code}/`,
        method: 'DELETE',
        title: 'Delete Inspection',
        data: null
      });
    }
  },

  getPopulatedInspection: async (id: string) => {
    return apiClient.get(`/api/transformer/populatedInspection/${id}/`);
  },



  createLvFeeder: async (data: any) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      try {
        const response = await apiClient.post<any>('/api/transformer/lvfeeders/', data);
        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to create LvFeeder";
        throw new Error(errorMessage);
      }
    } else {
      return syncService.addToQueue({
        endpoint: '/api/transformer/lvfeeders/',
        method: 'POST',
        title: 'Create LV Feeder',
        data
      });
    }
  },
  
  getLvFeeders: async (params: { page?: number; inspection_data?: number } = {}) =>
    apiClient.get<any>('/api/transformer/lvfeeders/', { params }),
  
  updateLvFeeder: async (id: string, data: Partial<any>) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.patch(`/api/transformer/lvfeeders/${id}/`, data);
    } else {
      return syncService.addToQueue({
        endpoint: `/api/transformer/lvfeeders/${id}/`,
        method: 'PATCH',
        title: 'Update LV Feeder',
        data
      });
    }
  },
  
  deleteLvFeeder: async (id: string) => {
    const networkState = await NetInfo.fetch();
    
    if (networkState.isConnected) {
      return apiClient.delete(`/api/transformer/lvfeeders/${id}/`);
    } else {
      return syncService.addToQueue({
        endpoint: `/api/transformer/lvfeeders/${id}/`,
        method: 'DELETE',
        title: 'Delete LV Feeder',
        data: null
      });
    }
  },

  getPopulatedLvFeeder: async (id: string) => {
    return apiClient.get(`/api/transformer/populatedlvfeeder/${id}/`);
  },



  getBasestationChangeLogs: async (station_code: string, page: number, pageSize: number) => {
    try {
      const response = await apiClient.get(`/api/transformer/basestations/${station_code}/changes`, {
        params: {
          page,
          page_size: pageSize
        }
      });
      return response;
    } catch (error) {
      throw new Error("Failed to fetch basestation change logs");
    }
  },
  
  

  // Add sync status listener to component
  addSyncListener: (callback: (status: any) => void) => {
    const onStart = () => callback({ type: 'start' });
    const onEnd = (result: any) => callback({ type: 'end', ...result });

    // Make sure syncService is defined
    if (syncService) {
      syncService.on('syncStart', onStart);
      syncService.on('syncEnd', onEnd);
      
      return () => {
        syncService.removeListener('syncStart', onStart);
        syncService.removeListener('syncEnd', onEnd);
      };
    } else {
      console.error('syncService is undefined in transformerService');
      return () => {}; // Return empty cleanup function
    }
  }
};

export default transformerService;
















