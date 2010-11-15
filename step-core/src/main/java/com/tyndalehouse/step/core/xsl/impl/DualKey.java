package com.tyndalehouse.step.core.xsl.impl;

import static java.lang.String.format;

/**
 * A Strong Morph Map takes two keys, and gives one word back. The following DualKey relies on hashCode. The hash
 * function relies on toString so T and S need to have fast toString().
 * 
 * @author Chris
 * 
 */
public class DualKey<T, S> {
    private final T t;
    private final S s;

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
        return (this.t.toString().concat(this.s.toString())).hashCode();
    }

    @Override
    public String toString() {
        return format("%s-%s", this.t, this.s);
    }
}
