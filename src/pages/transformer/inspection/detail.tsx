import { Col, Row, Typography } from "antd";
import Card from "@/components/card";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import { useParams } from "@/router/hooks";
import { Inspection } from "#/entity";
import { useEffect, useState } from "react";
import transformerService from "@/api/services/transformerService";
import LvFeederPage from "./LvFeeder";
import { formatDate } from "@fullcalendar/core/index.js";
import { Link } from "react-router";

export default function InspectionTab() {
	const { id } = useParams(); // Assuming `id` is the transformer ID
	const [data, setData] = useState<Inspection[]>([]);
	const [loading, setLoading] = useState(false);

	// Fetch inspection data related to the transformer
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const response = await transformerService.getPopulatedInspection(id); // Fetch inspections for the given transformer
				setData(response);
				console.log("Inspection Data:", response);
			} catch (error) {
				console.error("Error fetching inspection data:", error);
				toast.error("Failed to load inspection data.");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [id]);

	// Define the inspection details to display
	const AboutInspection = [
		{
			label: "ID",
			val: data?.id || "N/A",
		},
		{
			label: "Transformer ID",
			val: <Link to={`/transformer/${data?.transformer_data?.id}`}>{data?.transformer_data?.id || "N/A"}</Link>,
		},
		{
			label: "Base Station Code",
			val: <Link to={`/basestation/${data?.transformer_data?.basestation?.station_code}`}>{data?.transformer_data?.basestation?.station_code || "N/A"}</Link>,
		},
		{
			label: "Body Condition",
			val: data?.body_condition || "N/A",
		},
		{
			label: "Arrester",
			val: data?.arrester || "N/A",
		},
		{
			label: "Drop Out",
			val: data?.drop_out || "N/A",
		},
		{
			label: "Fuse Link",
			val: data?.fuse_link || "N/A",
		},
		{
			label: "MV Bushing",
			val: data?.mv_bushing || "N/A",
		},
		{
			label: "MV Cable Lug",
			val: data?.mv_cable_lug || "N/A",
		},
		{
			label: "LV Bushing",
			val: data?.lv_bushing || "N/A",
		},
		{
			label: "LV Cable Lug",
			val: data?.lv_cable_lug || "N/A",
		},
		{
			label: "Oil Level",
			val: data?.oil_level || "N/A",
		},
		{
			label: "Insulation Level",
			val: data?.insulation_level || "N/A",
		},
		{
			label: "Horn Gap",
			val: data?.horn_gap || "N/A",
		},
		{
			label: "Silica Gel",
			val: data?.silica_gel || "N/A",
		},
		{
			label: "Has Linkage",
			val: data?.has_linkage || "N/A",
		},
		{
			label: "Arrester Body Ground",
			val: data?.arrester_body_ground || "N/A",
		},
		{
			label: "Neutral Ground",
			val: data?.neutral_ground || "N/A",
		},
		{
			label: "Status of Mounting",
			val: data?.status_of_mounting || "N/A",
		},
		{
			label: "Mounting Condition",
			val: data?.mounting_condition || "N/A",
		},
		{
			label: "N Load Current",
			val: data?.N_load_current || "N/A",
		},
		{
			label: "R-S Voltage",
			val: data?.R_S_Voltage || "N/A",
		},
		{
			label: "R-T Voltage",
			val: data?.R_T_Voltage || "N/A",
		},
		{
			label: "T-S Voltage",
			val: data?.T_S_Voltage || "N/A",
		},
		{
			label: "Created By",
			val: data?.created_by?.email || "N/A",
		},
		{
			label: "Updated By",
			val: data?.updated_by?.email || "N/A",
		},
		{
			label: "Created At",
			val: formatDate(data?.created_at) || "N/A",
		},
		{
			label: "Updated At",
			val: formatDate(data?.updated_at) || "N/A",
		},

		{
			label: "Voltage Phase Unbalance",
			val: data?.voltage_phase_unbalance || "N/A",
		},
		{
			label: "Average Voltage",
			val: data?.average_voltage || "N/A",
		},
	];

	return (
		<>
			<Row gutter={[16, 16]}>
				{/* Inspection Details */}
				<Col span={24} lg={12}>
					<Card className="flex-col">
						<div className="flex w-full flex-col">
							<Typography.Title level={2}>Inspection Details</Typography.Title>
							<div className="mt-2 flex flex-col gap-4">
								{AboutInspection.map((item, index) => (
									<div className="flex" key={index}>
										<div className="mr-2">{item.label}:</div>
										<div className="opacity-50">{item.val}</div>
									</div>
								))}
							</div>
						</div>
					</Card>
				</Col>

				{/* Transformer Diagram (Hidden on Mobile) */}
				<Col span={24} xs={0} sm={0} md={0} lg={12}>
					<div className="flex items-center justify-center h-full">
						<TransformerSvg />
					</div>
				</Col>
			</Row>

			<LvFeederPage inspectionId={id} />

			{/* <UserDetail/> */}
		</>
	);
}

