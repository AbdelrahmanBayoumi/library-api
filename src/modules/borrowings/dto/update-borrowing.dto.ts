import { PartialType } from '@nestjs/mapped-types';
import { CreateBorrowingDto } from './create-borrowing.dto';

export class UpdateBorrowingDto extends PartialType(CreateBorrowingDto) {}
