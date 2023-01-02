package com.tyndalehouse.step.core.xsl.impl;

import static java.lang.String.format;

/**
 * A Strong Morph Map takes two keys, and gives one word back. The following DualKey relies on hashCode. The
 * hash function relies on toString so T and S need to have fast toString().
 * 
 * @param <T> the first part of the key
 * @param <S> the second part of the key
 * @author chrisburrell
 * 
 */
public class DualKey<T, S> {
    private final T t;
    private final S s;

    /**
     * creates a composite key
     * 
     * @param t the first part of the key
     * @param s the second part of the key
     */
    public DualKey(final T t, final S s) {
        this.t = t;
        this.s = s;
    }

    @Override
    public boolean equals(final Object obj) {
        if (obj == this) {
            return true;
        }

        if (!(obj instanceof DualKey)) {
            return false;
        }

        final DualKey<?, ?> k = (DualKey<?, ?>) obj;
        return this.t.equals(k.t) && this.s.equals(k.s);
    }

    @Override
    public int hashCode() {
        // we need to return the same hashcode based on s and t
        if (this.s == null && this.t == null) {
            return super.hashCode();
        }

        if (this.s == null) {
            return this.t.hashCode();
        }

        if (this.t == null) {
            return this.s.hashCode();
        }

        return this.t.toString().concat(this.s.toString()).hashCode();
    }

    @Override
    public String toString() {
        return format("%s-%s", this.t, this.s);
    }
}
