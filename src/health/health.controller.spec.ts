import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
	let controller: HealthController;
	let healthService: HealthCheckService;
	let dbHealthIndicator: TypeOrmHealthIndicator;

	beforeEach(async () => {
		const mockHealthCheckService = {
			check: jest.fn().mockImplementation(async (checks) => {
				// Execute all check functions passed to health.check()
				for (const check of checks) {
					await check();
				}
				return {
					status: 'ok',
					database: { status: 'up' },
				};
			}),
		};

		const mockTypeOrmHealthIndicator = {
			pingCheck: jest.fn().mockResolvedValue({
				database: { status: 'up' },
			}),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
			providers: [
				{
					provide: HealthCheckService,
					useValue: mockHealthCheckService,
				},
				{
					provide: TypeOrmHealthIndicator,
					useValue: mockTypeOrmHealthIndicator,
				},
			],
		}).compile();

		controller = module.get<HealthController>(HealthController);
		healthService = module.get<HealthCheckService>(HealthCheckService);
		dbHealthIndicator = module.get<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('check', () => {
		it('should return health check result', async () => {
			const result = await controller.check();

			expect(healthService.check).toHaveBeenCalled();
			expect(result).toEqual({
				status: 'ok',
				database: { status: 'up' },
			});
		});

		it('should call database ping check', async () => {
			await controller.check();

			expect(dbHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
		});
	});
});
