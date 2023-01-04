package com.tyndalehouse.step.core.models;

/**
 * Indicates the output required by the user, interleaving, column view or interlinear. Interleaving and
 * column views also support difference checking
 */
public enum InterlinearMode {
    /**
     * Tradition interlinear, only works for tagged texts
     */
    INTERLINEAR,
    /**
     * interleaving one or more versions with each other
     */
    INTERLEAVED,
    /**
     * Interleaving but also having the differences in each text shown
     */
    INTERLEAVED_COMPARE,
    /**
     * Column view, where each verse is lined up with the others
     */
    COLUMN,
    /**
     * Column view with compare options
     */
    COLUMN_COMPARE,
    /** no interlinear desired */
    NONE
}
