package com.tyndalehouse.step.core.utils.language.transliteration;

import java.util.List;

public interface TransliterationRule {
    /**
     * @param prefixes a list of existing prefixes to append to
     * @param word the word that is being examined
     * @param position our current position
     */
    void expand(List<TransliterationOption> prefixes, char[] word, int position);
}
