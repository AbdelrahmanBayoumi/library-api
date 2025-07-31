import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import { BorrowingsService } from './borrowings.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { ReturnBorrowingDto } from './dto/return-borrowing.dto';
import { Borrowing } from './entities/borrowing.entity';

@ApiTags('Borrowings')
@Controller('borrowings')
export class BorrowingsController {
	constructor(private readonly borrowingsService: BorrowingsService) {}

	@Post()
	@ApiOperation({ summary: 'Checkout a book for a borrower' })
	@ApiCreatedResponse({
		description: 'Borrowing record created',
		type: Borrowing,
	})
	@ApiBadRequestResponse({
		description: 'Book not available or invalid input',
	})
	@ApiBody({ type: CreateBorrowingDto })
	checkout(@Body() dto: CreateBorrowingDto): Promise<Borrowing> {
		return this.borrowingsService.create(dto);
	}

	@Patch(':id/return')
	@ApiOperation({ summary: 'Return a borrowed book' })
	@ApiOkResponse({
		description: 'Borrowing record updated',
		type: Borrowing,
	})
	@ApiBadRequestResponse({
		description: 'Invalid operation (e.g., already returned)',
	})
	@ApiNotFoundResponse({ description: 'Borrowing not found' })
	@ApiParam({ name: 'id', description: 'Borrowing record ID', type: Number })
	@ApiBody({ type: ReturnBorrowingDto })
	returnBook(@Param('id', ParseIntPipe) id: number, @Body() dto: ReturnBorrowingDto): Promise<Borrowing> {
		return this.borrowingsService.returnBook(id, dto.returnDate);
	}

	@Get('borrower/:borrowerId')
	@ApiOperation({ summary: 'Get current loans for a borrower' })
	@ApiOkResponse({
		description: 'Array of borrowing records',
		type: [Borrowing],
	})
	@ApiParam({
		name: 'borrowerId',
		description: 'Borrower ID to fetch loans for',
		type: Number,
	})
	getLoans(@Param('borrowerId', ParseIntPipe) borrowerId: number): Promise<Borrowing[]> {
		return this.borrowingsService.findLoansForBorrower(borrowerId);
	}

	@Get('overdue')
	@ApiOperation({ summary: 'List all overdue borrowings' })
	@ApiOkResponse({
		description: 'Array of overdue borrowing records',
		type: [Borrowing],
	})
	getOverdue(): Promise<Borrowing[]> {
		return this.borrowingsService.findOverdue();
	}
}
