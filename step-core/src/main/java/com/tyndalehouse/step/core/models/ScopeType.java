package com.tyndalehouse.step.core.models;

/**
 * @author chrisburrell
 */
public enum ScopeType {
    /** original words/strongs */
    CHAPTER,
    /** expands one chapter either-side */
    NEAR_BY_CHAPTER,
    /** expands to whole book stats */
    BOOK,
    /** The particular passage that was keyed in */
    PASSAGE
}
