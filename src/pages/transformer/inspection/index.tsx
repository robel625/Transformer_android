// import React, { useEffect, useState } from "react";
// import Table, { type ColumnsType } from "antd/es/table";
// import type { TablePaginationConfig } from "antd/es/table";
// import type { FilterValue, SorterResult } from "antd/es/table/interface";
// import transformerService from "@/api/services/transformerService";
// import { InspectionModal, type InspectionModalProps } from "./inspection-modal"; // Adjust the modal path accordingly
// import { Button, Card, Popconfirm } from "antd";
// import { IconButton, Iconify } from "@/components/icon";
// import type { Inspection } from "#/entity";
// import { toast } from "sonner";
// import { usePathname, useRouter } from "@/router/hooks";
// import { formatDate } from "@fullcalendar/core/index.js";

// // Define the table parameters interface
// interface TableParams {
// 	pagination?: TablePaginationConfig;
// 	sortField?: string;
// 	sortOrder?: string;
// 	filters?: Record<string, FilterValue>;
// }

// // Default Inspection Value
// const DEFAULT_INSPECTION_VALUE: Inspection = {
// 	id: 0,
// 	body_condition: "",
// 	arrester: "",
// 	drop_out: "",
// 	fuse_link: "",
// 	bushing: "",
// 	cable_lugs: "",
// 	horn_gap: "",
// 	tap_changer_position: "",
// 	oil_level: "",
// 	oil_leakage: "",
// 	silica_gel: "",
// 	cable_size: "",
// 	neutral_ground: "",
// 	arrester_body_ground: "",
// 	N_load_current: "",
// 	R_S_Voltage: "",
// 	R_T_Voltage: "",
// 	T_S_Voltage: "",
// 	created_at: new Date(),
// 	updated_at: new Date(),
// };

// export default function InspectionPage({ id }: { id: any }) {
// 	const { push } = useRouter();
// 	const pathname = usePathname();

// 	const handleDataChange = (newData: Inspection, isEdit: boolean) => {
// 		if (isEdit) {
// 			// Update existing data
// 			setData(prevData => 
// 				prevData.map(item => 
// 					item.id === newData.id ? newData : item
// 				)
// 			);
// 		} else {
// 			// Add new data to the beginning of the list
// 			setData(prevData => [newData, ...prevData]);
			
// 			// Update pagination total
// 			setTableParams(prev => ({
// 				...prev,
// 				pagination: {
// 					...prev.pagination,
// 					total: (prev.pagination?.total || 0) + 1
// 				}
// 			}));
// 		}
// 	};

// 	const [inspectionModalProps, setInspectionModalProps] = useState<InspectionModalProps>({
// 		id: id,
// 		formValue: DEFAULT_INSPECTION_VALUE,
// 		title: "",
// 		show: false,
// 		onOk: () => {
// 			setInspectionModalProps((prev) => ({ ...prev, show: false }));
// 		},
// 		onCancel: () => {
// 			setInspectionModalProps((prev) => ({ ...prev, show: false }));
// 		},
// 		onDataChange: handleDataChange,
// 	});
// 	const [data, setData] = useState<Inspection[]>([]);
// 	const [loading, setLoading] = useState(false);
// 	const [tableParams, setTableParams] = useState<TableParams>({
// 		pagination: {
// 			current: 1,
// 			pageSize: 10,
// 		},
// 		sortField: undefined,
// 		sortOrder: undefined,
// 		filters: {},
// 	});

// 	// Function to fetch data from the transformerService
// 	const fetchData = async () => {
// 		setLoading(true);
// 		try {
// 			const params = {
// 				page: tableParams.pagination?.current || 1,
// 				pageSize: tableParams.pagination?.pageSize || 10,
// 				sortField: tableParams.sortField,
// 				sortOrder: tableParams.sortOrder,
// 				filters: tableParams.filters,
// 				transformer_data: id,
// 			};
// 			const response = await transformerService.getInspections(params); // Fetch data from the service
// 			console.log("Inspections API Response:", response);
// 			if (response.results) {
// 				setData(response.results); // Set the fetched data
// 				setTableParams({
// 					...tableParams,
// 					pagination: {
// 						...tableParams.pagination,
// 						total: response.count || 0, // Use the count from the API response
// 					},
// 				});
// 			}
// 		} catch (error) {
// 			console.error("Error fetching inspections:", error);
// 			toast.error("Failed to load inspections.");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	// Fetch data when tableParams change
// 	useEffect(() => {
// 		fetchData();
// 	}, [JSON.stringify(tableParams)]);

