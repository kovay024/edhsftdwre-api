import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

type FibonacciResult = BadRequestException | string;

@Injectable()
export class FibonacciService {
  private readonly logger = new Logger(FibonacciService.name);
  private readonly fibonacciSchema = z.coerce.number();
  private readonly fibonacciCache: Map<string, FibonacciResult> = new Map();

  constructor() {
    this.fibonacciCache.set('0', '0');
    this.fibonacciCache.set('1', '1');
  }

  async getFibonacci(number: string) {
    let result = this.getFibonacciFromCache(number);

    if (result !== null) {
      return {
        result,
      };
    }

    const numericResult = this.fibonacciSchema.safeParse(number);

    if (!numericResult.success) {
      const exception = new BadRequestException('Invalid number');
      this.logger.log('Storing exception in cache');
      this.fibonacciCache.set(number, exception);

      throw exception;
    }

    result = this.calculateFibonacciNumber(numericResult.data);

    return {
      result,
    };
  }

  private calculateFibonacciNumber(n: number) {
    const cachedResult = this.getFibonacciFromCache(n.toString());

    if (cachedResult !== null) {
      return cachedResult;
    }

    if (n <= 1) {
      return n;
    }

    const a = this.calculateFibonacciNumber(n - 1);
    const b = this.calculateFibonacciNumber(n - 2);

    const result = a + b;
    this.logger.log(`Caching Fibonacci number for ${n}`);
    this.fibonacciCache.set(n.toString(), result.toString());

    return result;
  }

  private getFibonacciFromCache(n: string) {
    if (this.fibonacciCache.has(n)) {
      this.logger.log(`Cache hit for ${n}`);
      const result = this.fibonacciCache.get(n);

      if (typeof result === 'string') {
        return parseInt(result);
      }

      this.logger.log('Cache hit with exception');
      throw result;
    }

    this.logger.log(`Cache miss for ${n}`);

    return null;
  }
}
