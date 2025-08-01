// src/modules/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { createObjectCsvStringifier } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import { BorrowingsRepository } from '../borrowings/borrowings.repository';

@Injectable()
export class ReportsService {
	constructor(private readonly borrowingsRepo: BorrowingsRepository) {}

	/** Compute analytics */
	async getBorrowingReport(start: string, end: string) {
		// raw records
		const records = await this.borrowingsRepo.findInPeriod(start, end);

		const totalBorrowed = records.length;
		const totalReturned = records.filter((r) => r.returnDate && r.returnDate <= end).length;
		const totalOverdue = records.filter(
			(r) => !r.returnDate && r.dueDate < new Date().toISOString().slice(0, 10)
		).length;

		// daily counts
		const byDate = records.reduce(
			(acc, r) => {
				const d = r.borrowDate;
				acc[d] = (acc[d] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);
		const daily = Object.entries(byDate).map(([date, count]) => ({ date, count }));

		// top books
		const topBooks = Object.entries(
			records.reduce(
				(m, r) => {
					m[r.book.title] = (m[r.book.title] || 0) + 1;
					return m;
				},
				{} as Record<string, number>
			)
		)
			.map(([title, count]) => ({ title, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		// top borrowers
		const topBorrowers = Object.entries(
			records.reduce(
				(m, r) => {
					m[r.borrower.name] = (m[r.borrower.name] || 0) + 1;
					return m;
				},
				{} as Record<string, number>
			)
		)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		return { totalBorrowed, totalReturned, totalOverdue, daily, topBooks, topBorrowers };
	}

	/** Export borrowing report as CSV or XLSX */
	async exportBorrowingReport(start: string, end: string, format: 'csv' | 'xlsx'): Promise<Buffer> {
		const report = await this.getBorrowingReport(start, end);

		// 1. CSV
		if (format === 'csv') {
			const csv = createObjectCsvStringifier({
				header: [
					{ id: 'metric', title: 'Metric' },
					{ id: 'value', title: 'Value' },
				],
			});
			// build rows for summary metrics
			const rows = [
				{ metric: 'Total Borrowed', value: report.totalBorrowed },
				{ metric: 'Total Returned', value: report.totalReturned },
				{ metric: 'Total Overdue', value: report.totalOverdue },
			];
			let content = csv.getHeaderString() + csv.stringifyRecords(rows);

			// For brevity, you could append other sections similarly
			return Buffer.from(content, 'utf8');
		}

		// 2. XLSX
		const wb = new ExcelJS.Workbook();
		// Summary sheet
		const s1 = wb.addWorksheet('Summary');
		s1.addRow(['Metric', 'Value']);
		s1.addRow(['Total Borrowed', report.totalBorrowed]);
		s1.addRow(['Total Returned', report.totalReturned]);
		s1.addRow(['Total Overdue', report.totalOverdue]);

		// Daily sheet
		const s2 = wb.addWorksheet('Daily');
		s2.addRow(['Date', 'Borrow Count']);
		report.daily.forEach((r) => s2.addRow([r.date, r.count]));

		// TopBooks sheet
		const s3 = wb.addWorksheet('Top Books');
		s3.addRow(['Book Title', 'Count']);
		report.topBooks.forEach((b) => s3.addRow([b.title, b.count]));

		// TopBorrowers sheet
		const s4 = wb.addWorksheet('Top Borrowers');
		s4.addRow(['Borrower', 'Count']);
		report.topBorrowers.forEach((b) => s4.addRow([b.name, b.count]));

		const arrayBuffer = await wb.xlsx.writeBuffer();
		return Buffer.from(arrayBuffer);
	}

	/**
	 * Export last month's overdue borrowings
	 */
	async exportLastMonthOverdue(format: 'csv' | 'xlsx'): Promise<Buffer> {
		// 1) Determine last month range
		const today = new Date();
		const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const lastMonthEnd = new Date(firstOfThisMonth.getTime() - 1);
		const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);

		// 2) Query records
		const records = await this.borrowingsRepo.findOverdueInPeriod(
			lastMonthStart.toISOString().slice(0, 10),
			lastMonthEnd.toISOString().slice(0, 10)
		);

		// 3) Map to plain objects
		const rows = records.map((b) => ({
			id: b.id,
			bookTitle: b.book.title,
			borrowerName: b.borrower.name,
			borrowDate: b.borrowDate,
			dueDate: b.dueDate,
			returnDate: b.returnDate ?? '',
		}));

		if (format === 'csv') {
			const csvStringifier = createObjectCsvStringifier({
				header: [
					{ id: 'id', title: 'ID' },
					{ id: 'bookTitle', title: 'Book Title' },
					{ id: 'borrowerName', title: 'Borrower' },
					{ id: 'borrowDate', title: 'Borrow Date' },
					{ id: 'dueDate', title: 'Due Date' },
					{ id: 'returnDate', title: 'Return Date' },
				],
			});
			const header = csvStringifier.getHeaderString();
			const content = csvStringifier.stringifyRecords(rows);
			return Buffer.from(header + content, 'utf8');
		} else {
			const workbook = new ExcelJS.Workbook();
			const sheet = workbook.addWorksheet('Overdue Last Month');
			sheet.addRow(['ID', 'Book Title', 'Borrower', 'Borrow Date', 'Due Date', 'Return Date']);
			rows.forEach((r) =>
				sheet.addRow([r.id, r.bookTitle, r.borrowerName, r.borrowDate, r.dueDate, r.returnDate])
			);
			sheet.columns.forEach((col) => {
				let max = 10;
				col.eachCell({ includeEmpty: true }, (cell) => {
					const len = cell.value?.toString().length ?? 0;
					if (len > max) max = len;
				});
				col.width = max + 2;
			});
			const arrayBuffer = await workbook.xlsx.writeBuffer();
			return Buffer.from(arrayBuffer);
		}
	}

	/**
	 * Export last month's borrowings
	 */
	async exportLastMonthBorrowings(format: 'csv' | 'xlsx'): Promise<Buffer> {
		const today = new Date();
		const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const lastMonthEnd = new Date(firstOfThisMonth.getTime() - 1);
		const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);

		const records = await this.borrowingsRepo.findInPeriod(
			lastMonthStart.toISOString().slice(0, 10),
			lastMonthEnd.toISOString().slice(0, 10)
		);

		if (format === 'csv') {
			const csvStringifier = createObjectCsvStringifier({
				header: [
					{ id: 'id', title: 'ID' },
					{ id: 'bookTitle', title: 'Book Title' },
					{ id: 'borrowerName', title: 'Borrower' },
					{ id: 'borrowDate', title: 'Borrow Date' },
					{ id: 'dueDate', title: 'Due Date' },
					{ id: 'returnDate', title: 'Return Date' },
				],
			});
			const rows = records.map((r) => ({
				id: r.id,
				bookTitle: r.book.title,
				borrowerName: r.borrower.name,
				borrowDate: r.borrowDate,
				dueDate: r.dueDate,
				returnDate: r.returnDate ?? '',
			}));

			const header = csvStringifier.getHeaderString();
			const content = csvStringifier.stringifyRecords(rows);
			return Buffer.from(header + content, 'utf8');
		} else {
			const workbook = new ExcelJS.Workbook();
			const sheet = workbook.addWorksheet('Last Month Borrowings');
			sheet.addRow(['ID', 'Book Title', 'Borrower', 'Borrow Date', 'Due Date', 'Return Date']);
			records.forEach((r) =>
				sheet.addRow([r.id, r.book.title, r.borrower.name, r.borrowDate, r.dueDate, r.returnDate ?? ''])
			);
			sheet.columns.forEach((col) => {
				let max = 10;
				col.eachCell({ includeEmpty: true }, (cell) => {
					const len = cell.value?.toString().length ?? 0;
					if (len > max) max = len;
				});
				col.width = max + 2;
			});
			const arrayBuffer = await workbook.xlsx.writeBuffer();
			return Buffer.from(arrayBuffer);
		}
	}
}