// 	// Handle table changes (pagination, sorting, filtering)
// 	const handleTableChange = (
// 		pagination: TablePaginationConfig,
// 		filters: Record<string, FilterValue>,
// 		sorter: SorterResult<Inspection>,
// 	) => {
// 		setTableParams({
// 			pagination,
// 			filters,
// 			sortField: sorter.field,
// 			sortOrder: sorter.order,
// 		});
// 	};

// 	// Define the columns for the table
// 	const columns: ColumnsType<Inspection> = [
// 		{
// 			title: "Body Condition",
// 			dataIndex: "body_condition",
// 			width: 150,
// 		},
// 		{
// 			title: "Arrester",
// 			dataIndex: "arrester",
// 			width: 100,
// 		},
// 		{
// 			title: "Drop Out",
// 			dataIndex: "drop_out",
// 			width: 150,
// 		},
// 		{
// 			title: "Fuse Link",
// 			dataIndex: "fuse_link",
// 			width: 150,
// 		},
// 		{
// 			title: "Created At",
// 			dataIndex: "created_at",
// 			width: 150,
// 			render: (date) => formatDate(date),
// 		},

// 		{
// 			title: "Action",
// 			key: "operation",
// 			align: "center",
// 			width: 120,
// 			render: (_, record) => (
// 				<div className="flex w-full justify-center text-gray">
// 					<IconButton
// 						onClick={() => {
// 							console.log(`${pathname}/${record.id}`);
// 							push(`/transformer/inspection/${record.id}`);
// 						}}
// 					>
// 						<Iconify icon="carbon:view" size={18} />
// 					</IconButton>
// 					<IconButton onClick={() => onEdit(record)}>
// 						<Iconify icon="solar:pen-bold-duotone" size={18} />
// 					</IconButton>
// 					<Popconfirm
// 						title="Delete the Inspection?"
// 						okText="Yes"
// 						cancelText="No"
// 						placement="left"
// 						onConfirm={() => handleDelete(record.id)}
// 					>
// 						<IconButton>
// 							<Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
// 						</IconButton>
// 					</Popconfirm>
// 				</div>
// 			),
// 		},
// 	];

// 	// Create a new inspection
// 	const onCreate = () => {
// 		setInspectionModalProps((prev) => ({
// 			...prev,
// 			id: id,
// 			show: true,
// 			title: "Create New Inspection",
// 			formValue: {
// 				...prev.formValue,
// 				...DEFAULT_INSPECTION_VALUE,
// 			},
// 		}));
// 	};

// 	// Edit an existing inspection
// 	const onEdit = (formValue: Inspection) => {
// 		setInspectionModalProps((prev) => ({
// 			...prev,
// 			show: true,
// 			title: "Edit Inspection",
// 			formValue,
// 		}));
// 	};

// 	// Delete an inspection
// 	const handleDelete = async (id: number) => {
// 		try {
// 			await transformerService.deleteInspection(id); // Call the delete API
// 			toast.success("Inspection deleted successfully!");
// 			fetchData(); // Refresh the table data
// 		} catch (error) {
// 			toast.error("Failed to delete inspection.");
// 		}
// 	};

// 	return (
// 		<Card
// 			title="Inspection List"
// 			extra={
// 				<Button type="primary" onClick={onCreate}>
// 					New Inspection
// 				</Button>
// 			}
// 		>
// 			<Table
// 				columns={columns}
// 				rowKey={(record) => record.id.toString()} // Use the unique ID as the row key
// 				dataSource={data} // Pass the fetched data to the table
// 				pagination={tableParams.pagination} // Use the pagination configuration
// 				loading={loading} // Show loading indicator while fetching data
// 				onChange={handleTableChange} // Handle table changes
// 			/>
// 			<InspectionModal {...inspectionModalProps} />
// 		</Card>
// 	);
// }

