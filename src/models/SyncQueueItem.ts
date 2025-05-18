import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class SyncQueueItem extends Model {
  static table = 'sync_queue';

  @text('endpoint') endpoint!: string;
  @text('method') method!: string;
  @text('title') title!: string;
  @text('data') data!: string;
  @field('timestamp') timestamp!: number;
  @text('status') status!: string;
  @text('error') error?: string;
  @field('retry_count') retryCount!: number;
}
