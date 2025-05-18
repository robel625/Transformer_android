/**
 * Mock data for offline sync
 * Separated from main service to reduce memory footprint
 */

// Mock basestation response structure
export const MOCK_BASESTATION_RESPONSE = {
  count: 10,
  next: null,
  previous: null,
  results: [
    {
      station_code: "BS001",
      region: "Central",
      regionId: "R001",
      csc: "Main CSC",
      cscId: "CSC001",
      substation: "Primary Sub",
      substationId: 1,
      feeder: "Main Feeder",
      feederId: 101,
      address: "123 Main St",
      gps_location: "9.0302° N, 38.7468° E",
      station_type: "Distribution",
      created_by: { email: "admin@example.com" },
      updated_by: { email: "admin@example.com" }
    },
    {
      station_code: "BS002",
      region: "Eastern",
      regionId: "R002",
      csc: "East CSC",
      cscId: "CSC002",
      substation: "Secondary Sub",
      substationId: 2,
      feeder: "East Feeder",
      feederId: 102,
      address: "456 East Rd",
      gps_location: "9.0350° N, 38.7600° E",
      station_type: "Transmission",
      created_by: { email: "admin@example.com" },
      updated_by: { email: "admin@example.com" }
    }
    // Add more mock data as needed
  ]
};

// Mock transformer response structure
export const MOCK_TRANSFORMER_RESPONSE = {
  count: 10,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      trafo_type: "Distribution",
      capacity: "100",
      dt_number: "DT001",
      primary_voltage: "11000",
      colling_type: "ONAN",
      serial_number: "SN001",
      manufacturer: "ABB",
      vector_group: "Dyn11",
      impedance_voltage: "4.5",
      winding_weight: "450",
      oil_weight: "350",
      year_of_manufacturing: "2020",
      date_of_installation: "2021-01-15",
      service_type: "Distribution",
      status: "Active",
      basestation: "BS001",
      created_by: { email: "admin@example.com" },
      updated_by: { email: "admin@example.com" }
    },
    {
      id: 2,
      trafo_type: "Power",
      capacity: "250",
      dt_number: "DT002",
      primary_voltage: "33000",
      colling_type: "ONAF",
      serial_number: "SN002",
      manufacturer: "Siemens",
      vector_group: "YNd11",
      impedance_voltage: "5.2",
      winding_weight: "750",
      oil_weight: "600",
      year_of_manufacturing: "2019",
      date_of_installation: "2020-06-20",
      service_type: "Transmission",
      status: "Active",
      basestation: "BS002",
      created_by: { email: "admin@example.com" },
      updated_by: { email: "admin@example.com" }
    }
    // Add more mock data as needed
  ]
};