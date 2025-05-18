// import React, { useCallback, useEffect, useState, useMemo } from "react";
// import { Table, Button, Card, Col, Popconfirm, Row, Space, Form, Select, DatePicker } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import type { TablePaginationConfig } from "antd/es/table";
// import type { FilterValue, SorterResult } from "antd/es/table/interface";
// import { FilterOutlined } from '@ant-design/icons';
// import { debounce } from "lodash";
// import moment from 'moment';

// import transformerService from "@/api/services/transformerService";
// import { TransformerModal, type TransformerModalProps } from "./transformer-modal";
// import { IconButton, Iconify } from "@/components/icon";
// import type { TransformerData } from "#/entity";
// import { toast } from "sonner";
// import { usePathname, useRouter } from "@/router/hooks";
// import { cleanParams } from "@/lib/utils";
// import FilterForm, { FilterState } from './FilterForm';
// import orgService from "@/api/services/orgService";

// // Constants
// const DEFAULT_PAGINATION: TablePaginationConfig = {
//   current: 1,
//   pageSize: 10,
// };

// const DEFAULT_FILTERS: FilterState = {
//   station_code: '',
//   region: '',
//   csc: '',
//   trafo_type: '',
//   capacity: '',
//   dt_number: '',
//   primary_voltage: '',
//   colling_type: '',
//   serial_number: '',
//   manufacturer: '',
//   vector_group: '',
//   impedance_voltage: '',
//   winding_weight: '',
//   oil_weight: '',
//   year_of_manufacturing: '',
//   date_of_installation: '',
//   inspection_date_range: [null, null],
//   inspection_status: '',
//   service_type: '',
//   status: '',
// };

// const DEFAULT_TRANSFORMER_VALUE: TransformerData = {
//   id: 0,
//   basestation: "",
//   trafo_type: "",
//   capacity: "",
//   dt_number: "",
//   primary_voltage: "",
//   colling_type: "",
//   serial_number: "",
//   manufacturer: "",
//   vector_group: "",
//   impedance_voltage: "",
//   winding_weight: "",
//   oil_weight: "",
//   year_of_manufacturing: "",
//   date_of_installation: "",
//   inspection_status: "",
//   service_type: "",
//   status: "",
// };

// const SERVICE_TYPE_CHOICES = [
//   { value: 'Dedicated', label: 'Dedicated' },
//   { value: 'Public', label: 'Public' },
// ];

// const STATUS_CHOICES = [
//   { value: 'New', label: 'New' },
//   { value: 'Maintained', label: 'Maintained' },
// ];

// // Types
// interface TableParams {
//   pagination: TablePaginationConfig;
//   sortField?: string;
//   sortOrder?: string;
//   filters?: Record<string, FilterValue>;
// }

// // Components
// // FilterForm component is now imported from './FilterForm'

// // Main Component
// export default function TransformerPage() {
//   const { push } = useRouter();
//   const pathname = usePathname();

//   // State declarations
//   const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS);
//   const [tableParams, setTableParams] = useState<TableParams>({
//     pagination: {
//       current: 1,
//       pageSize: 10,
//       total: 0,
//     },
//     filters: {},
//   });
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState<TransformerData[]>([]);
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

//   // Modal state
//   const [modalProps, setModalProps] = useState<TransformerModalProps>(() => ({
//     formValue: DEFAULT_TRANSFORMER_VALUE,
//     title: "New",
//     show: false,
//     onOk: () => setModalProps(prev => ({ ...prev, show: false })),
//     onCancel: () => setModalProps(prev => ({ ...prev, show: false })),
//     onDataChange: () => {},
//   }));

//   // Memoized functions
//   const fetchData = useCallback(async (params = tableParams) => {
//     setLoading(true);
//     try {
//       const response = await transformerService.getTransformer({
//         page: params.pagination?.current,
//         pageSize: params.pagination?.pageSize,
//         ...params.filters
//       });

