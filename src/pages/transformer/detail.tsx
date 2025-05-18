// import { faker } from "@faker-js/faker";
// import { 
//     Button, 
//     Col, 
//     Form, 
//     Input, 
//     Row, 
//     Space, 
//     Switch, 
//     Typography, 
//     Spin, 
//     Timeline, 
//     Empty,
//     Badge 
// } from "antd";
// import dayjs from 'dayjs';
// import Card from "@/components/card";
// import { UploadAvatar } from "@/components/upload";
// import { useUserInfo } from "@/store/userStore";
// import { toast } from "sonner";
// import { Iconify } from "@/components/icon";
// import React, { useState, useEffect } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { useParams } from "@/router/hooks";
// import transformerService from "@/api/services/transformerService";
// import { TransformerData } from "#/entity";
// import { themeVars } from "@/theme/theme.css";
// import InspectionPage from "./inspection";
// import BasestationMap from "./BasestationMap";
// import { formatDate } from "@fullcalendar/core/index.js";
// import logService from "@/api/services/logService";
// import { Link } from "react-router";

// type FieldType = {
// 	name?: string;
// 	email?: string;
// 	phone?: string;
// 	address?: string;
// 	city?: string;
// 	code?: string;
// 	about: string;
// };

// // Add proper type for change logs
// interface ChangeLog {
// 	timestamp: string;
// 	changed_by: string;
// 	field_name: string;
// 	old_value: string;
// 	new_value: string;
// }

// interface ChangeLogResponse {
// 	count: number;
// 	results: ChangeLog[];
// }

// export default function GeneralTab() {
// 	const { id } = useParams();
// 	const [data, setData] = useState<TransformerData[]>([]);
// 	const [loading, setLoading] = useState(false);
// 	const [showTimeline, setShowTimeline] = useState(false);
// 	const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
// 	const [timelineLoading, setTimelineLoading] = useState(false);
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const [hasMore, setHasMore] = useState(true);
// 	const ITEMS_PER_PAGE = 10;

// 	const fetchChangeLogs = async (page: number = 1, append: boolean = false) => {
// 		if (!id) return;
		
// 		setTimelineLoading(true);
// 		try {
// 			const response = await logService.getSpecificChangeLogs(
// 				id,
// 				'Transformer Data',
// 				{
// 					page,
// 					pageSize: ITEMS_PER_PAGE,
// 					field_name: "basestation",
// 				}
// 			);

// 			console.log("response___________________________", response)

// 			const newLogs = response?.results || [];
// 			const totalCount = response?.count || 0;

// 			if (append) {
// 				setChangeLogs(prev => [...prev, ...newLogs]);
// 			} else {
// 				setChangeLogs(newLogs);
// 			}

// 			// Check if we have more items to load
// 			setHasMore(currentPage * ITEMS_PER_PAGE < totalCount);
// 		} catch (error) {
// 			console.error("Error fetching change logs:", error);
// 			toast.error("Failed to load change logs");
// 			setChangeLogs([]);
// 		} finally {
// 			setTimelineLoading(false);
// 		}
// 	};

// 	const handleLoadMore = () => {
// 		const nextPage = currentPage + 1;
// 		setCurrentPage(nextPage);
// 		fetchChangeLogs(nextPage, true);
// 	};

// 	const handleTimelineToggle = () => {
// 		if (!showTimeline && changeLogs.length === 0) {
// 			setCurrentPage(1);
// 			fetchChangeLogs(1, false);
// 		}
// 		setShowTimeline(!showTimeline);
// 	};

// 	// Fetch data when tableParams change
// 	useEffect(() => {
// 		const fetchData = async () => {
// 			setLoading(true);
// 			try {
// 				const response = await transformerService.getPopulatedTransformer(id); // Fetch data from the service
// 				setData(response);
// 				console.log("one transforemr:", response);
// 			} catch (error) {
// 				console.error("Error fetching transformer data:", error);
// 				toast.error("Failed to load transformer data.");
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		fetchData();
// 	}, []);

