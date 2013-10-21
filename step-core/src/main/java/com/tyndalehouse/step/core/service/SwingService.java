package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.BibleInstaller;

/**
 * @author chrisburrell
 */
public interface SwingService {
    /**
     * Adds a directory installer
     * @return the index of the new installer
     */
    BibleInstaller addDirectoryInstaller();
}
