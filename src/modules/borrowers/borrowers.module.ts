import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowersController } from './borrowers.controller';
import { BorrowersRepository } from './borrowers.repository';
import { BorrowersService } from './borrowers.service';
import { Borrower } from './entities/borrower.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Borrower])],
	controllers: [BorrowersController],
	providers: [BorrowersService, BorrowersRepository],
	exports: [BorrowersService],
})
export class BorrowersModule {}
