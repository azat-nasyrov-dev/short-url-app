import {
  BadRequestException,
  GoneException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UrlEntity } from './entities/url.entity';
import { UrlClickEntity } from './entities/url-click.entity';

@Injectable()
export class UrlsService {
  private readonly logger = new Logger(UrlsService.name);

  constructor(
    @InjectRepository(UrlEntity)
    private readonly urlRepository: Repository<UrlEntity>,
    @InjectRepository(UrlClickEntity)
    private readonly urlClickRepository: Repository<UrlClickEntity>,
    private readonly dataSource: DataSource,
  ) {}

  public async createShortUrl(originalUrl: string, expiresAt?: Date): Promise<UrlEntity> {
    try {
      const existingUrl = await this.urlRepository.findOneBy({ originalUrl });
      if (existingUrl) {
        throw new BadRequestException('This URL has already been shortened');
      }

      const shortUrl = crypto.randomBytes(3).toString('hex');
      const url = this.urlRepository.create({ originalUrl, shortUrl, expiresAt });
      return await this.urlRepository.save(url);
    } catch (err) {
      this.logger.error('Error during creation short URL:', err);
      if (err instanceof BadRequestException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not create short URL. Please try again');
    }
  }

  public async redirectToOriginalUrl(shortUrl: string, ipAddress: string): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const urlRepository = queryRunner.manager.getRepository(UrlEntity);
      const urlClickRepository = queryRunner.manager.getRepository(UrlClickEntity);

      const url = await urlRepository.findOne({
        where: { shortUrl },
        relations: ['clicks'],
      });

      if (!url) {
        throw new NotFoundException('Short URL not found');
      }
      if (url.expiresAt && url.expiresAt < new Date()) {
        throw new GoneException('Short URL has expired');
      }

      url.clickCount += 1;

      const click = urlClickRepository.create({
        ipAddress: ipAddress || '0.0.0.0',
        url,
      });

      console.log('Click entity:', click);
      console.log('URL ID:', click.url?.id);

      await this.urlClickRepository.save(click);
      await this.urlRepository.save(url);
      await queryRunner.commitTransaction();

      return url.originalUrl;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error during redirect:', err);
      if (err instanceof NotFoundException || err instanceof GoneException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not process the request');
    } finally {
      await queryRunner.release();
    }
  }

  public async getUrlInfo(shortUrl: string): Promise<Partial<UrlEntity>> {
    try {
      const url = await this.urlRepository.findOneBy({ shortUrl });
      if (!url) {
        throw new NotFoundException('Short URL not found');
      }

      return {
        originalUrl: url.originalUrl,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
      };
    } catch (err) {
      this.logger.error('Error fetching URL info:', err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not retrieve URL info');
    }
  }

  public async deleteShortUrl(shortUrl: string): Promise<void> {
    try {
      const url = await this.urlRepository.findOneBy({ shortUrl });
      if (!url) {
        throw new NotFoundException('Short URL not found');
      }

      await this.urlRepository.remove(url);
    } catch (err) {
      this.logger.error('Error during deleting short URL:', err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not delete the short URL');
    }
  }

  public async getAnalytics(
    shortUrl: string,
  ): Promise<{ clickCount: number; recentClicks: string[] }> {
    try {
      const url = await this.urlRepository.findOne({ where: { shortUrl } });
      if (!url) {
        throw new NotFoundException('Short URL not found');
      }

      const clicks = await this.urlClickRepository.find({
        where: { url: { id: url.id } },
        order: { clickedAt: 'DESC' },
        take: 5,
      });

      return {
        clickCount: url.clickCount,
        recentClicks: clicks.map((click) => click.ipAddress),
      };
    } catch (err) {
      this.logger.error('Error fetching URL analytics:', err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not retrieve URL analytics');
    }
  }
}
