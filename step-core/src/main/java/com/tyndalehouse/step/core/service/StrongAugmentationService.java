package com.tyndalehouse.step.core.service;

/**
 * Given a strong number, we find the augmented version in order to provide more accurate definitions and context
 */
public interface StrongAugmentationService {

    void readAndLoad(final String augStrongFile, final String installFilePath);

    void loadFromSerialization(final String installFilePath);

}