function TransformerSvg() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			width={212}
			height={212}
			x={0}
			y={0}
			viewBox="0 0 503.63 503"
			// style={{
			//   enableBackground: "new 0 0 512 512",
			// }}
			// xmlSpace="preserve"
			className=""
			// {...props}
		>
			<g>
				<path
					fill="#3f5c6c"
					d="M503.625 312.723v52.066c-.012 4.79-3.89 8.664-8.676 8.68h-32.023a102.41 102.41 0 0 1-19.004 32.976l15.969 27.68a8.683 8.683 0 0 1 .91 6.598 8.662 8.662 0 0 1-4.035 5.293L411.64 472.05a8.649 8.649 0 0 1-11.805-3.211l-15.965-27.684a105.947 105.947 0 0 1-38.183 0l-15.97 27.684a8.643 8.643 0 0 1-11.8 3.21l-45.125-26.034a8.662 8.662 0 0 1-4.035-5.293 8.648 8.648 0 0 1 .91-6.598l15.969-27.68a102.349 102.349 0 0 1-19.008-32.976h-32.02a8.706 8.706 0 0 1-8.68-8.68v-25.687l15.798-15.88a170.042 170.042 0 0 0 62.738 22.301c3.578 32.032 31.555 55.684 63.734 53.887 32.176-1.8 57.344-28.426 57.324-60.656a62.543 62.543 0 0 0-2.777-18.223 164.25 164.25 0 0 0 34.8-28.984 93.875 93.875 0 0 1 5.38 12.496h32.023c4.785.016 8.664 3.89 8.676 8.68zM78.406 139.164a60.704 60.704 0 0 0 60.746 60.746 59.312 59.312 0 0 0 18.918-3.039 168.57 168.57 0 0 0 22.477 64.91l-6.77 6.77-15.535-26.989a105.947 105.947 0 0 1-38.183 0l-15.965 27.684a8.647 8.647 0 0 1-11.805 3.211l-45.125-26.035a8.662 8.662 0 0 1-3.125-11.887l15.969-27.683a102.41 102.41 0 0 1-19.004-32.977H8.98c-4.785-.016-8.664-3.89-8.675-8.68V113.13c.011-4.79 3.89-8.664 8.675-8.68h32.024a102.41 102.41 0 0 1 19.004-32.976l-15.969-27.68a8.683 8.683 0 0 1-.91-6.598 8.662 8.662 0 0 1 4.035-5.293L92.29 5.867a8.666 8.666 0 0 1 6.566-.84 8.661 8.661 0 0 1 5.239 4.051l15.965 27.684a105.947 105.947 0 0 1 38.183 0l15.969-27.684a8.643 8.643 0 0 1 11.8-3.21l44.692 25.773a171.809 171.809 0 0 0-53.543 60.226 60.016 60.016 0 0 0-38.008-13.449 60.7 60.7 0 0 0-42.968 17.777 60.7 60.7 0 0 0-17.778 42.97zm0 0"
					opacity={1}
					data-original="#3f5c6c"
					className=""
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-3f5c6c, #324a56)",
					}}
				/>
				<path
					fill="#f29c1f"
					d="M330.066.316c-95.82.079-173.48 77.739-173.558 173.559a173.609 173.609 0 0 0 24.039 87.906 173.354 173.354 0 0 0 123.918 83.742 166.192 166.192 0 0 0 25.601 1.91 171.673 171.673 0 0 0 92.68-26.902 164.25 164.25 0 0 0 34.8-28.984c46.794-50.629 59.165-124.16 31.52-187.313C461.422 41.078 399.008.285 330.066.316zM428.473 271.5c-1.301 1.305-2.516 2.52-3.903 3.734-52.234 48.34-132.578 49.317-185.968 2.254a133.408 133.408 0 0 1-6.422-5.988c-51.828-51.832-54.442-135.02-5.973-190.004 48.465-54.984 131.324-62.832 189.25-17.918v.086a133.73 133.73 0 0 1 13.016 11.453c54.18 54.254 54.18 142.133 0 196.383zm0 0"
					opacity={1}
					data-original="#f29c1f"
					className=""
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-f29c1f, #b7700b)",
					}}
				/>
				<path
					fill="#95a5a5"
					d="M424.57 275.234a138.743 138.743 0 0 1-122.011 34.102 82.43 82.43 0 0 1 53.015-45.64 82.437 82.437 0 0 1 68.996 11.538zm0 0"
					opacity={1}
					data-original="#95a5a5"
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-95a5a5, #4f5659)",
					}}
				/>
				<path
					fill="#35495e"
					d="M428.473 271.5c-1.301 1.305-2.516 2.52-3.903 3.734a82.437 82.437 0 0 0-68.996-11.539 82.43 82.43 0 0 0-53.015 45.64 137.976 137.976 0 0 1-63.957-31.847 155.873 155.873 0 0 1 18.394-26.554l-24.644-42.782a13.368 13.368 0 0 1 4.859-18.312l69.684-40.266a13.351 13.351 0 0 1 10.14-1.304 13.324 13.324 0 0 1 8.086 6.253l24.645 42.782a163.198 163.198 0 0 1 59.011 0l24.645-42.782a13.352 13.352 0 0 1 8.086-6.253 13.357 13.357 0 0 1 10.137 1.304l16.75 9.633A138.658 138.658 0 0 1 428.473 271.5zm0 0"
					opacity={1}
					data-original="#35495e"
					className=""
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-35495e, #2a3a4b)",
					}}
				/>
				<path
					fill="#b0d3f0"
					d="m468.395 159.207-16.75-9.633a13.357 13.357 0 0 0-10.137-1.304 13.352 13.352 0 0 0-8.086 6.253l-24.645 42.782a163.198 163.198 0 0 0-59.011 0l-24.645-42.782a13.324 13.324 0 0 0-8.086-6.253 13.351 13.351 0 0 0-10.14 1.304L237.21 189.84a13.368 13.368 0 0 0-4.86 18.313l24.645 42.78a155.873 155.873 0 0 0-18.394 26.555 133.408 133.408 0 0 1-6.422-5.988 138.63 138.63 0 0 1-39.485-115.676l24.297 7.028c3.43.886 7.07.367 10.117-1.442s5.246-4.754 6.11-8.187l12.41-47.73c9.86-.888 19.617-2.661 29.16-5.294a167.345 167.345 0 0 0 27.68-10.414l35.148 34.711c5.254 5.184 13.711 5.145 18.918-.086l56.492-57.273c1.02-1 1.844-2.176 2.43-3.473a133.73 133.73 0 0 1 13.016 11.453 138.25 138.25 0 0 1 39.922 84.09zm0 0"
					opacity={1}
					data-original="#b0d3f0"
					className=""
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-b0d3f0, #333739)",
					}}
				/>
				<path
					fill="#35495e"
					d="M415.457 63.578v.086a11.493 11.493 0 0 1-2.43 3.473l-56.492 57.273c-5.207 5.23-13.664 5.27-18.918.086l-35.148-34.71a167.345 167.345 0 0 1-27.68 10.413 165.321 165.321 0 0 1-29.16 5.293l-12.41 47.73c-.864 3.434-3.063 6.38-6.11 8.188s-6.687 2.328-10.117 1.442l-24.297-7.028c6.23-49.46 38.516-91.777 84.578-110.851C323.332 25.898 376.082 33 415.457 63.578zm0 0"
					opacity={1}
					data-original="#35495e"
					className=""
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-35495e, #2a3a4b)",
					}}
				/>
				<path
					fill="#3b97d3"
					d="m158.504 406.531-73.59 73.59-61.352-61.355 73.586-73.59c6.79-6.766 17.774-6.766 24.559 0l36.797 36.797c6.77 6.785 6.77 17.77 0 24.558zm0 0"
					opacity={1}
					data-original="#3b97d3"
					className=""
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-3b97d3, #246f9f)",
					}}
				/>
				<path
					fill="#95a5a5"
					d="m84.914 480.121-18.398 18.395a17.23 17.23 0 0 1-24.559 0L5.078 461.723c-6.77-6.79-6.77-17.774 0-24.559l18.485-18.398zm0 0"
					opacity={1}
					data-original="#95a5a5"
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-95a5a5, #4f5659)",
					}}
				/>
				<path
					fill="#285680"
					d="m121.688 345.156 36.816-36.816 36.816 36.816-36.816 36.817zm0 0"
					opacity={1}
					data-original="#285680"
					className=""
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-285680, #204566)",
					}}
				/>
				<path
					fill="#e57e25"
					d="m241.727 323.223-15.797 15.879-6.075 6.074c-6.785 6.77-17.77 6.77-24.558 0l-36.793-36.88a17.284 17.284 0 0 1 0-24.473l22.043-22.042a171.485 171.485 0 0 0 61.18 61.442zm0 0"
					opacity={1}
					data-original="#e57e25"
					className=""
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-e57e25, #b05d15)",
					}}
				/>
				<g
					fill="#547580"
					data-darkreader-inline-fill=""
					style={{
						"--darkreader-inline-fill": "var(--darkreader-background-547580, #435e66)",
					}}
				>
					<path
						d="M425.523 338.754c.02 32.23-25.148 58.855-57.324 60.656-32.18 1.797-60.156-21.855-63.734-53.887a166.192 166.192 0 0 0 25.601 1.91 171.673 171.673 0 0 0 92.68-26.902 62.543 62.543 0 0 1 2.777 18.223zM156.508 173.875a167.732 167.732 0 0 0 1.562 22.996 59.312 59.312 0 0 1-18.918 3.04c-33.55 0-60.746-27.2-60.746-60.747 0-33.55 27.196-60.746 60.746-60.746a60.016 60.016 0 0 1 38.008 13.45 171.87 171.87 0 0 0-20.652 82.007zm0 0"
						fill="#547580"
						opacity={1}
						data-original="#547580"
						className=""
						data-darkreader-inline-fill=""
						style={{
							"--darkreader-inline-fill": "var(--darkreader-background-547580, #435e66)",
						}}
					/>
				</g>
			</g>
		</svg>
	);
}
