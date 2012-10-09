package com.tyndalehouse.step.core.data.filters;

import java.io.IOException;

import org.apache.lucene.analysis.TokenFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.TermAttribute;

/**
 * Cleans up transliterations by removing any extra character
 * 
 * @author chrisburrell
 * 
 */
public class TransliterationCleaningFilter extends TokenFilter {
    private final TermAttribute termAtt;

    /**
     * @param input the token stream
     */
    public TransliterationCleaningFilter(final TokenStream input) {
        super(input);
        this.termAtt = addAttribute(TermAttribute.class);
    }

    @Override
    public boolean incrementToken() throws IOException {
        if (this.input.incrementToken()) {
            final char[] buffer = this.termAtt.termBuffer();

            final StringBuilder buf = new StringBuilder(buffer.length);

            char lastChar = 0x0;
            for (int i = 0; i < this.termAtt.termLength(); i++) {
                // skip two characters in a row
                final char currentChar = buffer[i];
                if (lastChar == currentChar) {
                    continue;
                }
                lastChar = currentChar;

                // caters for the beta code as well
                switch (currentChar) {
                    case '-':
                    case '*':
                    case '\'':
                        break;
                    default:
                        buf.append(buffer[i]);
                }
            }

            if (buf.length() != buffer.length) {
                final char[] output = new char[buf.length()];
                buf.getChars(0, buf.length(), output, 0);
                this.termAtt.setTermBuffer(output, 0, output.length);
            }
            return true;
        } else {
            return false;
        }
    }
}
