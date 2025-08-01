// timeout.interceptor.spec.ts

import { CallHandler, ExecutionContext, RequestTimeoutException } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Constants } from '../utils/constants';
import { TimeoutInterceptor } from './timeout.interceptor';

describe('TimeoutInterceptor', () => {
	let interceptor: TimeoutInterceptor;
	let context: ExecutionContext;
	let next: CallHandler;

	beforeEach(() => {
		interceptor = new TimeoutInterceptor();
		context = {} as ExecutionContext;
		// ensure real timers by default
		jest.useRealTimers();
	});

	it('should pass through the value when no timeout occurs', async () => {
		next = { handle: () => of('ok') };

		const result = await lastValueFrom(interceptor.intercept(context, next));
		expect(result).toBe('ok');
	});

	it('should throw RequestTimeoutException when the handler takes too long', async () => {
		// switch to fake timers
		jest.useFakeTimers();

		// simulate a response that only emits after REQUEST_TIMEOUT + 100ms
		next = { handle: () => of('late').pipe(delay(Constants.REQUEST_TIMEOUT + 100)) };

		const obs$ = interceptor.intercept(context, next);
		const promise = lastValueFrom(obs$);

		// advance just past the timeout threshold
		jest.advanceTimersByTime(Constants.REQUEST_TIMEOUT + 1);

		await expect(promise).rejects.toBeInstanceOf(RequestTimeoutException);

		// restore real timers for subsequent tests
		jest.useRealTimers();
	});

	it('should re-throw non-timeout errors unchanged', async () => {
		const customError = new Error('boom');
		next = { handle: () => throwError(() => customError) };

		await expect(lastValueFrom(interceptor.intercept(context, next))).rejects.toBe(customError);
	});
});
