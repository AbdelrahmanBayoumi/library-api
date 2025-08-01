import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';

import { Throttle } from '@nestjs/throttler';
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
	@ApiOkResponse({
		description: 'Paginated list of borrowers',
		schema: {
			properties: {
				data: {
					type: 'array',
					items: { $ref: '#/components/schemas/Borrower' },
				},
				total: {
					type: 'number',
					description: 'Total number of records',
				},
			},
		},
	})
	@ApiQuery({ name: 'name', required: false, type: String })
	@ApiQuery({ name: 'email', required: false, type: String })
	@ApiQuery({ name: 'page', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({
		name: 'sortBy',
		required: false,
		enum: ['name', 'email', 'registeredDate'],
	})
	@ApiQuery({
		name: 'sortOrder',
		required: false,
		enum: ['ASC', 'DESC'],
	})
	@Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests per minute
	async findAll(
		@Query('name') name?: string,
		@Query('email') email?: string,
		@Query('page') page?: number,
		@Query('limit') limit?: number,
		@Query('sortBy') sortBy?: 'name' | 'email' | 'registeredDate',
		@Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
	): Promise<{ data: Borrower[]; total: number }> {
		return this.borrowersService
			.findAll({ name, email, page, limit, sortBy, sortOrder })
			.then(([data, total]) => ({ data, total }));
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
