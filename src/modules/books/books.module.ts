import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksRepository } from './books.repository';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Book])],
	controllers: [BooksController],
	providers: [BooksService, BooksRepository],
	exports: [BooksService],
})
export class BooksModule {}
