import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from '../books/books.module';
import { BorrowingsController } from './borrowings.controller';
import { BorrowingsRepository } from './borrowings.repository';
import { BorrowingsService } from './borrowings.service';
import { Borrowing } from './entities/borrowing.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Borrowing]), BooksModule],
	controllers: [BorrowingsController],
	providers: [BorrowingsService, BorrowingsRepository],
	exports: [BorrowingsService],
})
export class BorrowingsModule {}
