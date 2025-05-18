// import { Form, Input, InputNumber, Modal, Radio, Tree } from "antd";
// import { useEffect } from "react";

// import { PERMISSION_LIST } from "@/_mock/assets";
// import { flattenTrees } from "@/utils/tree";

// import type { Permission, Role } from "#/entity";
// import { BasicStatus } from "#/enum";

// export type RoleModalProps = {
// 	formValue: Role;
// 	title: string;
// 	show: boolean;
// 	onOk: VoidFunction;
// 	onCancel: VoidFunction;
// };
// const PERMISSIONS: Permission[] = PERMISSION_LIST as Permission[];
// export function RoleModal({ title, show, formValue, onOk, onCancel }: RoleModalProps) {
// 	const [form] = Form.useForm();

// 	const flattenedPermissions = flattenTrees(formValue.permission);
// 	const checkedKeys = flattenedPermissions.map((item) => item.id);
// 	useEffect(() => {
// 		form.setFieldsValue({ ...formValue });
// 	}, [formValue, form]);

// 	return (
// 		<Modal title={title} open={show} onOk={onOk} onCancel={onCancel}>
// 			<Form initialValues={formValue} form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} layout="horizontal">
// 				<Form.Item<Role> label="Name" name="name" required>
// 					<Input />
// 				</Form.Item>

// 				<Form.Item<Role> label="Label" name="label" required>
// 					<Input />
// 				</Form.Item>

// 				<Form.Item<Role> label="Order" name="order">
// 					<InputNumber style={{ width: "100%" }} />
// 				</Form.Item>

// 				<Form.Item<Role> label="Status" name="status" required>
// 					<Radio.Group optionType="button" buttonStyle="solid">
// 						<Radio value={BasicStatus.ENABLE}> Enable </Radio>
// 						<Radio value={BasicStatus.DISABLE}> Disable </Radio>
// 					</Radio.Group>
// 				</Form.Item>

// 				<Form.Item<Role> label="Desc" name="desc">
// 					<Input.TextArea />
// 				</Form.Item>

// 				<Form.Item<Role> label="Permission" name="permission">
// 					<Tree
// 						checkable
// 						checkedKeys={checkedKeys}
// 						treeData={PERMISSIONS}
// 						fieldNames={{
// 							key: "id",
// 							children: "children",
// 							title: "name",
// 						}}
// 					/>
// 				</Form.Item>
// 			</Form>
// 		</Modal>
// 	);
// }

import { DatePicker, Form, Input, Modal, Select, InputNumber } from "antd";
import { useEffect, useState } from "react";
import type { TransformerData } from "#/entity";
import { toast } from "sonner";
import transformerService from "@/api/services/transformerService";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import dayjs from "dayjs";
import { e } from "node_modules/react-router/dist/development/route-data-Cq_b5feC.d.mts";

// Add these near the top of your file with other constants
const SERVICE_TYPE_CHOICES = [
  { value: 'Dedicated', label: 'Dedicated' },
  { value: 'Public', label: 'Public' },
];

const STATUS_CHOICES = [
  { value: 'New', label: 'New' },
  { value: 'Maintained', label: 'Maintained' },
];

// Define the props for the TransformerModal
export interface TransformerModalProps {
	title: string;
	show: boolean;
	formValue: TransformerData;
	onOk: () => void;
	onCancel: () => void;
	onDataChange: (newData: TransformerData, isEdit: boolean) => void;
}

