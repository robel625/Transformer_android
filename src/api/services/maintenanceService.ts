import apiClient from "../apiClient";

export interface MaintenanceRecord {
	id: string;
	code: string;
	details: string;
	asset: string;
	parent_asset?: string;
	status: "New" | "Assigned" | "In Progress" | "Waiting For Parts" | "Complete";
	priority: "Low" | "Medium" | "High" | "Critical";
	type: "Breakdown" | "Corrective" | "Inspection" | "Preventive" | "Movement";
	date_created: string;
	date_scheduled: string;
	date_due: string;
	date_completed?: string;
	created_by: number;
	created_by_name: string;
	assigned_to: number[]; // Changed to array of numbers
	assigned_to_names: string[]; // Changed to array of strings
	completed_by?: number;
	completed_by_name?: string;
}

export interface MaintenanceFilters {
	createdByUsers?: string;
	assignedToUsers?: string;
	completedByUsers?: string;
	assetParentAsset?: string;
	priority?: string;
	status?: string;
	type?: string;
	dateCreated?: [string, string] | null;
	dateDue?: [string, string] | null;
	dateCompleted?: [string, string] | null;
}

export interface MaintenanceUpdate {
	id: number;
	maintenance: number;
	user: string;
	message: string;
	timestamp: string;
	user_name: string;
}

export interface MaintenanceLog {
	id: number;
	change_type: string;
	old_value: string | null;
	new_value: string | null;
	timestamp: string;
	description: string;
	user_name: string;
}

const maintenanceService = {
	createMaintenance: (data: Partial<MaintenanceRecord>) =>
		apiClient.post<MaintenanceRecord>({ url: "maintenance/", data }),

	updateMaintenance: (id: string, data: Partial<MaintenanceRecord>) =>
		apiClient.patch<MaintenanceRecord>({
			url: `maintenance/${id}/`,
			data,
		}),

	getMaintenance: (params: { page?: number } = {}) =>
		apiClient.get<{ count: number; results: MaintenanceRecord[] }>({
			url: "maintenance/",
			params,
		}),

	deleteMaintenance: (id: string) => apiClient.delete({ url: `maintenance/${id}/` }),

	getMaintenanceFiltered: (params: MaintenanceFilters & { page?: number }) => {
		const formattedParams = {
			...params,
			dateCreated: params.dateCreated?.join(","),
			dateDue: params.dateDue?.join(","),
			dateCompleted: params.dateCompleted?.join(","),
		};

		return apiClient.get<{ count: number; results: MaintenanceRecord[] }>({
			url: "maintenance/filtered/",
			params: formattedParams,
		});
	},

	getMaintenanceById: (id: string) =>
		apiClient.get<MaintenanceRecord>({
			url: `maintenance/${id}/`,
		}),

	getMaintenanceUpdates: (id: string) =>
		apiClient.get<MaintenanceUpdate[]>({
			url: `maintenance/${id}/updates/`,
		}),

	createMaintenanceUpdate: (maintenanceId: string | number, formData: FormData) =>
		apiClient.post<MaintenanceUpdate>({
			url: `maintenance/${maintenanceId}/create-update/`,
			data: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}),

	getMaintenanceLogs: (id: string | number) =>
		apiClient.get<{ data: MaintenanceLog[] }>({
			url: `maintenance/${id}/logs/`,
		}),
};

export default maintenanceService;
