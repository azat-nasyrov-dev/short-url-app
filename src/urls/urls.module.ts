import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEntity } from './entities/url.entity';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { UrlClickEntity } from './entities/url-click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UrlEntity, UrlClickEntity])],
  controllers: [UrlsController],
  providers: [UrlsService],
})
export class UrlsModule {}
