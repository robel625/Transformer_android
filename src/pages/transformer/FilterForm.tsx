// import React, { useState, useEffect } from 'react';
// import { Form, Row, Col, Select, Button, Space, Input, InputNumber, DatePicker } from 'antd';
// import moment from 'moment';
// import orgService from "@/api/services/orgService";

// // Constants from the Django model
// const TRANSFORMER_TYPES = [
//   { value: 'Conservator', label: 'Conservator' },
//   { value: 'Hermatical', label: 'Hermatical' },
//   { value: 'Compact', label: 'Compact' },
// ];

// const CAPACITY_CHOICES = [
//   { value: '10', label: '10 kVA' },
//   { value: '25', label: '25 kVA' },
//   { value: '50', label: '50 kVA' },
//   { value: '100', label: '100 kVA' },
//   { value: '200', label: '200 kVA' },
//   { value: '315', label: '315 kVA' },
//   { value: '400', label: '400 kVA' },
//   { value: '500', label: '500 kVA' },
//   { value: '630', label: '630 kVA' },
//   { value: '800', label: '800 kVA' },
//   { value: '1250', label: '1250 kVA' },
//   { value: '2500', label: '2500 kVA' },
//   { value: 'null', label: 'Other' },
// ];

// const PRIMARY_VOLTAGE_CHOICES = [
//   { value: '15', label: '15 kVA' },
//   { value: '19', label: '19 kVA' },
//   { value: '33', label: '33 kVA' },
//   { value: 'null', label: 'Other' },
// ];

// const colling_type_CHOICES = [
//   { value: 'ONAN', label: 'ONAN' },
//   { value: 'Dry Type', label: 'Dry Type' },
// ];

// const VECTOR_GROUP_CHOICES = [
//   { value: 'DY1', label: 'DY1' },
//   { value: 'DY5', label: 'DY5' },
//   { value: 'DY11', label: 'DY11' },
//   { value: 'Other', label: 'Other' },
// ];

// const MANUFACTURER_CHOICES = [
//   { value: 'ABB Tanzania', label: 'ABB Tanzania' },
//   { value: 'Apex', label: 'Apex' },
//   { value: 'China Natinal Electric wire and cable Imp/Exp corporations', 
//     label: 'China Natinal Electric wire and cable Imp/Exp corporations' },
//   { value: 'Iran Transformer', label: 'Iran Transformer' },
//   { value: 'Kobera', label: 'Kobera' },
//   { value: 'Koncar', label: 'Koncar' },
//   { value: "Mar son's", label: "Mar son's" },
//   { value: 'METEC', label: 'METEC' },
//   { value: 'Minel Transformer', label: 'Minel Transformer' },
// ];

// const SERVICE_TYPE_CHOICES = [
//   { value: 'Dedicated', label: 'Dedicated' },
//   { value: 'Public', label: 'Public' },
// ];

// const STATUS_CHOICES = [
//   { value: 'New', label: 'New' },
//   { value: 'Maintained', label: 'Maintained' },
// ];

// export interface FilterState {
//   station_code: string;
//   region: string;
//   csc: string;
//   trafo_type: string;
//   capacity: string;
//   dt_number: string;
//   primary_voltage: string;
//   colling_type: string;
//   serial_number: string;
//   manufacturer: string;
//   vector_group: string;
//   impedance_voltage: string;
//   winding_weight: string;
//   oil_weight: string;
//   year_of_manufacturing: string;
//   date_of_installation: string;
//   inspection_date_range: [string | null, string | null];
//   inspection_status: string;
//   service_type: string;
//   status: string;
// }

// interface FilterFormProps {
//   filters: FilterState;
//   onFilterChange: (field: string, value: any) => void;
//   onReset: () => void;
//   onApply: (cleanFilters: Partial<FilterState>) => void;
// }

// const FilterForm: React.FC<FilterFormProps> = ({
//   filters,
//   onFilterChange,
//   onReset,
//   onApply,
// }) => {
//   // Add state for regions and CSCs
//   const [regions, setRegions] = useState<any[]>([]);
//   const [selectedCSCs, setSelectedCSCs] = useState<any[]>([]);

//   // Load regions when component mounts
//   useEffect(() => {
//     const loadRegions = async () => {
//       try {
//         const data = await orgService.getOrgList();
//         setRegions(data);
//       } catch (error) {
//         console.error("Error fetching regions:", error);
//       }
//     };
//     loadRegions();
//   }, []);

