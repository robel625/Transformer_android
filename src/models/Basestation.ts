import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class Basestation extends Model {
  static table = 'basestations';

  @text('station_code') station_code!: string;
  @text('region') region!: string;
  @text('region_id') region_id?: string;
  @text('csc') csc!: string;
  @text('csc_id') csc_id?: string;
  @text('substation') substation!: string;
  @text('substation_id') substation_id?: string;
  @text('feeder') feeder!: string;
  @text('feeder_id') feeder_id?: string;
  @text('address') address!: string;
  @text('gps_location') gps_location!: string;
  @text('station_type') station_type?: string;
  @text('created_by') created_by?: string;
  @text('updated_by') updated_by?: string;
}



