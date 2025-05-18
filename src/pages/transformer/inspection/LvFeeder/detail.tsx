// import { Col, Row, Typography } from "antd";
// import Card from "@/components/card";
// import { toast } from "sonner";
// import { useParams } from "@/router/hooks";
// import { useEffect, useState } from "react";
// import transformerService from "@/api/services/transformerService";
// import { formatDate } from "@fullcalendar/core/index.js";
// import { Link } from "react-router";

// interface LvFeeder {
// 	type_of_distribution_box: string;
// 	inspection_id: number;
// 	R_load_current: number;
// 	S_load_current: number;
// 	T_load_current: number;
// 	R_fuse_rating: string;
// 	S_fuse_rating: string;
// 	T_fuse_rating: string;
// 	created_at: string;
// 	updated_at: string;
// 	created_by: string; // Assuming this is the username or ID of the creator
// 	updated_by: string; // Assuming this is the username or ID of the updater
// }

// export default function LvFeederTab() {
// 	const { id } = useParams(); // Assuming `id` is the transformer ID or related identifier
// 	const [data, setData] = useState<LvFeeder | null>(null);
// 	const [loading, setLoading] = useState(false);

// 	// Fetch LvFeeder data related to the transformer
// 	useEffect(() => {
// 		const fetchData = async () => {
// 			setLoading(true);
// 			try {
// 				const response = await transformerService.getPopulatedLvFeeder(id); // Fetch LvFeeder data for the given transformer
// 				setData(response);
// 				console.log("LvFeeder Data:", response);
// 			} catch (error) {
// 				console.error("Error fetching LvFeeder data:", error);
// 				toast.error("Failed to load LvFeeder data.");
// 			} finally {
// 				setLoading(false);
// 			}
// 		};
// 		fetchData();
// 	}, [id]);

// 	// Define the LvFeeder details to display
// 	const AboutLvFeeder = [
// 		{
// 			label: "ID",
// 			val: data?.id || "N/A",
// 		},
// 		{
// 			label: "Transformer ID",
// 			val: (
// 				<Link to={`/transformer/${data?.inspection_data?.transformer_data}`}>
// 					{data?.inspection_data?.transformer_data || "N/A"}
// 				</Link>
// 			),
// 		},
// 		{
// 			label: "Inspection ID",
// 			val: (
// 				<Link to={`/transformer/inspection/${data?.inspection_data?.id}`}>
// 					{data?.inspection_data?.id || "N/A"}
// 				</Link>
// 			),
// 		},
// 		{
// 			label: "Distribution Box",
// 			val: data?.type_of_distribution_box || "N/A",
// 		},
// 		{
// 			label: "R Load Current",
// 			val: data?.R_load_current || "N/A",
// 		},
// 		{
// 			label: "S Load Current",
// 			val: data?.S_load_current || "N/A",
// 		},
// 		{
// 			label: "T Load Current",
// 			val: data?.T_load_current || "N/A",
// 		},
// 		{
// 			label: "R Fuse Rating",
// 			val: data?.R_fuse_rating || "N/A",
// 		},
// 		{
// 			label: "S Fuse Rating",
// 			val: data?.S_fuse_rating || "N/A",
// 		},
// 		{
// 			label: "T Fuse Rating",
// 			val: data?.T_fuse_rating || "N/A",
// 		},

// 		{
// 			label: "Created By",
// 			val: data?.created_by?.email || "N/A",
// 		},
// 		{
// 			label: "Updated By",
// 			val: data?.updated_by?.email || "N/A",
// 		},
// 		{
// 			label: "Created At",
// 			val: formatDate(data?.created_at),
// 		},
// 		{
// 			label: "Updated At",
// 			val: formatDate(data?.updated_at),
// 		},

// 		{
// 			label: "Transformer Load",
// 			val: data?.transformer_load || "N/A",
// 		},
// 		{
// 			label: "Current Phase Unbalance",
// 			val: data?.current_phase_unbalance || "N/A",
// 		},
// 		{
// 			label: "Percentage of Neutral",
// 			val: data?.percentage_of_neutral || "N/A",
// 		},
// 	];

// 	return (
// 		<Row gutter={[16, 16]}>
// 			{/* LvFeeder Details */}
// 			<Col span={24} lg={12}>
// 				<Card className="flex-col">
// 					<div className="flex w-full flex-col">
// 						<Typography.Title level={2}>LvFeeder Details</Typography.Title>
// 						<div className="mt-2 flex flex-col gap-4">
// 							{AboutLvFeeder.map((item, index) => (
// 								<div className="flex" key={index}>
// 									<div className="mr-2">{item.label}:</div>
// 									<div className="opacity-50">{item.val}</div>
// 								</div>
// 							))}
// 						</div>
// 					</div>
// 				</Card>
// 			</Col>
// 		</Row>
// 	);
// }