//   // Add inspection status options
//   const INSPECTION_STATUS_OPTIONS = [
//     { value: 'inspected', label: 'Inspected' },
//     { value: 'not_inspected', label: 'Not Inspected' },
//   ];

//   return (
//     <Form layout="vertical">
//       <Row gutter={[16, 16]}>
//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Station Code">
//             <Input
//               value={filters.station_code}
//               onChange={(e) => onFilterChange('station_code', e.target.value)}
//               placeholder="Station Code"
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Region">
//             <Select
//               value={filters.region}
//               onChange={(value) => {
//                 const selectedRegion = regions.find(region => region.csc_code === value);
//                 if (selectedRegion) {
//                   setSelectedCSCs(selectedRegion.csc_centers);
//                   onFilterChange('region', value);
//                   onFilterChange('csc', undefined); // Clear CSC when region changes
//                 }
//               }}
//               placeholder="Select Region"
//               allowClear
//               showSearch
//               optionFilterProp="children"
//             >
//               {regions.map(region => (
//                 <Select.Option key={region.csc_code} value={region.csc_code}>
//                   {region.name}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="CSC">
//             <Select
//               value={filters.csc}
//               onChange={(value) => onFilterChange('csc', value)}
//               placeholder="Select CSC"
//               allowClear
//               showSearch
//               optionFilterProp="children"
//               disabled={!filters.region}
//             >
//               {selectedCSCs.map(csc => (
//                 <Select.Option key={csc.csc_code} value={csc.csc_code}>
//                   {csc.name}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Col>
            
//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Transformer Type">
//             <Select
//               value={filters.trafo_type}
//               onChange={(value) => onFilterChange('trafo_type', value)}
//               placeholder="Select Type"
//               allowClear
//             >
//               {TRANSFORMER_TYPES.map(option => (
//                 <Select.Option key={option.value} value={option.value}>
//                   {option.label}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Capacity">
//             <Select
//               value={filters.capacity}
//               onChange={(value) => onFilterChange('capacity', value)}
//               placeholder="Select Capacity"
//               allowClear
//             >
//               {CAPACITY_CHOICES.map(option => (
//                 <Select.Option key={option.value} value={option.value}>
//                   {option.label}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="DT Number">
//             <Input
//               value={filters.dt_number}
//               onChange={(e) => onFilterChange('dt_number', e.target.value)}
//               placeholder="Enter DT Number"
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Primary Voltage">
//             <Select
//               value={filters.primary_voltage}
//               onChange={(value) => onFilterChange('primary_voltage', value)}
//               placeholder="Select Primary Voltage"
//               allowClear
//             >
//               {PRIMARY_VOLTAGE_CHOICES.map(option => (
//                 <Select.Option key={option.value} value={option.value}>
//                   {option.label}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Cooling Type">
//             <Select
//               value={filters.colling_type}
//               onChange={(value) => onFilterChange('colling_type', value)}
//               placeholder="Select Cooling Type"
//               allowClear
//             >
//               {colling_type_CHOICES.map(option => (
//                 <Select.Option key={option.value} value={option.value}>
//                   {option.label}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Serial Number">
//             <Input
//               value={filters.serial_number}
//               onChange={(e) => onFilterChange('serial_number', e.target.value)}
//               placeholder="Enter Serial Number"
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Manufacturer">
//             <Select
//               value={filters.manufacturer}
//               onChange={(value) => onFilterChange('manufacturer', value)}
//               placeholder="Select Manufacturer"
//               allowClear
//             >
//               {MANUFACTURER_CHOICES.map(option => (
//                 <Select.Option key={option.value} value={option.value}>
//                   {option.label}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Vector Group">
//             <Select
//               value={filters.vector_group}
//               onChange={(value) => onFilterChange('vector_group', value)}
//               placeholder="Select Vector Group"
//               allowClear
//             >
//               {VECTOR_GROUP_CHOICES.map(option => (
//                 <Select.Option key={option.value} value={option.value}>
//                   {option.label}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Service Type">
//             <Select
//               value={filters.service_type}
//               onChange={(value) => onFilterChange('service_type', value)}
//               placeholder="Select Service Type"
//               allowClear
//               options={SERVICE_TYPE_CHOICES}
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Status">
//             <Select
//               value={filters.status}
//               onChange={(value) => onFilterChange('status', value)}
//               placeholder="Select Status"
//               allowClear
//               options={STATUS_CHOICES}
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Impedance Voltage (%)">
//             <InputNumber
//               value={filters.impedance_voltage}
//               onChange={(value) => onFilterChange('impedance_voltage', value)}
//               placeholder="Enter Impedance Voltage"
//               min={0}
//               max={100}
//               style={{ width: '100%' }}
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Winding Weight (kg)">
//             <InputNumber
//               value={filters.winding_weight}
//               onChange={(value) => onFilterChange('winding_weight', value)}
//               placeholder="Enter Winding Weight"
//               min={0}
//               style={{ width: '100%' }}
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Oil Weight (kg)">
//             <InputNumber
//               value={filters.oil_weight}
//               onChange={(value) => onFilterChange('oil_weight', value)}
//               placeholder="Enter Oil Weight"
//               min={0}
//               style={{ width: '100%' }}
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Year of Manufacturing">
//             <InputNumber
//               value={filters.year_of_manufacturing}
//               onChange={(value) => onFilterChange('year_of_manufacturing', value)}
//               placeholder="Enter Year"
//               min={1900}
//               max={new Date().getFullYear()}
//               style={{ width: '100%' }}
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Date of Installation">
//             <DatePicker
//               value={filters.date_of_installation ? moment(filters.date_of_installation) : null}
//               onChange={(date) => onFilterChange('date_of_installation', date?.format('YYYY-MM-DD'))}
//               style={{ width: '100%' }}
//             />
//           </Form.Item>
//         </Col>

