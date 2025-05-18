import { Form, Input, Modal, Select, InputNumber } from "antd";
import { useEffect, useState } from "react";
import type { Inspection } from "#/entity"; // Import the Inspection type
import { useMutation } from "@tanstack/react-query";
import transformerService from "@/api/services/transformerService";
import { toast } from "sonner";

// Define the props for the InspectionModal
export interface InspectionModalProps {
	title: string;
	show: boolean;
	id: string | number;
	formValue: Inspection;
	onOk: () => void;
	onCancel: () => void;
	onDataChange: (newData: Inspection, isEdit: boolean) => void;
}

// InspectionModal component
export function InspectionModal({ title, show, id, formValue, onOk, onCancel, onDataChange }: InspectionModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	// Update form values when formValue changes
	useEffect(() => {
		form.setFieldsValue({ ...formValue });
	}, [formValue, form]);

	const handleOk = () => {
		form
			.validateFields() // Validate all fields
			.then(async (values: any) => {
				setLoading(true);
				try {
					if (title === "Create New Inspection") {
						const data = {
							...values,
							transformer_data: id,
						};
						const response = await inspectionMutation.mutateAsync(data);
						onDataChange(response, false); // Add new data to table
						toast.success("Inspection created successfully!");
					} else if (title === "Edit Inspection") {
						const updatedValues = form.getFieldsValue(); // Get the latest form values
						const data = {
							...updatedValues,
							transformer_data: id,
						};
						const response = await transformerService.updateInspection(formValue.id, data);
						onDataChange({ ...formValue, ...data }, true); // Update existing data in table
						toast.success("Inspection updated successfully");
					}
					onOk();
				} catch (error) {
					toast.error("Operation failed. Please try again.");
				} finally {
					setLoading(false);
				}
			})
			.catch((errorInfo) => {
				console.log("Validation failed:", errorInfo);
			});
	};

	const inspectionMutation = useMutation({
		mutationFn: transformerService.createInspection,
	});

	return (
		<Modal title={title} open={show} onOk={handleOk} onCancel={onCancel} confirmLoading={loading}>
			<Form initialValues={formValue} form={form} labelCol={{ span: 9}} wrapperCol={{ span: 18 }} layout="horizontal">
				{/* Body Condition */}
				<Form.Item<Inspection>
					label="Body Condition"
					name="body_condition"
					rules={[{ required: true, message: "Please select the body condition!" }]}
				>
					<Select placeholder="Select body condition">
						<Select.Option value="Good">Good</Select.Option>
						<Select.Option value="Fair">Fair</Select.Option>
						<Select.Option value="Poor">Poor</Select.Option>
					</Select>
				</Form.Item>

				{/* Arrestor */}
				<Form.Item<Inspection>
					label="Arrestor"
					name="arrester"
					rules={[{ required: true, message: "Please select the arrestor status!" }]}
				>
					<Select placeholder="Select arrestor status">
						<Select.Option value="Ok">Ok</Select.Option>
						<Select.Option value="one missed">One Missed</Select.Option>
						<Select.Option value="two missed">Two Missed</Select.Option>
						<Select.Option value="all missed">All Missed</Select.Option>
					</Select>
				</Form.Item>

				{/* Drop Out */}
				<Form.Item<Inspection>
					label="Drop Out"
					name="drop_out"
					rules={[{ required: true, message: "Please select the drop out status!" }]}
				>
					<Select placeholder="Select drop out status">
						<Select.Option value="Ok">Ok</Select.Option>
						<Select.Option value="one missed">One Missed</Select.Option>
						<Select.Option value="two missed">Two Missed</Select.Option>
						<Select.Option value="all missed">All Missed</Select.Option>
					</Select>
				</Form.Item>

				{/* Fuse Link */}
				<Form.Item<Inspection>
					label="Fuse Link"
					name="fuse_link"
					rules={[{ required: true, message: "Please select the fuse link status!" }]}
				>
					<Select placeholder="Select fuse link status">
						<Select.Option value="Ok">Ok</Select.Option>
						<Select.Option value="one missed">One Missed</Select.Option>
						<Select.Option value="two missed">Two Missed</Select.Option>
						<Select.Option value="all missed">All Missed</Select.Option>
					</Select>
				</Form.Item>

				{/* MV Bushing */}
				<Form.Item<Inspection>
					label="MV Bushing"
					name="mv_bushing"
					rules={[{ required: true, message: "Please select the MV bushing status!" }]}
				>
					<Select placeholder="Select MV bushing status">
						<Select.Option value="Ok">Ok</Select.Option>
						<Select.Option value="one missed">One Missed</Select.Option>
						<Select.Option value="two missed">Two Missed</Select.Option>
						<Select.Option value="all missed">All Missed</Select.Option>
					</Select>
				</Form.Item>

				{/* MV Cable Lug */}
				<Form.Item<Inspection>
					label="MV Cable Lug"
					name="mv_cable_lug"
					rules={[{ required: true, message: "Please select the MV cable lug status!" }]}
				>
					<Select placeholder="Select MV cable lug status">
						<Select.Option value="Ok">Ok</Select.Option>
						<Select.Option value="one missed">One Missed</Select.Option>
						<Select.Option value="two missed">Two Missed</Select.Option>
						<Select.Option value="all missed">All Missed</Select.Option>
					</Select>
				</Form.Item>

				{/* LV Bushing */}
				<Form.Item<Inspection>
					label="LV Bushing"
					name="lv_bushing"
					rules={[{ required: true, message: "Please select the LV bushing status!" }]}
				>
					<Select placeholder="Select LV bushing status">
						<Select.Option value="Ok">Ok</Select.Option>
						<Select.Option value="one missed">One Missed</Select.Option>
						<Select.Option value="two missed">Two Missed</Select.Option>
						<Select.Option value="all missed">All Missed</Select.Option>
					</Select>
				</Form.Item>

				{/* LV Cable Lug */}
				<Form.Item<Inspection>
					label="LV Cable Lug"
					name="lv_cable_lug"
					rules={[{ required: true, message: "Please select the LV cable lug status!" }]}
				>
					<Select placeholder="Select LV cable lug status">
						<Select.Option value="Ok">Ok</Select.Option>
						<Select.Option value="one missed">One Missed</Select.Option>
						<Select.Option value="two missed">Two Missed</Select.Option>
						<Select.Option value="all missed">All Missed</Select.Option>
					</Select>
				</Form.Item>

				{/* Oil Level */}
				<Form.Item<Inspection>
					label="Oil Level"
					name="oil_level"
					rules={[{ required: true, message: "Please select the oil level!" }]}
				>
					<Select placeholder="Select oil level">
						<Select.Option value="Full">Full</Select.Option>
						<Select.Option value="0.75">0.75</Select.Option>
						<Select.Option value="0.5">0.5</Select.Option>
						<Select.Option value="0.25">0.25</Select.Option>
					</Select>
				</Form.Item>

				{/* Insulation Level */}
				<Form.Item<Inspection>
					label="Insulation Level"
					name="insulation_level"
					// rules={[{ required: true, message: "Please select the insulation level!" }]}
				>
					<Select placeholder="Select insulation level">
						<Select.Option value="Acceptable">Acceptable</Select.Option>
						<Select.Option value="Not Acceptable">Not Acceptable</Select.Option>
					</Select>
				</Form.Item>

				{/* Horn Gap Status */}
				<Form.Item<Inspection>
					label="Horn Gap Status"
					name="horn_gap"
					rules={[{ required: true, message: "Please select the horn gap status!" }]}
				>
					<Select placeholder="Select horn gap status">
						<Select.Option value="Good">Good</Select.Option>
						<Select.Option value="Poor">Poor</Select.Option>
					</Select>
				</Form.Item>

				{/* Silica Gel */}
				<Form.Item<Inspection>
					label="Silica Gel"
					name="silica_gel"
					rules={[{ required: true, message: "Please select the silica gel condition!" }]}
				>
					<Select placeholder="Select silica gel condition">
						<Select.Option value="Good">Good</Select.Option>
						<Select.Option value="Fair">Fair</Select.Option>
						<Select.Option value="Poor">Poor</Select.Option>
					</Select>
				</Form.Item>

				{/* Has Linkage */}
				<Form.Item<Inspection>
					label="Has Linkage"
					name="has_linkage"
					rules={[{ required: true, message: "Please select if it has linkage!" }]}
				>
					<Select placeholder="Select linkage status">
						<Select.Option value="No">No</Select.Option>
						<Select.Option value="Yes">Yes</Select.Option>
					</Select>
				</Form.Item>

				{/* Arrestor-Body Ground */}
				<Form.Item<Inspection>
					label="Arrestor-Body Ground"
					name="arrester_body_ground"
					rules={[{ required: true, message: "Please select the arrestor-body ground status!" }]}
				>
					<Select placeholder="Select arrestor-body ground status">
						<Select.Option value="Available">Available</Select.Option>
						<Select.Option value="Not Available">Not Available</Select.Option>
					</Select>
				</Form.Item>

				{/* Neutral */}
				<Form.Item<Inspection>
					label="Neutral"
					name="neutral_ground"
					rules={[{ required: true, message: "Please select the neutral status!" }]}
				>
					<Select placeholder="Select neutral status">
						<Select.Option value="Available">Available</Select.Option>
						<Select.Option value="Not Available">Not Available</Select.Option>
					</Select>
				</Form.Item>

				{/* Status of Mounting */}
				<Form.Item<Inspection>
					label="Status of Mounting"
					name="status_of_mounting"
					rules={[{ required: true, message: "Please select the mounting status!" }]}
				>
					<Select placeholder="Select mounting status">
						<Select.Option value="Good">Good</Select.Option>
						<Select.Option value="Fair">Fair</Select.Option>
						<Select.Option value="Poor">Poor</Select.Option>
					</Select>
				</Form.Item>

				{/* Mounting Condition */}
				<Form.Item<Inspection>
					label="Mounting Condition"
					name="mounting_condition"
					rules={[{ required: true, message: "Please select the Mounting Condition!" }]}
				>
					<Select  placeholder="Select Mounting Condition">
						<Select.Option value="Good">Good</Select.Option>
						<Select.Option value="Fair">Fair</Select.Option>
						<Select.Option value="Poor">Poor</Select.Option>
					</Select>
				</Form.Item>

				{/* N Load Current */}
				<Form.Item<Inspection>
					label="N Load Current"
					name="N_load_current"
					rules={[{ required: true, message: "Please enter the N load current!" }]}
				>
					<InputNumber addonAfter="A" style={{ width: "100%" }} min={0} precision={2} />
				</Form.Item>

				{/* R-S Voltage */}
				<Form.Item<Inspection>
					label="R-S Voltage"
					name="R_S_Voltage"
					rules={[{ required: true, message: "Please enter the R-S voltage!" }]}
				>
					<InputNumber addonAfter="V" style={{ width: "100%" }} min={0} precision={2} />
				</Form.Item>

				{/* R-T Voltage */}
				<Form.Item<Inspection>
					label="R-T Voltage"
					name="R_T_Voltage"
					rules={[{ required: true, message: "Please enter the R-T voltage!" }]}
				>
					<InputNumber addonAfter="V" style={{ width: "100%" }} min={0} precision={2} />
				</Form.Item>

				{/* T-S Voltage */}
				<Form.Item<Inspection>
					label="T-S Voltage"
					name="T_S_Voltage"
					rules={[{ required: true, message: "Please enter the T-S voltage!" }]}
				>
					<InputNumber addonAfter="V" style={{ width: "100%" }} min={0} precision={2} />
				</Form.Item>

				{/* Add reason field only for edit mode */}
				{title === "Edit Inspection" && (
					<Form.Item
						label="Reason for Update"
						name="reason"
						rules={[
							{ 
								required: true, 
								message: "Please provide a reason for the update" 
							},
							{
								min: 10,
								message: "Reason must be at least 10 characters long"
							}
						]}
					>
						<Input.TextArea 
							placeholder="Please provide a detailed reason for this update"
							rows={4}
						/>
					</Form.Item>
				)}
			</Form>
		</Modal>
	);
}

