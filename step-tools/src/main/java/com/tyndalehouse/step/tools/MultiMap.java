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