//         <Col xs={24} sm={12} md={6}>
//           <Form.Item label="Inspection Status">
//             <Select
//               value={filters.inspection_status}
//               onChange={(value) => onFilterChange('inspection_status', value)}
//               placeholder="Select Status"
//               allowClear
//               options={INSPECTION_STATUS_OPTIONS}
//             />
//           </Form.Item>
//         </Col>

        
//         <Col xs={24} sm={12} md={8}>
//           <Form.Item label="Inspection Date Range">
//             <DatePicker.RangePicker
//               value={filters.inspection_date_range?.[0] 
//                 ? [
//                     moment(filters.inspection_date_range[0]),
//                     moment(filters.inspection_date_range[1])
//                   ] 
//                 : null
//               }
//               onChange={(dates) => {
//                 const formattedDates = dates 
//                   ? [
//                       dates[0]?.format('YYYY-MM-DD'),
//                       dates[1]?.format('YYYY-MM-DD')
//                     ] 
//                   : [null, null];
//                 onFilterChange('inspection_date_range', formattedDates);
//               }}
//               style={{ width: '100%' }}
//               allowClear
//             />
//           </Form.Item>
//         </Col>
//       </Row>

//       <Row justify="end" gutter={[8, 8]} className="mt-4">
//         <Col>
//           <Space>
//             <Button onClick={onReset}>Reset</Button>
//             <Button 
//               type="primary" 
//               onClick={() => {
//                 const cleanFilters = {
//                   station_code: filters.station_code || undefined,
//                   region: filters.region || undefined,
//                   csc: filters.csc || undefined,
//                   trafo_type: filters.trafo_type || undefined,
//                   capacity: filters.capacity || undefined,
//                   dt_number: filters.dt_number || undefined,
//                   primary_voltage: filters.primary_voltage || undefined,
//                   colling_type: filters.colling_type || undefined,
//                   serial_number: filters.serial_number || undefined,
//                   manufacturer: filters.manufacturer || undefined,
//                   vector_group: filters.vector_group || undefined,
//                   impedance_voltage: filters.impedance_voltage || undefined,
//                   winding_weight: filters.winding_weight || undefined,
//                   oil_weight: filters.oil_weight || undefined,
//                   year_of_manufacturing: filters.year_of_manufacturing || undefined,
//                   date_of_installation: filters.date_of_installation || undefined,
//                   inspection_status: filters.inspection_status || undefined,
//                   inspection_date_range: filters.inspection_date_range || undefined,
//                   service_type: filters.service_type || undefined,
//                   status: filters.status || undefined,
//                 };

//                 // Remove empty/undefined values
//                 Object.keys(cleanFilters).forEach(key => {
//                   if (cleanFilters[key] === undefined || cleanFilters[key] === '') {
//                     delete cleanFilters[key];
//                   }
//                 });

//                 onApply(cleanFilters);
//               }}
//             >
//               Apply
//             </Button>
//           </Space>
//         </Col>
//       </Row>
//     </Form>
//   );
// };

// export default FilterForm;