// 	const AboutTransformer = [
// 		{
// 			label: "Transformer ID",
// 			val: data?.id,
// 		},
// 		{
// 			label: "Station Code",
// 			val: <Link to={`/basestation/${data?.basestation?.station_code}`}>{data?.basestation?.station_code}</Link>,
// 		},

// 		{
// 			label: "Transformer Type",
// 			val: data?.trafo_type,
// 		},
// 		{
// 			label: "Capacity",
// 			val: data?.capacity,
// 		},
// 		{
// 			label: "DT Number",
// 			val: data?.dt_number,
// 		},
// 		{
// 			label: "Primary Voltage",
// 			val: data?.primary_voltage,
// 		},
// 		{
// 			label: "Cooling Type",
// 			val: data?.colling_type,
// 		},
// 		{
// 			label: "Serial Number",
// 			val: data?.serial_number,
// 		},
// 		{
// 			label: "Manufacturer",
// 			val: data?.manufacturer,
// 		},
// 		{
// 			label: "Vector Group",
// 			val: data?.vector_group,
// 		},
// 		{
// 			label: "Impedance Voltage",
// 			val: data?.impedance_voltage,
// 		},
// 		{
// 			label: "Winding Weight",
// 			val: data?.winding_weight,
// 		},
// 		{
// 			label: "Oil Weight",
// 			val: data?.oil_weight,
// 		},
// 		{
// 			label: "Year of Manufacturing",
// 			val: data?.year_of_manufacturing,
// 		},
// 		{
// 			label: "Date of Installation",
// 			val: data?.date_of_installation,
// 		},
// 		{
// 			label: "Created_by",
// 			val: data?.created_by?.email,
// 		},
// 		{
// 			label: "Updated_by",
// 			val: data?.updated_by?.email,
// 		},
// 		{
// 			label: "Created_at",
// 			val: formatDate(data?.created_at),
// 		},
// 		{
// 			label: "Updated_at",
// 			val: formatDate(data?.updated_at),
// 		},
// 	];

// 	const AboutBase_Station = [
// 		{
// 			label: "Station Code",
// 			val: data?.basestation?.station_code,
// 		},
// 		{
// 			label: "Region",
// 			val: data?.basestation?.region,
// 		},
// 		{
// 			label: "CSC",
// 			val: data?.basestation?.csc,
// 		},

// 		{
// 			label: "Substation",
// 			val: data?.basestation?.substation,
// 		},
// 		{
// 			label: "Feeder",
// 			val: data?.basestation?.feeder,
// 		},
// 		{
// 			label: "Address",
// 			val: data?.basestation?.address,
// 		},
// 		{
// 			label: "GPS Location",
// 			val: data?.basestation?.gps_location,
// 		},

// 		{
// 			label: "Created_by",
// 			val: data?.basestation?.created_by?.email,
// 		},
// 		{
// 			label: "Updated_by",
// 			val: data?.basestation?.updated_by?.email,
// 		},
// 		{
// 			label: "Created_at",
// 			val: formatDate(data?.basestation?.created_at),
// 		},
// 		{
// 			label: "Updated_at",
// 			val: formatDate(data?.basestation?.updated_at),
// 		},
// 	];

// 	return (
// 		<div>
// 			<Row gutter={[16, 16]}>
// 				<Col span={24} lg={12}>
// 					<Card className="flex-col">
// 						<div className="flex w-full flex-col">
// 							<Typography.Title level={2}>Transformer Details</Typography.Title>
// 							{/* <Typography.Text>{faker.lorem.paragraph()}</Typography.Text> */}

// 							<div className="mt-2 flex flex-col gap-4">
// 								{AboutTransformer.map((item) => (
// 									<div className="flex" key={item.label}>
// 										{/* <div className="mr-2">{item.icon}</div> */}
// 										<div className="mr-2">{item.label}:</div>
// 										<div className="opacity-50">{item.val}</div>
// 									</div>
// 								))}
// 							</div>
// 						</div>
// 					</Card>
// 				</Col>
// 				<Col span={24} xs={24} sm={24} md={24} lg={12}>
// 					<div className="flex justify-end mb-4">
// 						<Button 
// 							type="text"
// 							icon={<Iconify icon="material-symbols-light:move-outline-rounded" />}
// 							onClick={handleTimelineToggle}
// 						>
// 						 Movement History
// 						</Button>
// 					</div>
// 					<div className="flex items-center justify-center h-auto">
// 						{showTimeline ? (
// 							<Card className="w-full flex-col">
// 								<Typography.Title level={4}>Transformer Movement History</Typography.Title>

