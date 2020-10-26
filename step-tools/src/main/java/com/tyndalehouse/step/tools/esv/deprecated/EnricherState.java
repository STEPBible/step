package com.tyndalehouse.step.tools.esv.deprecated;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

import java.util.Deque;
import java.util.Map;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.utils.StringUtils;

public class EnricherState {
    private static final Pattern BY_STRONG = Pattern.compile("\\|");
    private static final boolean ADD_TAG = true;
    private static final Logger LOGGER = LoggerFactory.getLogger(EnricherState.class);
    private final Map<String, Deque<Word>> verseContent;
    private String currentVerse;
    private Deque<Word> q;
    private Word w;
    private String[] wWords;
    private int wWordsII;
    private String previousVerse;
    private final String debugVerse = null;
    private boolean openStrongTag = false;

    // private final String debugVerse = "Gen.3.16";

    public EnricherState(final Map<String, Deque<Word>> verseContent) {
        this.verseContent = verseContent;
    }

    public String match(final String text) {
        if (this.debugVerse != null && !this.debugVerse.equals(this.currentVerse)) {
            return text;
        }

        LOGGER.trace("Tracing: [{}]", text);
        try {
            if (isBlank(this.currentVerse)) {
                return text;
            }

            // if (tWords.length == 0) {
            // // no words, so exit
            // LOGGER.info("Given element with no words to match");
            // return text;
            // }

            final StringBuilder output = new StringBuilder(text.length() * 2);

            ensureOpenTagIfRequired(output);

            StringBuilder word = new StringBuilder(16);
            for (int ii = 0; ii < text.length(); ii++) {
                // get next word if required
                // move to a boolean flag, so as to warn later on?
                if (!ensureNextWord()) {
                    // no next so append the remainder
                    output.append(text.substring(ii));
                    if (isNotBlank(text) && hasAlphaNumerics(output)) {
                        LOGGER.warn(
                                "{}: Unable to continue with matching. No data left. Was hoping to match [{}]",
                                this.currentVerse, text.substring(ii));
                    }
                    return text;
                }

                final char c = text.charAt(ii);
                switch (c) {
                    case ' ':
                    case ',':
                    case '?':
                    case '[':
                    case ']':
                    case '+':
                    case '!':
                    case '.':
                    case '/':
                    case '-':
                    case ';':
                    case '\\':
                    case '"':
                    case ':':
                    case '\'':
                    case '(':
                    case ')':
                    case '—':
                        // deal with any words already in buffer
                        word = punctuationCharFound(output, word, c);
                        break;
                    default:
                        word.append(c);
                        break;
                }

            }

            // just keep the state as is with this implementation
            // if the last word matches, then we need to call wordsMatch()
            final String wordSoFar = word.toString();
            if (wordSoFar.length() == 0) {
                return output.toString();
            }

            if (isBlank(wordSoFar)) {
                output.append(wordSoFar);
                return output.toString();
            }

            ensureNextWord();

            boolean successMatch = false;
            if (doWordsMatch(wordSoFar)) {
                successMatch = true;
                wordsMatch(output, wordSoFar);
                word = new StringBuilder(16);
            } else {
                successMatch = tryNextMatch(output, wordSoFar);
                word = new StringBuilder(16);
            }

            if (!successMatch) {
                LOGGER.warn("{}:Unable to match, so simply appending word: [{}]", this.currentVerse,
                        wordSoFar);
                output.append(wordSoFar);
                word = new StringBuilder(16);
            }

            return output.toString();
        } catch (final Exception x) {
            LOGGER.error(x.getMessage(), x);
            return text;
        }
    }

    private void ensureOpenTagIfRequired(final StringBuilder output) {
        // // let's assume w is not null, for now
        // if (this.q == null) {
        // return;
        // }
        //
        // final Word peek = this.q.peek();
        // if (ADD_TAG && !this.openStrongTag && peek != null && isNotBlank(peek.getS())) {
        // // add a strong tag opening
        // openStrongTag(output, peek.getS());
        // }
    }

    private void openStrongTag(final StringBuilder output, final String codes) {
        output.append("#<#w lemma=\"");

        final StringBuilder lemma = new StringBuilder(codes.length() + 4);
        final StringBuilder morph = new StringBuilder(codes.length() + 4);
        final String[] strongs = BY_STRONG.split(codes);
        for (final String s : strongs) {
            if (lemma.length() != 0) {
                lemma.append(' ');
            }

            final int indexOfAt = s.indexOf('@');
            if (indexOfAt == -1) {
                lemma.append("strong:");
                lemma.append(s);
            } else {
                lemma.append("strong:");
                lemma.append(s.substring(0, indexOfAt));

                if (morph.length() != 0) {
                    morph.append(' ');
                }

                if (s.charAt(0) == 'H') {
                    morph.append("strongMorph:");
                } else {
                    morph.append("robinson:");
                }
                morph.append(s.substring(indexOfAt + 1));
            }
        }

        output.append(lemma.toString());
        output.append("\"");

        if (morph.length() > 0) {
            output.append(" morph=\"");
            output.append(morph.toString());
            output.append("\"");
        }
        output.append("#>#");
        this.openStrongTag = true;
    }

