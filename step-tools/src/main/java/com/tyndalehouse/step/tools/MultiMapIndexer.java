package com.tyndalehouse.step.tools;

/**
 * The Interface MultiMapIndexerCondition.
 * 
 * @param <T> the generic type
 */
public interface MultiMapIndexer<K, T> {
    K getKey(T t);
}
