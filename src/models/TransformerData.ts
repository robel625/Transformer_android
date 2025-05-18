import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class TransformerData extends Model {
  static table = 'transformer_data';

  @text('basestation_id') basestation_id!: string;
  @field('transformer_id') transformer_id!: number; // Custom numeric ID
  @text('trafo_type') trafo_type!: string;
  @text('capacity') capacity!: string;
  @text('dt_number') dt_number?: string;
  @text('primary_voltage') primary_voltage!: string;
  @text('colling_type') colling_type!: string;
  @text('serial_number') serial_number!: string;
  @text('manufacturer') manufacturer?: string;
  @text('vector_group') vector_group!: string;
  @field('impedance_voltage') impedance_voltage!: number;
  @field('winding_weight') winding_weight!: number;
  @field('oil_weight') oil_weight!: number;
  @field('year_of_manufacturing') year_of_manufacturing?: number;
  @field('date_of_installation') date_of_installation?: number;
  @text('service_type') service_type?: string;
  @text('status') status?: string;
  @text('created_by') created_by?: string;
  @text('updated_by') updated_by?: string;
}






