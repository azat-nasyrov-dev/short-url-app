import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEntity } from './entities/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UrlEntity])],
})
export class UrlsModule {}