//       setData(response.results);
//       setTableParams({
//         ...params,
//         pagination: {
//           ...params.pagination,
//           total: response.count,
//         },
//       });
//     } catch (error) {
//       console.error("Error fetching transformers:", error);
//       toast.error("Failed to load transformers");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const handleFiltersUpdate = useCallback(
//     debounce(async (filterParams: Partial<FilterState>, currentPage?: number, pageSize?: number) => {
//       const formattedParams = {
//         page: currentPage || tableParams.pagination.current || 1,
//         pageSize: pageSize || tableParams.pagination.pageSize || 10,
//         ...filterParams,
//       };

//       const cleanFilters = cleanParams(formattedParams);
    
//       try {
//         setLoading(true);
//         const response = await transformerService.getTransformer(cleanFilters);
//         if (response) {  // Remove .results check
//           setData(response.results);
//           setTableParams(prev => ({
//             ...prev,
//             pagination: {
//               ...prev.pagination,
//               current: currentPage || prev.pagination.current || 1,
//               pageSize: pageSize || prev.pagination.pageSize || 10,
//               total: response.count || 0,
//             },
//           }));
//         }
//       } catch (error) {
//         console.error("Error fetching filtered transformers:", error);
//         toast.error("Failed to apply filters");
//       } finally {
//         setLoading(false);
//       }
//     }, 300),
//     [tableParams.pagination]
//   );

//   const handleDelete = useCallback(async (id: number) => {
//     try {
//       await transformerService.deleteTransformer(id);
//       toast.success("Transformer deleted successfully!");
//       fetchData();
//     } catch (error) {
//       toast.error("Failed to delete transformer");
//     }
//   }, [fetchData]);

//   const handleDataChange = useCallback((newData: TransformerData, isEdit: boolean) => {
//     setData(prevData => 
//       isEdit 
//         ? prevData.map(item => item.id === newData.id ? newData : item)
//         : [newData, ...prevData]
//     );
//   }, []);

//   // Memoized columns definition
//   const columns = useMemo<ColumnsType<TransformerData>>(() => [
//     {
//       title: "ID",
//       dataIndex: "id",
//       width: 50,
//     },
//     {
//       title: "Base Station",
//       dataIndex: "basestation.station_code",
//       width: 150,
//       render: (text, record) => record.basestation?.station_code || record.basestation || "-",
//     },
//     {
//       title: "Transformer Type",
//       dataIndex: "trafo_type",
//       width: 150,
//     },
//     {
//       title: "Capacity",
//       dataIndex: "capacity",
//       width: 100,
//     },
//     {
//       title: "Primary Voltage",
//       dataIndex: "primary_voltage",
//       width: 120,
//     },
//     {
//       title: "Cooling Type",
//       dataIndex: "colling_type",
//       width: 120,
//     },
//     {
//       title: "Service Type",
//       dataIndex: "service_type",
//       width: 120,
//       render: (text) => text || "-",
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       width: 120,
//       render: (text) => text || "-",
//     },
//     {
//       title: "Action",
//       key: "operation",
//       align: "center",
//       width: 150,
//       render: (_, record) => (
//         <div className="flex w-full justify-center text-gray gap-2">
//           <IconButton onClick={() => push(`${pathname}/${record.id}`)}>
//             <Iconify icon="solar:eye-bold-duotone" size={18} />
//           </IconButton>
//           <IconButton onClick={() => onEdit(record)}>
//             <Iconify icon="solar:pen-bold-duotone" size={18} />
//           </IconButton>
//           <Popconfirm
//             title="Delete the Transformer?"
//             okText="Yes"
//             cancelText="No"
//             placement="left"
//             onConfirm={() => handleDelete(record.id)}
//           >
//             <IconButton>
//               <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
//             </IconButton>
//           </Popconfirm>
//         </div>
//       ),
//     },
//   ], [handleDelete, pathname, push]);

//   // Effects
//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   useEffect(() => {
//     setModalProps(prev => ({
//       ...prev,
//       onDataChange: handleDataChange
//     }));
//   }, [handleDataChange]);


