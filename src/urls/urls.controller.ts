import { Body, Controller, Delete, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { UrlsService } from './urls.service';
import { UrlEntity } from './entities/url.entity';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('shorten')
  public async createShortUrl(
    @Body('originalUrl') originalUrl: string,
    @Body('expiresAt') expiresAt?: string,
  ): Promise<UrlEntity> {
    const expiresAtDate = expiresAt ? new Date(expiresAt) : undefined;
    return await this.urlsService.createShortUrl(originalUrl, expiresAtDate);
  }

  @Get(':shortUrl')
  public async redirectToOriginalUrl(
    @Param('shortUrl') shortUrl: string,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    const ipAddress =
      req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
    const originalUrl = await this.urlsService.redirectToOriginalUrl(shortUrl, ipAddress);
    return res.status(302).redirect(originalUrl);
  }

  @Get('info/:shortUrl')
  public async getUrlInfo(@Param('shortUrl') shortUrl: string): Promise<Partial<UrlEntity>> {
    return await this.urlsService.getUrlInfo(shortUrl);
  }

  @Delete('delete/:shortUrl')
  public async deleteShortUrl(@Param('shortUrl') shortUrl: string): Promise<{ message: string }> {
    await this.urlsService.deleteShortUrl(shortUrl);
    return { message: 'Short URL deleted successfully' };
  }

  @Get('analytics/:shortUrl')
  public async getAnalytics(
    @Param('shortUrl') shortUrl: string,
  ): Promise<{ clickCount: number; recentClicks: string[] }> {
    return await this.urlsService.getAnalytics(shortUrl);
  }
}