    private boolean tryNextMatch(final StringBuilder output, final String wordSoFar) {
        boolean successMatch = false;
        // LOGGER.warn("Words do not match [{}] <> [{}]", wordSoFar, this.wWords[this.wWordsII]);
        // since words don't match, let's try the next word
        if (this.wWordsII + 1 < this.wWords.length
                && wordSoFar.equalsIgnoreCase(this.wWords[this.wWordsII + 1])) {
            LOGGER.warn("Advancing to next word as it matches");
            successMatch = true;
            this.wWordsII++;
            wordsMatch(output, wordSoFar);
        } else if (this.wWordsII + 1 >= this.wWords.length) {
            final Word nextWord = this.q.peek();

            if (nextWord == null || nextWord.getW() == null) {
                // no words left, so definitely no match
            } else {
                final String[] nextWords = getWordsFromWord(nextWord);
                if (nextWords.length > 0 && wordSoFar.equalsIgnoreCase(nextWords[0])) {
                    LOGGER.warn("Advancing to next word as it matches");
                    successMatch = true;
                    getNextWord(this.currentVerse);
                    wordsMatch(output, wordSoFar);
                }
            }
        }
        return successMatch;
    }

    private boolean hasAlphaNumerics(final StringBuilder output) {
        for (int ii = 0; ii < output.length(); ii++) {
            if (Character.isLetterOrDigit(output.charAt(ii))) {
                return true;
            }
        }
        return false;
    }

    private boolean ensureNextWord() {
        if (this.wWordsII >= this.wWords.length) {
            if (!this.getNextWord(this.currentVerse)) {
                // no words left to match
                return false;
            }
        }
        return true;
    }

    private StringBuilder punctuationCharFound(final StringBuilder output, StringBuilder word, final char c) {
        final String wordSoFar = word.toString();
        if (wordSoFar.length() == 0) { // do nothing

        } else if (isBlank(wordSoFar)) {
            output.append(wordSoFar);
            word = new StringBuilder(16);
        } else if (doWordsMatch(wordSoFar)) {
            wordsMatch(output, wordSoFar);
            word = new StringBuilder(16);
        } else {
            if (!tryNextMatch(output, wordSoFar)) {
                LOGGER.warn("[{}]: Next word [{}] in matching files does not match tagged data [{}]",
                        (Object[]) new String[] { this.currentVerse, wordSoFar, this.wWords[this.wWordsII] });
                output.append(wordSoFar);
                word = new StringBuilder(16);
            } else {
                // match was possible, so reset the word
                word = new StringBuilder(16);
            }
        }

        // output.append(word.toString());
        output.append(c);
        return word;
    }

    private boolean doWordsMatch(final String wordSoFar) {
        return wordSoFar.equalsIgnoreCase(this.wWords[this.wWordsII]);
    }

    private void wordsMatch(final StringBuilder output, final String wordSoFar) {
        // munch both words and continue
        if (this.debugVerse != null) {
            LOGGER.debug("wWord: i={} s={}/ q={}, matched words from both files [{}]", new Object[] {
                    this.wWordsII, this.wWords.length, this.q.size(), this.wWords[this.wWordsII] });
        } else {
            LOGGER.trace("Matching word {}={}", wordSoFar, this.wWords[this.wWordsII]);
        }

        this.wWordsII++;

        if (ADD_TAG && isNotBlank(this.w.getS()) && this.openStrongTag == false) {
            openStrongTag(output, this.w.getS());
        }

        output.append(wordSoFar);

        if (ADD_TAG && isNotBlank(this.w.getS())) {
            output.append("#<#/w#>#");
            // output.append(this.w.getS());
            // output.append("###");
            this.openStrongTag = false;
        }
    }

    /**
     * @param currentVerse the currentVerse to set
     */
    public void setCurrentVerse(final String currentVerse) {
        try {
            if (isBlank(currentVerse)) {
                // end of vere
                this.previousVerse = this.currentVerse;
                this.currentVerse = null;
                return;
            }

            // warn if we're moving to another verse
            if ((this.wWords != null && this.wWordsII < this.wWords.length)
                    || (this.q != null && this.q.size() > 0)) {

                // warn if debugging a particular verse
                if (this.debugVerse == null) {
                    LOGGER.warn("{}: Left over bits in matching file.", this.previousVerse);
                }
            }

            if (!getNextWord(currentVerse)) {
                LOGGER.warn("{}: No data available for verse", currentVerse);
                this.currentVerse = null;
            } else {
                this.currentVerse = currentVerse;
            }
        } catch (final Exception x) {
            LOGGER.error(x.getMessage(), x);
        }
    }

    private boolean getNextWord(final String currentVerse) {
        this.q = this.verseContent.get(currentVerse);

        if (this.q == null) {
            LOGGER.warn("{}: No data available in tagging file", currentVerse);
            return false;
        }

        this.w = this.q.poll();
        if (this.w == null) {
            return false;
        }

        this.wWordsII = 0;
        this.wWords = getWordsFromWord(this.w);
        return true;
    }

    private String[] getWordsFromWord(final Word w) {
        return StringUtils.split(EsvOsisEnricher.reduce(w.getW()));
    }

    public int getNextSpace(final String w, final int lastIndex) {
        final int space = w.indexOf(' ', lastIndex + 1);

        if (space != -1) {
            return space;
        } else {
            LOGGER.warn("Attempting to retrieve empty word");
            return w.length();
        }
    }

    public boolean isVerse() {
        return this.currentVerse != null;
    }
}
