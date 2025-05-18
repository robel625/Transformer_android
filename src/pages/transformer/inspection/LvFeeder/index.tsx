// import React, { useEffect, useState } from "react";
// import { Tabs, Row, Col, Card, Button, Popconfirm, Table } from "antd";
// import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
// import type { FilterValue, SorterResult } from "antd/es/table/interface";
// import transformerService from "@/api/services/transformerService";
// import { IconButton, Iconify } from "@/components/icon";
// import { toast } from "sonner";
// import { usePathname, useRouter } from "@/router/hooks";
// import { LvFeederModal, LvFeederModalProps } from "./LvFeederModal-modal";
// import { LvFeeder } from "#/entity";

// // Default LvFeeder Value
// const DEFAULT_LVFEEDER_VALUE: LvFeeder = {
// 	id: 0,
// 	type_of_distribution_box: "",
// 	R_load_current: "",
// 	S_load_current: "",
// 	T_load_current: "",
// 	R_fuse_rating: "",
// 	S_fuse_rating: "",
// 	T_fuse_rating: "",
// 	created_at: new Date(),
// 	updated_at: new Date(),
// };

// export default function LvFeederList({ inspectionId }: { inspectionId: any }) {
// 	const { push } = useRouter();
// 	const pathname = usePathname();
// 	const [data, setData] = useState<LvFeeder[]>([]);

// 	// Add handleDataChange function
// 	const handleDataChange = (newData: LvFeeder, isEdit: boolean) => {
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

// 	const [lvFeederModalProps, setLvFeederModalProps] = useState<LvFeederModalProps>({
// 		formValue: { ...DEFAULT_LVFEEDER_VALUE },
// 		inspectionId: inspectionId,
// 		title: "New",
// 		show: false,
// 		onOk: () => {
// 			setLvFeederModalProps((prev: any) => ({ ...prev, show: false }));
// 		},
// 		onCancel: () => {
// 			setLvFeederModalProps((prev: any) => ({ ...prev, show: false }));
// 		},
// 		onDataChange: handleDataChange  // Add this line
// 	});

// 	const [loading, setLoading] = useState(false);
// 	const [activeTab, setActiveTab] = useState("table"); // Default to table view

// 	// Define the table parameters interface
// 	const [tableParams, setTableParams] = useState<{
// 		pagination?: TablePaginationConfig;
// 		sortField?: string;
// 		sortOrder?: string;
// 		filters?: Record<string, FilterValue>;
// 	}>({
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
// 				inspection_data: inspectionId,
// 			};
// 			const response = await transformerService.getLvFeeders(params); // Fetch data from the service
// 			console.log("LvFeeder API Response:", response);
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
// 			console.error("Error fetching LvFeeders:", error);
// 			toast.error("Failed to load LvFeeders.");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	// Fetch data when tableParams change or inspectionId changes
// 	useEffect(() => {
// 		fetchData();
// 	}, [JSON.stringify(tableParams), inspectionId]);

// 	// Handle table changes (pagination, sorting, filtering)
// 	const handleTableChange = (
// 		pagination: TablePaginationConfig,
// 		filters: Record<string, FilterValue>,
// 		sorter: SorterResult<LvFeeder>,
// 	) => {
// 		setTableParams({
// 			pagination,
// 			filters,
// 			sortField: sorter.field,
// 			sortOrder: sorter.order,
// 		});
// 	};

// 	// Define the columns for the table
// 	const columns: ColumnsType<LvFeeder> = [
// 		{
// 			title: "Distribution Box Type",
// 			dataIndex: "type_of_distribution_box",
// 			width: 200,
// 		},
// 		{
// 			title: "R Load Current",
// 			dataIndex: "R_load_current",
// 			width: 150,
// 		},
// 		{
// 			title: "S Load Current",
// 			dataIndex: "S_load_current",
// 			width: 150,
// 		},
// 		{
// 			title: "T Load Current",
// 			dataIndex: "T_load_current",
// 			width: 150,
// 		},
// 		{
// 			title: "R Fuse Rating",
// 			dataIndex: "R_fuse_rating",
// 			width: 150,
// 		},
// 		{
// 			title: "S Fuse Rating",
// 			dataIndex: "S_fuse_rating",
// 			width: 150,
// 		},
// 		{
// 			title: "T Fuse Rating",
// 			dataIndex: "T_fuse_rating",
// 			width: 150,
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
// 							push(`/transformer/inspection/LvFeeder/${record.id}`);
// 						}}
// 					>
// 						<Iconify icon="carbon:view" size={18} />
// 					</IconButton>
// 					<IconButton onClick={() => onEdit(record)}>
// 						<Iconify icon="solar:pen-bold-duotone" size={18} />
// 					</IconButton>
// 					<Popconfirm
// 						title="Delete the LvFeeder?"
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

