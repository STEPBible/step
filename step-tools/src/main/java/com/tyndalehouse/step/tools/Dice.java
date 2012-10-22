package com.tyndalehouse.step.tools;

import static java.lang.Math.pow;

public class Dice {

    static int[][] cache;

    public static void main(final String[] args) {
        final int n = 256;
        final int m = 26;
        final int x = 320;

        cache = new int[n + 1][x + 1];
        for (int i = 0; i < n + 1; i++) {
            for (int j = 0; j < x + 1; j++) {
                cache[i][j] = -1;
            }
        }

        final int calculate = calculate(n, m, x, 0);
        System.out.println(calculate);
        System.out.println(calculate / pow(m, n));

    }

    private static int calculate(final int n, final int m, final int x, final int count) {
        // exit early if we can't get to the result
        if (n * m < x) {
            return 0;
        }

        if (cache[n][x] != -1) {
            return cache[n][x];
        }

        if (n == 1) {
            if (x > m) {
                return 0;
            } else {
                return 1;
            }
        }

        // we recurse for each value
        int totalMatches = 0;
        for (int ii = 1; ii <= m; ii++) {
            if (x - ii >= n) {
                totalMatches += calculate(n - 1, m, x - ii, count);
            }
        }

        cache[n][x] = totalMatches;

        return count + totalMatches;
    }
}
