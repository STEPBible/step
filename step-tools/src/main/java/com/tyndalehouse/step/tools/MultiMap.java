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
package com.tyndalehouse.step.tools;

import java.util.Collection;
import java.util.HashMap;

import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * The Class MultiMap.
 * 
 * @param <K> the key type
 * @param <V> the value type
 * @param <C> the generic type of the collection
 */
public class MultiMap<K, V, C extends Collection<V>> extends HashMap<K, C> {
    private static final long serialVersionUID = 1102526731843616537L;
    private final Class<?> collectionClass;

    /**
     * Instantiates a new multi map.
     * 
     * @param collectionClass the collection class
     */
    public MultiMap(final Class<?> collectionClass) {
        this.collectionClass = collectionClass;

    }

    /**
     * Put list of values using the indexer to generate the key.
     * 
     * @param values the values
     * @param indexer the indexer
     */
    public void putCollection(final Collection<V> values, final MultiMapIndexer<K, V> indexer) {
        for (final V value : values) {
            final K key = indexer.getKey(value);
            putElement(key, value);
        }
    }

    /**
     * Put element.
     * 
     * @param key the key
     * @param value the value
     */
    @SuppressWarnings("unchecked")
    public void putElement(final K key, final V value) {
        C collection = get(key);
        if (collection == null) {
            try {
                collection = (C) this.collectionClass.newInstance();
            } catch (final InstantiationException e) {
                throw new StepInternalException("Unable to create collection of type" + this.collectionClass,
                        e);
            } catch (final IllegalAccessException e) {
                throw new StepInternalException("Unable to create collection of type" + this.collectionClass,
                        e);
            }
            put(key, collection);
        }
        collection.add(value);
    }
}
