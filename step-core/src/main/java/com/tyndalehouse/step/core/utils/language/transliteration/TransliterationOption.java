package com.tyndalehouse.step.core.utils.language.transliteration;

/**
 * An option in a transliteration is a String that is built up, plus the current position tracked to the
 * original word
 */
public class TransliterationOption {
    private int nextValidPosition;
    private final StringBuilder option;

    /**
     * @param nextValidPosition the next position for which we will be affected by a rule
     * @param option the option that is being stored...
     */
    public TransliterationOption(final int nextValidPosition, final StringBuilder option) {
        this.nextValidPosition = nextValidPosition;
        this.option = option;
    }

    /**
     * @return the nextValidPosition
     */
    public int getNextValidPosition() {
        return this.nextValidPosition;
    }

    /**
     * @return the option
     */
    public StringBuilder getOption() {
        return this.option;
    }

    /**
     * @param nextValidPosition the nextValidPosition to set
     */
    public void setNextValidPosition(final int nextValidPosition) {
        this.nextValidPosition = nextValidPosition;
    }

    @Override
    public int hashCode() {
        return this.option.hashCode();
    }

    @Override
    public boolean equals(final Object obj) {
        if (!(obj instanceof TransliterationOption)) {
            return false;
        }

        final TransliterationOption opt = (TransliterationOption) obj;
        return this.option.toString().equals(opt.getOption().toString());
    }

    @Override
    public String toString() {
        return this.option.toString();
    }
}
