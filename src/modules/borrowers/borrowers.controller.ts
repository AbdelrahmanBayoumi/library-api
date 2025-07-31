import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import { BorrowersService } from './borrowers.service';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import { Borrower } from './entities/borrower.entity';

@ApiTags('Borrowers')
@Controller('borrowers')
export class BorrowersController {
	constructor(private readonly borrowersService: BorrowersService) {}

	@Post()
	@ApiOperation({ summary: 'Register a new borrower' })
	@ApiCreatedResponse({ description: 'Borrower created', type: Borrower })
	@ApiBadRequestResponse({ description: 'Invalid input' })
	@ApiBody({ type: CreateBorrowerDto })
	create(@Body() dto: CreateBorrowerDto): Promise<Borrower> {
		return this.borrowersService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'List all borrowers' })
	@ApiOkResponse({ description: 'Array of borrowers', type: [Borrower] })
	findAll(): Promise<Borrower[]> {
		return this.borrowersService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a borrower by ID' })
	@ApiOkResponse({ description: 'The found borrower', type: Borrower })
	@ApiNotFoundResponse({ description: 'Borrower not found' })
	@ApiParam({ name: 'id', description: 'Borrower ID', type: Number })
	findOne(@Param('id', ParseIntPipe) id: number): Promise<Borrower> {
		return this.borrowersService.findOne(id);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Update borrower details' })
	@ApiOkResponse({ description: 'The updated borrower', type: Borrower })
	@ApiBadRequestResponse({ description: 'Invalid input' })
	@ApiNotFoundResponse({ description: 'Borrower not found' })
	@ApiParam({ name: 'id', description: 'Borrower ID', type: Number })
	@ApiBody({ type: UpdateBorrowerDto })
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBorrowerDto): Promise<Borrower> {
		return this.borrowersService.update(id, dto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Soft-delete a borrower' })
	@ApiNoContentResponse({ description: 'Borrower soft-deleted' })
	@ApiNotFoundResponse({ description: 'Borrower not found' })
	@ApiParam({ name: 'id', description: 'Borrower ID', type: Number })
	remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.borrowersService.remove(id);
	}
}
