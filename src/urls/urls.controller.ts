import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UrlsService } from './urls.service';
import { UrlEntity } from './entities/url.entity';
import { CreateShortUrlDto } from './dto/create-short-url.dto';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('shorten')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async createShortUrl(@Body() createShortUrlDto: CreateShortUrlDto): Promise<UrlEntity> {
    const { originalUrl, expiresAt, customAlias } = createShortUrlDto;
    const expiresAtDate = expiresAt ? new Date(expiresAt) : undefined;
    return await this.urlsService.createShortUrl(originalUrl, expiresAtDate, customAlias);
  }

  @Get(':shortOrAlias')
  public async redirectToOriginalUrl(
    @Param('shortOrAlias') shortOrAlias: string,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    const ipAddress =
      req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
    const originalUrl = await this.urlsService.redirectToOriginalUrl(shortOrAlias, ipAddress);
    return res.status(302).redirect(originalUrl);
  }

  @Get('info/:shortOrAlias')
  public async getUrlInfo(
    @Param('shortOrAlias') shortOrAlias: string,
  ): Promise<Partial<UrlEntity>> {
    return await this.urlsService.getUrlInfo(shortOrAlias);
  }

  @Delete('delete/:shortOrAlias')
  public async deleteShortUrl(
    @Param('shortOrAlias') shortOrAlias: string,
  ): Promise<{ message: string }> {
    await this.urlsService.deleteShortUrl(shortOrAlias);
    return { message: 'Short URL or custom alias deleted successfully' };
  }

  @Get('analytics/:shortUrl')
  public async getAnalytics(
    @Param('shortUrl') shortUrl: string,
  ): Promise<{ clickCount: number; recentClicks: string[] }> {
    return await this.urlsService.getAnalytics(shortUrl);
  }
}
