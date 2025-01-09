import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UrlEntity } from './url.entity';

@Entity('urls_clicks')
export class UrlClickEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'clicked_at' })
  clickedAt: Date;

  @Column({ name: 'ip_address' })
  ipAddress: string;

  @ManyToOne(() => UrlEntity, (url) => url.clicks, { onDelete: 'CASCADE' })
  url: UrlEntity;
}
