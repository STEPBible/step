/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
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