// 								{changeLogs.length > 0 && (
// 									<div className="bg-gray-50 p-4 rounded-lg mb-4">
// 										<p className="font-medium text-primary mb-2">Movement Base Station Path:</p>
// 										<div className="flex items-center flex-wrap gap-2">
// 											{[...changeLogs].reverse().map((log, index, array) => (
// 												<React.Fragment key={index}>
// 													{index === 0 ? (
// 														<span className="text-gray-600">{log.old_value || "none"}</span>
// 													) : null}
// 													<Iconify 
// 														icon="material-symbols:arrow-forward" 
// 														className="text-primary"
// 													/>
// 														<span className="text-gray-800">{log.new_value || "none"}</span>
// 												</React.Fragment>
// 											))}
// 										</div>
// 									</div>
// 								)}
// 								<Timeline>
// 									{changeLogs.map((log, index) => (
// 										<Timeline.Item 
// 											key={index}
// 											dot={
// 												<Badge 
// 													status="processing" 
// 													style={{ backgroundColor: themeVars.colors.primary }}
// 												/>
// 											}
// 										>
// 											<div className="bg-gray-50 p-2 rounded-lg mb-2">
// 												<p className="font-medium text-primary">
// 													{dayjs(log.timestamp).format("MMM DD, YYYY h:mm A")}
// 												</p>
// 												<p className="text-gray-600">Changed by: {log.changed_by}</p>
// 												<p className="text-gray-600">Field: {log.field_name}</p>
// 												<p className="text-gray-600">Reason: {log.reason}</p>
// 												<div className="mt-2">
// 													<p className="text-gray-500 line-through">From: {log.old_value}</p>
// 													<p className="text-gray-800">To: {log.new_value}</p>
// 												</div>
// 											</div>
// 										</Timeline.Item>
// 									))}
// 								</Timeline>

								

// 								{changeLogs.length === 0 && !timelineLoading && (
// 									<Empty description="No Movement found" />
// 									// <Empty description="No change logs found" />
// 								)}
								
// 								{timelineLoading && (
// 									<div className="flex justify-center p-4">
// 										<Spin />
// 									</div>
// 								)}
								
// 								{!timelineLoading && hasMore && changeLogs.length > 0 && (
// 									<div className="flex justify-center mt-4">
// 										<Button 
// 											onClick={handleLoadMore}
// 											type="default"
// 											icon={<Iconify icon="mdi:chevron-down" />}
// 										>
// 											Load More
// 										</Button>
// 									</div>
// 								)}
// 							</Card>
// 						) : (
// 							<TransformerSvg />
// 						)}
// 					</div>
// 				</Col>

// 				<Col span={24} lg={12}>
// 					{data?.basestation?.gps_location && <BasestationMap gps_location={data?.basestation?.gps_location} />}
// 				</Col>
// 				<Col span={24} lg={12}>
// 					{data?.basestation ? (
// 						<Card className="flex-col">
// 							<div className="flex w-full flex-col">
// 								<Typography.Title level={2}>Base Station Details</Typography.Title>
// 								<div className="mt-2 flex flex-col gap-4">
// 									{AboutBase_Station.map((item) => (
// 										<div className="flex" key={item.label}>
// 											<div className="mr-2">{item.label}:</div>
// 											<div className="opacity-50">{item.val}</div>
// 										</div>
// 									))}
// 								</div>
// 							</div>
// 						</Card>
// 					) : (
// 						<Card className="flex-col">
// 							<Empty description="No Base Station found" />
// 						</Card>
// 					)}
// 				</Col>
// 			</Row>

// 			<div className="mt-10 mx-2">
// 				<InspectionPage id={id} />
// 			</div>
// 		</div>
// 	);
// }
















