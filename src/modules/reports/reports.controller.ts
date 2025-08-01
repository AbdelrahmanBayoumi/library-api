// src/modules/reports/reports.controller.ts

import { BadRequestException, Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports/borrowings')
export class ReportsController {
	constructor(private readonly reports: ReportsService) {}

	@Get('analytics')
	@ApiOperation({ summary: 'Get borrowing analytics for a period' })
	@ApiOkResponse({
		schema: {
			properties: {
				totalBorrowed: { type: 'integer' },
				totalReturned: { type: 'integer' },
				totalOverdue: { type: 'integer' },
				daily: {
					type: 'array',
					items: {
						type: 'object',
						properties: { date: { type: 'string' }, count: { type: 'integer' } },
					},
				},
				topBooks: {
					type: 'array',
					items: {
						type: 'object',
						properties: { title: { type: 'string' }, count: { type: 'integer' } },
					},
				},
				topBorrowers: {
					type: 'array',
					items: {
						type: 'object',
						properties: { name: { type: 'string' }, count: { type: 'integer' } },
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Invalid date range' })
	@ApiQuery({ name: 'startDate', description: 'YYYY-MM-DD', required: true })
	@ApiQuery({ name: 'endDate', description: 'YYYY-MM-DD', required: true })
	async getBorrowingsAnalytics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
		if (!startDate || !endDate) {
			throw new BadRequestException('startDate and endDate required');
		}
		return this.reports.getBorrowingReport(startDate, endDate);
	}

	@Get('analytics/export')
	@ApiOperation({ summary: 'Export borrowing report as CSV or XLSX' })
	@ApiQuery({ name: 'startDate', required: true })
	@ApiQuery({ name: 'endDate', required: true })
	@ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
	async exportBorrowingsAnalytics(
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
		@Query('format') format: 'csv' | 'xlsx' = 'csv',
		@Res() res: Response
	) {
		if (!startDate || !endDate) {
			throw new BadRequestException('startDate and endDate required');
		}
		const buffer = await this.reports.exportBorrowingReport(startDate, endDate, format);
		const ext = format === 'xlsx' ? 'xlsx' : 'csv';
		res.status(HttpStatus.OK)
			.header('Content-Disposition', `attachment; filename="borrowing-report-${startDate}-to-${endDate}.${ext}"`)
			.header(
				'Content-Type',
				format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv'
			)
			.send(buffer);
	}

	@Get('overdue-last-month')
	@ApiOperation({ summary: "Export last month's overdue borrowings" })
	@ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
	async exportOverdueLastMonth(@Query('format') format: 'csv' | 'xlsx' = 'csv', @Res() res: Response) {
		const buffer = await this.reports.exportLastMonthOverdue(format);
		const ext = format === 'xlsx' ? 'xlsx' : 'csv';
		const filename = `overdue-last-month.${ext}`;

		res.status(HttpStatus.OK)
			.header('Content-Disposition', `attachment; filename="${filename}"`)
			.header(
				'Content-Type',
				format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv'
			)
			.send(buffer);
	}

	@Get('last-month')
	@ApiOperation({ summary: 'Export all borrowings of the last month' })
	@ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
	async exportLastMonthBorrowings(@Query('format') format: 'csv' | 'xlsx' = 'csv', @Res() res: Response) {
		const buffer = await this.reports.exportLastMonthBorrowings(format);
		const ext = format === 'xlsx' ? 'xlsx' : 'csv';
		const filename = `last-month-borrowings.${ext}`;

		res.status(HttpStatus.OK)
			.header('Content-Disposition', `attachment; filename="${filename}"`)
			.header(
				'Content-Type',
				format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv'
			)
			.send(buffer);
	}
}
