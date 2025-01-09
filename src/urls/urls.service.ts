import {
  BadRequestException,
  GoneException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UrlEntity } from './entities/url.entity';

@Injectable()
export class UrlsService {
  private readonly logger = new Logger(UrlsService.name);

  constructor(
    @InjectRepository(UrlEntity)
    private readonly urlRepository: Repository<UrlEntity>,
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

  public async redirectToOriginalUrl(shortUrl: string): Promise<string> {
    try {
      const url = await this.urlRepository.findOneBy({ shortUrl });

      if (!url) {
        throw new NotFoundException('Short URL not found');
      }
      if (url.expiresAt && url.expiresAt < new Date()) {
        throw new GoneException('Short URL has expired');
      }

      url.clickCount += 1;
      await this.urlRepository.save(url);
      return url.originalUrl;
    } catch (err) {
      this.logger.error('Error during redirect:', err);
      if (err instanceof NotFoundException || err instanceof GoneException) {
        throw err;
      }

      throw new InternalServerErrorException('Could not process the request');
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
}