// TransformerModal component
export function TransformerModal({ title, show, formValue, onOk, onCancel, onDataChange }: TransformerModalProps) {
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
				try {
					console.log("creat transforemer	values", title, values);
					if (title === "Create New Transformer") {
						const response = await TransformerMutation.mutateAsync(values);
						if (response?.error) {
							toast.error(response.error);
							return;
						}
						onDataChange(response, false); // Add new data to table
						toast.success("Transformer created successfully!");
					} else if (title === "Edit Transformer") {
						const updatedValues = form.getFieldsValue(); // Get the latest form values
						const response = await transformerService.updateTransformer(formValue.id, updatedValues);
						onDataChange({ ...formValue, ...updatedValues }, true); // Update existing data in table
						toast.success("Transformer updated successfully");
					}

					onOk(); // Call the parent's onOk handler
					setLoading(false); // Reset loading state
				} catch (error) {
					toast.error("Operation failed. Please try again.");
				}
			})
			.catch((errorInfo) => {
				console.log("Validation failed:", errorInfo);
				// Handle validation errors if needed
			});
	};

	const TransformerMutation = useMutation({
		mutationFn: transformerService.createTransformer,
	});

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

	return (
		<Modal title={title} open={show} onOk={handleOk} onCancel={onCancel}>
			<Form initialValues={formValue} form={form} labelCol={{ span: 9 }} wrapperCol={{ span: 18 }} layout="horizontal">
				{/* Station Code */}
				<Form.Item<TransformerData>
					label="Station Code"
					name="basestation"
					// rules={[{ required: true, message: 'Please enter the station code!' }]}
				>
					<Input />
				</Form.Item>

				{/* Transformer Type */}
				<Form.Item<TransformerData>
					label="Transformer Type"
					name="trafo_type"
					rules={[{ required: true, message: "Please select the transformer type!" }]}
				>
					<Select placeholder="Select transformer type">
						<Select.Option value="Conservator">Conservator</Select.Option>
						<Select.Option value="Hermatical">Hermatical</Select.Option>
						<Select.Option value="Compact">Compact</Select.Option>
					</Select>
				</Form.Item>

				{/* Capacity */}
				<Form.Item<TransformerData>
					label="Capacity"
					name="capacity"
					rules={[{ required: true, message: "Please select the capacity!" }]}
				>
					<Select placeholder="Select capacity">
						<Select.Option value="10">10 kVA</Select.Option>
						<Select.Option value="25">25 kVA</Select.Option>
						<Select.Option value="50">50 kVA</Select.Option>
						<Select.Option value="100">100 kVA</Select.Option>
						<Select.Option value="200">200 kVA</Select.Option>
						<Select.Option value="315">315 kVA</Select.Option>
						<Select.Option value="400">400 kVA</Select.Option>
						<Select.Option value="500">500 kVA</Select.Option>
						<Select.Option value="630">630 kVA</Select.Option>
						<Select.Option value="800">800 kVA</Select.Option>
						<Select.Option value="1250">1250 kVA</Select.Option>
						<Select.Option value="2500">2500 kVA</Select.Option>
						<Select.Option value="null">Other</Select.Option>
					</Select>
				</Form.Item>

				{/* DT Number */}
				<Form.Item<TransformerData>
					label="DT Number"
					name="dt_number"
					rules={[{ required: true, message: "Please enter the DT number!" }]}
				>
					<Input />
				</Form.Item>

				{/* Primary Voltage */}
				<Form.Item<TransformerData>
					label="Primary Voltage"
					name="primary_voltage"
					rules={[{ required: true, message: "Please select the primary voltage!" }]}
				>
					<Select placeholder="Select primary voltage">
						<Select.Option value="15">15 kVA</Select.Option>
						<Select.Option value="19">19 kVA</Select.Option>
						<Select.Option value="33">33 kVA</Select.Option>
						<Select.Option value="null">Other</Select.Option>
					</Select>
				</Form.Item>

				{/* Cooling Type */}
				<Form.Item<TransformerData>
					label="Cooling Type"
					name="colling_type"
					rules={[{ required: true, message: "Please select the cooling type!" }]}
				>
					<Select placeholder="Select cooling type">
						<Select.Option value="ONAN">ONAN</Select.Option>
						<Select.Option value="Dry Type">Dry Type</Select.Option>
					</Select>
				</Form.Item>

				{/* Serial Number */}
				<Form.Item<TransformerData>
					label="Serial Number"
					name="serial_number"
					rules={[{ required: true, message: "Please enter the serial number!" }]}
				>
					<Input />
				</Form.Item>

				{/* Manufacturer */}
				<Form.Item<TransformerData>
					label="Manufacturer"
					name="manufacturer"
					rules={[{ required: true, message: "Please select the manufacturer!" }]}
				>
					<Select placeholder="Select manufacturer">
						<Select.Option value="ABB Tanzania">ABB Tanzania</Select.Option>
						<Select.Option value="Apex">Apex</Select.Option>
						<Select.Option value="China Natinal Electric wire and cable Imp/Exp corporations">
							China Natinal Electric wire and cable Imp/Exp corporations
						</Select.Option>
						<Select.Option value="Iran Transformer">Iran Transformer</Select.Option>
						<Select.Option value="Kobera">Kobera</Select.Option>
						<Select.Option value="Koncar">Koncar</Select.Option>
						<Select.Option value="Mar son's">Mar son's</Select.Option>
						<Select.Option value="METEC">METEC</Select.Option>
						<Select.Option value="Minel Transformer">Minel Transformer</Select.Option>
						<Select.Option value="Pauwels">Pauwels</Select.Option>
						<Select.Option value="Stromberg">Stromberg</Select.Option>
						<Select.Option value="Vijai Electrical Ltd Hyderabad">Vijai Electrical Ltd Hyderabad</Select.Option>
						<Select.Option value="Zennaro">Zennaro</Select.Option>
						<Select.Option value="Other Manufacturer">Other Manufacturer</Select.Option>
					</Select>
				</Form.Item>

				{/* Vector Group */}
				<Form.Item<TransformerData>
					label="Vector Group"
					name="vector_group"
					rules={[{ required: true, message: "Please select the vector group!" }]}
				>
					<Select placeholder="Select vector group">
						<Select.Option value="DY1">DY1</Select.Option>
						<Select.Option value="DY5">DY5</Select.Option>
						<Select.Option value="DY11">DY11</Select.Option>
						<Select.Option value="Other">Other</Select.Option>
					</Select>
				</Form.Item>

				{/* Service Type */}
				<Form.Item<TransformerData>
					label="Service Type"
					name="service_type"
					rules={[{ required: true, message: "Please select the service type!" }]}
				>
					<Select placeholder="Select service type">
						{SERVICE_TYPE_CHOICES.map(option => (
							<Select.Option key={option.value} value={option.value}>
								{option.label}
							</Select.Option>
						))}
					</Select>
				</Form.Item>

				{/* Status */}
				<Form.Item<TransformerData>
					label="Status"
					name="status"
					rules={[{ required: true, message: "Please select the status!" }]}
				>
					<Select placeholder="Select status">
						{STATUS_CHOICES.map(option => (
							<Select.Option key={option.value} value={option.value}>
								{option.label}
							</Select.Option>
						))}
					</Select>
				</Form.Item>

				{/* Impedance Voltage */}
				<Form.Item<TransformerData>
					label="Impedance Voltage"
					name="impedance_voltage"
					rules={[
						{ required: true, message: "Please enter the impedance voltage!" },
						{ 
							type: "number",
							min: 0.01,
							message: "Impedance voltage must be greater than 0!",
							transform: (value) => Number(value)
						}
					]}
					validateFirst={true}
				>
					<InputNumber
						addonAfter="%"
						style={{ width: "100%" }}
						placeholder="Enter impedance voltage"
						min={0.01}
						precision={2}
						step={0.1}
						formatter={value => `${value}`.replace(/[^0-9.]/, '')}
						parser={value => value!.replace(/[^0-9.]/, '')}
					/>
				</Form.Item>

				{/* Winding Weight */}
				<Form.Item<TransformerData>
					label="Winding Weight"
					name="winding_weight"
					rules={[
						{ required: true, message: "Please enter the winding weight!" },
						{ 
							type: "number",
							min: 0.01,
							message: "Winding weight must be greater than 0!",
							transform: (value) => Number(value)
						}
					]}
					validateFirst={true}
				>
					<InputNumber
						addonAfter="kg"
						style={{ width: "100%" }}
						placeholder="Enter winding weight"
						min={0.01}
						precision={2}
						step={0.1}
						formatter={value => `${value}`.replace(/[^0-9.]/, '')}
						parser={value => value!.replace(/[^0-9.]/, '')}
					/>
				</Form.Item>

				{/* Oil Weight */}
				<Form.Item<TransformerData>
					label="Oil Weight"
					name="oil_weight"
					rules={[
						{ required: true, message: "Please enter the oil weight!" },
						{ 
							type: "number",
							min: 0.01,
							message: "Oil weight must be greater than 0!",
							transform: (value) => Number(value)
						}
					]}
					validateFirst={true}
				>
					<InputNumber
						addonAfter="kg"
						style={{ width: "100%" }}
						placeholder="Enter oil weight"
						min={0.01}
						precision={2}
						step={0.1}
						formatter={value => `${value}`.replace(/[^0-9.]/, '')}
						parser={value => value!.replace(/[^0-9.]/, '')}
					/>
				</Form.Item>

				{/* Year of Manufacturing */}
				<Form.Item
					label="Year of Manufacturing"
					name="year_of_manufacturing"
					rules={[{ required: true, message: "Please select the year of manufacturing!" }]}
				>
					<Select>
						{years.map((year) => (
							<Option key={year} value={year}>
								{year}
							</Option>
						))}
					</Select>
				</Form.Item>

				{/* Date of Installation */}
				<Form.Item
					label="Date of Installation"
					name="date_of_installation"
					getValueProps={(value) => ({
						value: value ? dayjs(value) : null,
					})}
					getValueFromEvent={(date) => (date ? date.format("YYYY-MM-DD") : null)}
				>
					<DatePicker className="w-full" />
				</Form.Item>

				
			</Form>
		</Modal>
	);
}




