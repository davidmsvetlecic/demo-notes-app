import { expect, test } from "vitest";
import { calculateCost } from "../src/cost";

test.each([
    ["Lowest", 10, 4000],
    ["Middle", 100, 20000],
    ["Highest", 101, 10100],
])('%level tier', (level, storage, cost) => {
    const expectedCost = calculateCost(storage)
    expect(cost).toBe(expectedCost)
})
