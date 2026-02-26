/**
 * Utility for 2-decimal fixed-point arithmetic.
 * Stores values as integers (cents) internally to avoid floating-point issues.
 */
export class Decimal2 {
    private cents: number;

    constructor(value: number) {
        this.cents = Math.round(value * 100);
    }

    public static from(value: number): Decimal2 {
        return new Decimal2(value);
    }

    public toNumber(): number {
        return this.cents / 100;
    }

    public add(other: Decimal2): Decimal2 {
        const result = new Decimal2(0);
        result.cents = this.cents + other.cents;
        return result;
    }

    public subtract(other: Decimal2): Decimal2 {
        const result = new Decimal2(0);
        result.cents = this.cents - other.cents;
        return result;
    }

    public toString(): string {
        return this.toNumber().toFixed(2);
    }
}
