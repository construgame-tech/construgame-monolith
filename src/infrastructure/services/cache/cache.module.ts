import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoCacheService } from './dynamo-cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DynamoCacheService],
  exports: [DynamoCacheService],
})
export class CacheModule {}