// 	// Create a new LvFeeder
// 	const onCreate = () => {
// 		setLvFeederModalProps((prev) => ({
// 			...prev,
// 			inspectionId: inspectionId,
// 			show: true,
// 			title: "Create New LvFeeder",
// 			formValue: {
// 				...DEFAULT_LVFEEDER_VALUE,
// 			},
// 			onDataChange: handleDataChange  // Add this line
// 		}));
// 	};

// 	// Edit an existing LvFeeder
// 	const onEdit = (formValue: LvFeeder) => {
// 		setLvFeederModalProps((prev) => ({
// 			...prev,
// 			show: true,
// 			title: "Edit LvFeeder",
// 			formValue,
// 			onDataChange: handleDataChange  // Add this line
// 		}));
// 	};

// 	// Delete an LvFeeder
// 	const handleDelete = async (id: number) => {
// 		try {
// 			await transformerService.deleteLvFeeder(id); // Call the delete API
// 			toast.success("LvFeeder deleted successfully!");
// 			fetchData(); // Refresh the table data
// 		} catch (error) {
// 			toast.error("Failed to delete LvFeeder.");
// 		}
// 	};

// 	return (
// 		<Card
// 			title="LvFeeder List"
// 			extra={
// 				<Button type="primary" onClick={onCreate}>
// 					New LvFeeder
// 				</Button>
// 			}
// 		>
// 			{/* Tabs for switching between Table and Grid views */}
// 			<Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
// 				<Tabs.TabPane tab="Table View" key="table">
// 					{loading ? (
// 						<div className="text-center py-4">Loading...</div>
// 					) : (
// 						<Table
// 							columns={columns}
// 							rowKey={(record) => record.id.toString()}
// 							dataSource={data}
// 							pagination={tableParams.pagination}
// 							loading={loading}
// 							onChange={handleTableChange}
// 						/>
// 					)}
// 				</Tabs.TabPane>
// 				<Tabs.TabPane tab="Grid View" key="grid">
// 					{loading ? (
// 						<div className="text-center py-4">Loading...</div>
// 					) : data.length === 0 ? (
// 						<div className="text-center py-4">No LvFeeders available</div>
// 					) : (
// 						<Row gutter={[16, 16]} justify="start">
// 							{data.map((record) => (
// 								<Col key={record.id} xs={24} sm={12} md={12} lg={12}>
// 									<Card hoverable className="mb-4">
// 										<div className="flex flex-col gap-2">
// 											<div className="flex">
// 												<div className="mr-2">Type of Distribution Box:</div>
// 												<div className="opacity-50">{record.type_of_distribution_box || "N/A"}</div>
// 											</div>
// 											<div className="flex">
// 												<div className="mr-2">R Load Current:</div>
// 												<div className="opacity-50">{record.R_load_current || "N/A"}</div>
// 											</div>
// 											<div className="flex">
// 												<div className="mr-2">S Load Current:</div>
// 												<div className="opacity-50">{record.S_load_current || "N/A"}</div>
// 											</div>
// 											<div className="flex">
// 												<div className="mr-2">T Load Current:</div>
// 												<div className="opacity-50">{record.T_load_current || "N/A"}</div>
// 											</div>
// 											<div className="flex">
// 												<div className="mr-2">R Fuse Rating:</div>
// 												<div className="opacity-50">{record.R_fuse_rating || "N/A"}</div>
// 											</div>
// 											<div className="flex">
// 												<div className="mr-2">S Fuse Rating:</div>
// 												<div className="opacity-50">{record.S_fuse_rating || "N/A"}</div>
// 											</div>
// 											<div className="flex">
// 												<div className="mr-2">T Fuse Rating:</div>
// 												<div className="opacity-50">{record.T_fuse_rating || "N/A"}</div>
// 											</div>

// 											{/* Action Buttons */}
// 											<div className="flex justify-end mt-2">
// 												<IconButton
// 													onClick={() => {
// 														console.log(`${pathname}/${record.id}`);
// 														push(`/transformer/inspection/LvFeeder/${record.id}`);
// 													}}
// 												>
// 													<Iconify icon="carbon:view" size={18} />
// 												</IconButton>
// 												<IconButton onClick={() => onEdit(record)}>
// 													<Iconify icon="solar:pen-bold-duotone" size={18} />
// 												</IconButton>
// 												<Popconfirm
// 													title="Delete the LvFeeder?"
// 													okText="Yes"
// 													cancelText="No"
// 													placement="left"
// 													onConfirm={() => handleDelete(record.id)}
// 												>
// 													<IconButton>
// 														<Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
// 													</IconButton>
// 												</Popconfirm>
// 											</div>
// 										</div>
// 									</Card>
// 								</Col>
// 							))}
// 						</Row>
// 					)}
// 				</Tabs.TabPane>
// 			</Tabs>
// 			<LvFeederModal {...lvFeederModalProps} />
// 		</Card>
// 	);
// }


