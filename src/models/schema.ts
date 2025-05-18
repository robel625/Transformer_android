import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'basestations',
      columns: [
        { name: 'station_code', type: 'string', isIndexed: true },
        { name: 'region', type: 'string' },
        { name: 'region_id', type: 'string', isOptional: true },
        { name: 'csc', type: 'string' },
        { name: 'csc_id', type: 'string', isOptional: true },
        { name: 'substation', type: 'string' },
        { name: 'substation_id', type: 'string', isOptional: true },
        { name: 'feeder', type: 'string' },
        { name: 'feeder_id', type: 'string', isOptional: true },
        { name: 'address', type: 'string' },
        { name: 'gps_location', type: 'string' },
        { name: 'station_type', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'created_by', type: 'string', isOptional: true },
        { name: 'updated_by', type: 'string', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'transformer_data',
      columns: [
        { name: 'basestation_id', type: 'string', isIndexed: true },
        { name: 'transformer_id', type: 'number', isIndexed: true },
        { name: 'trafo_type', type: 'string' },
        { name: 'capacity', type: 'string' },
        { name: 'dt_number', type: 'string', isOptional: true },
        { name: 'primary_voltage', type: 'string' },
        { name: 'colling_type', type: 'string' },
        { name: 'serial_number', type: 'string', isIndexed: true },
        { name: 'manufacturer', type: 'string', isOptional: true },
        { name: 'vector_group', type: 'string' },
        { name: 'impedance_voltage', type: 'number' },
        { name: 'winding_weight', type: 'number' },
        { name: 'oil_weight', type: 'number' },
        { name: 'year_of_manufacturing', type: 'number', isOptional: true },
        { name: 'date_of_installation', type: 'number', isOptional: true },
        { name: 'service_type', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'created_by', type: 'string', isOptional: true },
        { name: 'updated_by', type: 'string', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'endpoint', type: 'string' },
        { name: 'method', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'data', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'error', type: 'string', isOptional: true },
        { name: 'retry_count', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'sync_meta',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
      ]
    })
  ]
});