//   // Event handlers
//   const handleTableChange = (
//     pagination: TablePaginationConfig,
//     filters: Record<string, FilterValue>,
//     sorter: SorterResult<TransformerData>
//   ) => {
//     setLoading(true);
//     try {
//       const params = {
//         page: pagination.current,
//         pageSize: pagination.pageSize,
//         searchType: "Transformer",
//         ...activeFilters  // Include active filters in pagination requests
//       };

//       transformerService.getBasestationsFiltered(params)
//         .then(response => {
//           if (response) {
//             setData(response.results);
//             setTableParams({
//               pagination: {
//                 ...pagination,
//                 total: response.count,
//               },
//               filters: { ...filters },
//               ...sorter.field && { sortField: sorter.field as string },
//               ...sorter.order && { sortOrder: sorter.order },
//             });
//           }
//         })
//         .finally(() => setLoading(false));
//     } catch (error) {
//       console.error("Error during pagination:", error);
//       toast.error("Failed to load data");
//       setLoading(false);
//     }
//   };

//   const handleFilterChange = (field: string, value: any) => {
//     setFilters(prev => ({ ...prev, [field]: value }));
//   };

//   const handleResetFilters = () => {
//     setFilters(DEFAULT_FILTERS);
//     setActiveFilters(DEFAULT_FILTERS);
//     const newParams = {
//       pagination: DEFAULT_PAGINATION,
//       filters: {},
//     };
//     setTableParams(newParams);
//     fetchData(newParams);
//   };

//   const handleApplyFilters = async (cleanFilters: any) => {
//     setLoading(true);
//     try {
//       const params = {
//         page: 1,  // Reset to first page when applying new filters
//         pageSize: tableParams.pagination.pageSize,
//         searchType: "Transformer",
//         ...cleanFilters
//       };

//       const response = await transformerService.getBasestationsFiltered(params);

//       if (response) {
//         setData(response.results);
//         setTableParams(prev => ({
//           ...prev,
//           pagination: {
//             ...prev.pagination,
//             current: 1,
//             total: response.count,
//           },
//         }));
//         setActiveFilters(cleanFilters);  // Store the active filters
//       }
//     } catch (error) {
//       console.error("Error applying filters:", error);
//       toast.error("Failed to apply filters");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onEdit = (record: TransformerData) => {
//     setModalProps(prev => ({
//       ...prev,
//       show: true,
//       title: "Edit Transformer",
//       formValue: record,
//     }));
//   };

//   return (
//     <Space direction="vertical" size="large" className="w-full">
//       <Card>
//         <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
//           <h2 className="text-xl font-bold">Transformer List</h2>
//           <Space>
//             <Button
//               icon={<FilterOutlined />}
//               onClick={() => setShowFilters(!showFilters)}
//               type={showFilters ? "primary" : "default"}
//             >
//               Filters
//             </Button>
//             <Button 
//               type="primary" 
//               onClick={() => setModalProps(prev => ({
//                 ...prev,
//                 show: true,
//                 title: "Create New Transformer",
//                 formValue: DEFAULT_TRANSFORMER_VALUE,
//               }))}
//             >
//               New Transformer
//             </Button>
//           </Space>
//         </div>

//         {showFilters && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <FilterForm
//               filters={filters}
//               onFilterChange={handleFilterChange}
//               onReset={handleResetFilters}
//               onApply={handleApplyFilters}
//             />
//           </div>
//         )}
//       </Card>

//       <Card>
//         <Table
//           columns={columns}
//           rowKey="id"
//           dataSource={data}
//           pagination={{
//             ...tableParams.pagination,
//             showSizeChanger: true,
//             showQuickJumper: true,
//             showTotal: (total) => `Total ${total} items`,
//           }}
//           loading={loading}
//           onChange={handleTableChange}
//         />
//         <TransformerModal {...modalProps} />
//       </Card>
//     </Space>
//   );
// }

// // hhhhhhhhh















