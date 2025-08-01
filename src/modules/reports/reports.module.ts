import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowingsModule } from '../borrowings/borrowings.module';
import { Borrowing } from '../borrowings/entities/borrowing.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
	imports: [TypeOrmModule.forFeature([Borrowing]), BorrowingsModule],
	controllers: [ReportsController],
	providers: [ReportsService],
})
export class ReportsModule {}
