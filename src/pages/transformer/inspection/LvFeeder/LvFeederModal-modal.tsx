// import { Form, Input, Modal, Select, InputNumber } from "antd";
// import { useEffect, useState } from "react";
// import type { LvFeeder } from "#/entity"; // Import the LvFeeder type
// import { useMutation } from "@tanstack/react-query";
// import transformerService from "@/api/services/transformerService";
// import { toast } from "sonner";

// // Define the props for the LvFeederModal
// export interface LvFeederModalProps {
// 	title: string;
// 	show: boolean;
// 	inspectionId: number;
// 	formValue: LvFeeder;
// 	onOk: () => void;
// 	onCancel: () => void;
// 	onDataChange: (newData: LvFeeder, isEdit: boolean) => void;
// }

// // LvFeederModal component
// export function LvFeederModal({ 
// 	title, 
// 	show, 
// 	inspectionId, 
// 	formValue, 
// 	onOk, 
// 	onCancel,
// 	onDataChange 
// }: LvFeederModalProps) {
// 	const [form] = Form.useForm();
// 	const [loading, setLoading] = useState(false);

// 	const handleOk = () => {
// 		form
// 			.validateFields()
// 			.then(async (values: any) => {
// 				setLoading(true);
// 				try {
// 					if (title === "Create New LvFeeder") {
// 						const data = {
// 							...values,
// 							inspection_data: inspectionId,
// 						};
// 						const response = await transformerService.createLvFeeder(data);
// 						if (response) {
// 							if (onDataChange) {
// 								onDataChange(response, false);
// 							}
// 							toast.success("LvFeeder created successfully!");
// 							onOk();
// 							form.resetFields();
// 						}
// 					} else if (title === "Edit LvFeeder") {
// 						const updatedValues = form.getFieldsValue();
// 						const data = {
// 							...updatedValues,
// 							inspection_data: inspectionId,
// 						};
// 						const response = await transformerService.updateLvFeeder(formValue.id, data);
// 						if (response) {
// 							if (onDataChange) {
// 								onDataChange({ ...formValue, ...response }, true);
// 							}
// 							toast.success("LvFeeder updated successfully");
// 							onOk();
// 						}
// 					}
// 				} catch (error: any) {
// 					console.error('LvFeeder operation error:', error);
// 					toast.error(error.message || "Operation failed. Please try again.");
// 				} finally {
// 					setLoading(false);
// 				}
// 			})
// 			.catch((info) => {
// 				console.log('Validation failed:', info);
// 			});
// 	};

// 	// Update form values when formValue changes
// 	useEffect(() => {
// 		form.setFieldsValue({ ...formValue });
// 	}, [formValue, form]);

// 	return (
// 		<Modal title={title} open={show} onOk={handleOk} onCancel={onCancel} confirmLoading={loading}>
// 			<Form initialValues={formValue} form={form} labelCol={{ span: 10 }} wrapperCol={{ span: 13 }} layout="horizontal">
// 				{/* Type of Distribution Box */}
// 				<Form.Item<LvFeeder>
// 					label="Distribution Box Type"
// 					name="type_of_distribution_box"
// 					rules={[{ required: true, message: "Please select the distribution box type!" }]}
// 				>
// 					<Select placeholder="Select distribution box type">
// 						{["Box 1", "Box 2", "Box 3", "Box 4", "Box 5"].map((box) => (
// 							<Select.Option key={box} value={box}>
// 								{box}
// 							</Select.Option>
// 						))}
// 					</Select>
// 				</Form.Item>

// 				{/* R Load Current */}
// 				<Form.Item<LvFeeder>
// 					label="R Load Current"
// 					name="R_load_current"
// 					rules={[{ required: true, message: "Please enter the R load current!" }]}
// 				>
// 					<InputNumber
// 						addonAfter="A"
// 						style={{ width: "100%" }}
// 						min={0}
// 						precision={2}
// 						placeholder="Enter number"
// 						defaultValue={null}
// 					/>
// 				</Form.Item>

// 				{/* S Load Current */}
// 				<Form.Item<LvFeeder>
// 					label="S Load Current"
// 					name="S_load_current"
// 					rules={[{ required: true, message: "Please enter the S load current!" }]}
// 				>
// 					<InputNumber
// 						addonAfter="A"
// 						style={{ width: "100%" }}
// 						min={0}
// 						precision={2}
// 						placeholder="Enter number"
// 						defaultValue={null}
// 					/>
// 				</Form.Item>

// 				{/* T Load Current */}
// 				<Form.Item<LvFeeder>
// 					label="T Load Current"
// 					name="T_load_current"
// 					rules={[{ required: true, message: "Please enter the T load current!" }]}
// 				>
// 					<InputNumber
// 						addonAfter="A"
// 						style={{ width: "100%" }}
// 						min={0}
// 						precision={2}
// 						placeholder="Enter number"
// 						defaultValue={null}
// 					/>
// 				</Form.Item>

// 				{/* R Fuse Rating */}
// 				<Form.Item<LvFeeder>
// 					label="R Fuse Rating"
// 					name="R_fuse_rating"
// 					rules={[{ required: true, message: "Please enter the R fuse rating!" }]}
// 				>
// 					<InputNumber
// 						addonAfter="A"
// 						style={{ width: "100%" }}
// 						min={0}
// 						precision={2}
// 						placeholder="Enter number"
// 						defaultValue={null}
// 					/>
// 				</Form.Item>

// 				{/* S Fuse Rating */}
// 				<Form.Item<LvFeeder>
// 					label="S Fuse Rating"
// 					name="S_fuse_rating"
// 					rules={[{ required: true, message: "Please enter the S fuse rating!" }]}
// 				>
// 					<InputNumber
// 						addonAfter="A"
// 						style={{ width: "100%" }}
// 						min={0}
// 						precision={2}
// 						placeholder="Enter number"
// 						defaultValue={null}
// 					/>
// 				</Form.Item>

// 				{/* T Fuse Rating */}
// 				<Form.Item<LvFeeder>
// 					label="T Fuse Rating"
// 					name="T_fuse_rating"
// 					rules={[{ required: true, message: "Please enter the T fuse rating!" }]}
// 				>
// 					<InputNumber
// 						addonAfter="A"
// 						style={{ width: "100%" }}
// 						min={0}
// 						precision={2}
// 						placeholder="Enter number"
// 						defaultValue={null}
// 					/>
// 				</Form.Item>

// 				{/* Add reason field only for edit mode */}
// 				{title === "Edit LvFeeder" && (
// 					<Form.Item
// 						label="Reason for Update"
// 						name="reason"
// 						rules={[
// 							{ 
// 								required: true, 
// 								message: "Please provide a reason for the update" 
// 							},
// 							{
// 								min: 10,
// 								message: "Reason must be at least 10 characters long"
// 							}
// 						]}
// 					>
// 						<Input.TextArea 
// 							placeholder="Please provide a detailed reason for this update"
// 							rows={4}
// 						/>
// 					</Form.Item>
// 				)}
// 			</Form>
// 		</Modal>
// 	);
// }



