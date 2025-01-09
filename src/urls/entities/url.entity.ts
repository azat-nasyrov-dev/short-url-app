import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('urls')
export class UrlEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_url', type: 'text', unique: true })
  originalUrl: string;

  @Column({ name: 'short_url', type: 'text', unique: true })
  shortUrl: string;

  @Column({ name: 'click_count', type: 'int', default: 0 })
  clickCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
