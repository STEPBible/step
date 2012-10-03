package com.tyndalehouse.step.core.utils.hebrew;

/**
 * A collection of enums to identify properties of the letter
 * 
 * @author chrisburrell
 * 
 */
public class HebrewLetter {
    private HebrewLetterType hebrewLetterType = null;
    private SoundingType soundingType = null;
    private ConsonantType consonantType = null;
    private VowelStressType vowelStressType = null;
    private VowelLengthType vowelLengthType = null;
    private final char c;

    /**
     * The character it is representing
     * 
     * @param c the character
     */
    public HebrewLetter(final char c) {
        this.c = c;
    }

    /**
     * @return the hebrewLetterType
     */
    public HebrewLetterType getHebrewLetterType() {
        return this.hebrewLetterType;
    }

    /**
     * @param hebrewLetterType the hebrewLetterType to set
     */
    public void setHebrewLetterType(final HebrewLetterType hebrewLetterType) {
        this.hebrewLetterType = hebrewLetterType;
    }

    /**
     * @return the soundingType
     */
    public SoundingType getSoundingType() {
        return this.soundingType;
    }

    /**
     * @param soundingType the soundingType to set
     */
    public void setSoundingType(final SoundingType soundingType) {
        this.soundingType = soundingType;
    }

    /**
     * @return the consonantType
     */
    public ConsonantType getConsonantType() {
        return this.consonantType;
    }

    /**
     * @param consonantType the consonantType to set
     */
    public void setConsonantType(final ConsonantType consonantType) {
        this.consonantType = consonantType;
    }

    /**
     * @return the vowelStressType
     */
    public VowelStressType getVowelStressType() {
        return this.vowelStressType;
    }

    /**
     * @param vowelStressType the vowelStressType to set
     */
    public void setVowelStressType(final VowelStressType vowelStressType) {
        this.vowelStressType = vowelStressType;
    }

    /**
     * @return the vowelLengthType
     */
    public VowelLengthType getVowelLengthType() {
        return this.vowelLengthType;
    }

    /**
     * @param vowelLengthType the vowelLengthType to set
     */
    public void setVowelLengthType(final VowelLengthType vowelLengthType) {
        this.vowelLengthType = vowelLengthType;
    }

    /**
     * @return the c
     */
    public char getC() {
        return this.c;
    }

}
