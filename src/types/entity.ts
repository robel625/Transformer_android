import type { BasicStatus, PermissionType } from "./enum";

export interface UserToken {
	accessToken?: string;
	refreshToken?: string;
}

export interface UserInfo {
	id: string;
	email: string;
	username: string;
	password?: string;
	phone?: string;
	address?: string;
	city?: string;
	about?: string;
	avatar?: string;
	is_active?: boolean;
	role?: Role;
	status?: BasicStatus;
	permissions?: Permission[];
}

export interface Organization {
	csc_code: string;
	name: string;
	type?: string;
	parent?: string;
	children?: Organization[];
	mode?: "create" | "edit";
}

export interface Permission {
	id: string;
	parentId: number | null; // Can be null for root-level permissions
	name: string;
	label: string;
	type: PermissionType;
	route: string;
	status?: BasicStatus;
	order: number | null; // Explicitly allow null
	icon?: string;
	component?: string;
	hide?: boolean;
	hideTab?: boolean;
	frameSrc?: URL;
	newFeature?: boolean;
	children?: Permission[];
}

export interface Role {
	id: string;
	name: string;
	label: string;
	status: BasicStatus;
	order?: number;  // optional but not null
	desc?: string;
	permission?: Permission[];
}

// export interface User {
// 	id: string;
// 	email: string;
// 	username: string;
// 	avatar?: string;
// 	role?: Role;
// 	is_active?: boolean;
// 	permissions?: Permission[];
// }

export interface Basestation {
	station_code: string; // Code of the station
	region: string; // Region where the basestation is located
	csc: string; // CSC (Control System Center) associated with the basestation
	substation: string; // Substation name or identifier
	feeder: string; // Feeder name or identifier
	address: string; // Physical address of the basestation
	gps_location: string; // GPS coordinates of the basestation
	station_type?: string; // Type of the station
	created_at: Date; // Timestamp when the basestation record was created
	updated_at: Date; // Timestamp when the basestation record was last updated
	created_by?: UserInfo | null; // User who created the basestation record (optional)
	updated_by?: UserInfo | null; // User who last updated the basestation record (optional)
}

export const STATION_TYPES = [
	'Single Wooden Pole',
	'Single Concrete Pole',
	'Single Steel Pole',
	'Double Wooden Pole',
	'Double Concrete Pole',
	'Double Steel Pole',
	'Triple Wooden Pole',
	'Triple Concrete Pole',
	'Triple Steel Pole',
	'Quadruple Wooden Pole',
	'Quadruple Concrete Pole',
	'Quadruple Steel Pole',
	'Ground Seat Foundation Elevated',
	'Ground Seat Foundation Ground Level',
	'Net Station',
] as const;

export type StationType = typeof STATION_TYPES[number];

export interface TransformerData {
	id: number; // Unique identifier for the transformer data
	basestation: string; // Code of the station where the transformer is located
	trafo_type: string; // Type of the transformer (e.g., Oil-Cooled, Dry-Type)
	capacity: string; // Capacity of the transformer (e.g., "500 kVA")
	dt_number: string; // Distribution transformer number
	primary_voltage: string; // Primary voltage rating (e.g., "11 kV")
	colling_type: string; // Cooling type of the transformer (e.g., ONAN, ONAF)
	serial_number: string; // Serial number of the transformer
	manufacturer: string; // Manufacturer name
	vector_group: string; // Vector group of the transformer (e.g., Dyn11)
	impedance_voltage: number | null; // Impedance voltage percentage
	winding_weight: number | null; // Weight of the windings in kg
	oil_weight: number | null; // Weight of the oil in kg
	year_of_manufacturing: string; // Year the transformer was manufactured
	date_of_installation: string; // Date the transformer was installed
	// created_at: Date; // Timestamp when the basestation record was created
	// updated_at: Date; // Timestamp when the basestation record was last updated
	created_by?: UserInfo | null; // User who created the record (optional)
	updated_by?: UserInfo | null; // User who last updated the record (optional)
}

export interface Inspection {
	id: any; // Unique identifier for the inspection
	owner: string; // Owner of the transformer or inspection
	service_type: string; // Type of service performed
	body_condition: string; // Condition of the transformer body
	arrester: string; // Details about arresters
	drop_out: string; // Details about drop-out mechanisms
	fuse_link: string; // Details about fuse links
	bushing: string; // Details about bushings
	cable_lugs: string; // Details about cable lugs
	horn_gap: string; // Details about horn gaps
	tap_changer_position: string; // Position of the tap changer
	oil_level: string; // Oil level in the transformer
	oil_leakage: string; // Details about oil leakage
	silica_gel: string; // Condition of silica gel
	cable_size: string; // Size of the cables
	neutral_ground: string; // Details about neutral grounding
	arrester_body_ground: string;
	N_load_current: number | null; // Neutral load current in Amperes
	R_S_Voltage: number | null; // Voltage between R and S phases in Volts
	R_T_Voltage: number | null; // Voltage between R and T phases in Volts
	T_S_Voltage: number | null; // Voltage between T and S phases in Volts
	created_at: Date; // Timestamp when the inspection record was created
	updated_at: Date; // Timestamp when the inspection record was last updated
	created_by?: UserInfo | null; // User who created the inspection record (optional)
	updated_by?: UserInfo | null; // User who last updated the inspection record (optional)
	transformer_data?: TransformerData | null; // Associated transformer data (optional)
}

export interface LvFeeder {
	id: number; // Unique identifier for the LvFeeder
	type_of_distribution_box: string; // Type of distribution box
	R_load_current: number | null; // Load current for phase R in Amperes
	S_load_current: number | null; // Load current for phase S in Amperes
	T_load_current: number | null; // Load current for phase T in Amperes
	R_fuse_rating: number | null; // Fuse rating for phase R in Amperes
	S_fuse_rating: number | null; // Fuse rating for phase S in Amperes
	T_fuse_rating: number | null; // Fuse rating for phase T in Amperes
	created_at: Date; // Timestamp when the LvFeeder record was created
	updated_at: Date; // Timestamp when the LvFeeder record was last updated
	created_by?: UserInfo | null; // User who created the LvFeeder record (optional)
	updated_by?: UserInfo | null; // User who last updated the LvFeeder record (optional)
	inspection_data?: Inspection | null; // Associated inspection data (optional)
}




