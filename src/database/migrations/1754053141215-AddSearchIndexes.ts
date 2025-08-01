import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSearchIndexes1754053141215 implements MigrationInterface {
	name = 'AddSearchIndexes1754053141215';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "borrowing" DROP CONSTRAINT "FK_5a5ead47aacc96376e7ab0d1a62"`);
		await queryRunner.query(`ALTER TABLE "borrowing" DROP CONSTRAINT "FK_02cd4db74be6088b8e61b847d98"`);
		await queryRunner.query(`ALTER TABLE "borrowing" ALTER COLUMN "book_id" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "borrowing" ALTER COLUMN "borrower_id" DROP NOT NULL`);
		await queryRunner.query(`CREATE INDEX "IDX_c10a44a29ef231062f22b1b7ac" ON "book" ("title") `);
		await queryRunner.query(`CREATE INDEX "IDX_85c8d63d50f8e617e2a4917671" ON "book" ("author") `);
		await queryRunner.query(`CREATE INDEX "IDX_8590cbc74a950d25f29dd20d1f" ON "borrower" ("name") `);
		await queryRunner.query(
			`ALTER TABLE "borrowing" ADD CONSTRAINT "FK_5a5ead47aacc96376e7ab0d1a62" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "borrowing" ADD CONSTRAINT "FK_02cd4db74be6088b8e61b847d98" FOREIGN KEY ("borrower_id") REFERENCES "borrower"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "borrowing" DROP CONSTRAINT "FK_02cd4db74be6088b8e61b847d98"`);
		await queryRunner.query(`ALTER TABLE "borrowing" DROP CONSTRAINT "FK_5a5ead47aacc96376e7ab0d1a62"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_8590cbc74a950d25f29dd20d1f"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_85c8d63d50f8e617e2a4917671"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_c10a44a29ef231062f22b1b7ac"`);
		await queryRunner.query(`ALTER TABLE "borrowing" ALTER COLUMN "borrower_id" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "borrowing" ALTER COLUMN "book_id" SET NOT NULL`);
		await queryRunner.query(
			`ALTER TABLE "borrowing" ADD CONSTRAINT "FK_02cd4db74be6088b8e61b847d98" FOREIGN KEY ("borrower_id") REFERENCES "borrower"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "borrowing" ADD CONSTRAINT "FK_5a5ead47aacc96376e7ab0d1a62" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
		);
	}
}
