package com.tyndalehouse.step.core.data.processors;

import java.util.List;
import java.util.Locale;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Fieldable;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.create.PostProcessor;

/**
 * Cleanses strings in descriptions
 * 
 * @author chrisburrell
 * 
 */
@SuppressWarnings("PMD")
public class MorphologyProcessor implements PostProcessor {
    private static final char SPACE_SEPARATOR = ' ';

    @Override
    public void process(final EntityConfiguration config, final Document doc) {
        cleanUp(config, doc);
        renderHtmlFragments(config, doc);
    }

    /**
     * Initialises the inline html
     * 
     * @param config the entity configuration
     * @param doc document
     */
    private void renderHtmlFragments(final EntityConfiguration config, final Document doc) {
        // initialise css
        initialiseCssClasses(config, doc);

        boolean openBracket = false;

        // now we can initialise the inline html
        final StringBuilder html = new StringBuilder(128);
        html.append("<span onclick='javascript:showDef(this)' ");
        html.append("title='");

        final String function = doc.get("function");
        final String functionNotes = getFunctionNotes(function);
        if (function != null && functionNotes != null) {
            html.append(functionNotes);
            html.append(SPACE_SEPARATOR);
        }

        renderMood(doc, html);

        appendNonNullSpacedItem(html, doc.get("gender"));
        appendNonNullSpacedItem(html, doc.get("number"));

        openBracket = renderTense(doc, openBracket, html);
        openBracket = renderCase(doc, openBracket, html);

        closeBracket(openBracket, html);

        html.append("' class='");
        html.append(doc.get("cssClasses"));
        html.append("'>");

        renderParticiple(doc, html, function);

        html.append("</span>");
        doc.add(config.getField("inlineHtml", html.toString()));
    }

    /**
     * Rends HTML for the participle
     * 
     * @param doc the document from Lucene
     * @param html the HTML builder
     * @param function the function within this document
     */
    private void renderParticiple(final Document doc, final StringBuilder html, final String function) {
        if ("Participle".equals(doc.get("mood"))) {
            html.append("Participle");
        } else {
            html.append(getShortFunction(function));
        }
    }

    /**
     * Renders HTML for the word case
     * 
     * @param doc the document from Lucene
     * @param openBracket whether there is an open bracket
     * @param html the HTML builder
     * @return true if a bracket has been opened
     */
    private boolean renderCase(final Document doc, final boolean openBracket, final StringBuilder html) {
        boolean originalOpenBracket = openBracket;
        final String wordCase = doc.get("case");
        if (wordCase != null) {
            originalOpenBracket = openBracket(originalOpenBracket, html);
            html.append(wordCase);
            html.append(SPACE_SEPARATOR);
        }
        return originalOpenBracket;
    }

    /**
     * Renders HTML for the tense
     * 
     * @param doc the document from Lucene
     * @param openBracket whether there is an open bracket
     * @param html the HTML builder
     * @return true if a bracket has been opened
     */
    private boolean renderTense(final Document doc, final boolean openBracket, final StringBuilder html) {
        boolean originalOpenBracket = openBracket;

        final String tense = doc.get("tense");
        if (tense != null) {
            originalOpenBracket = openBracket(originalOpenBracket, html);
            html.append(tense);
            html.append(SPACE_SEPARATOR);

            final String tenseNotes = getTenseNotes(tense);
            if (tenseNotes != null) {
                html.append(tenseNotes);
                html.append(SPACE_SEPARATOR);
            }
        }
        return originalOpenBracket;
    }

    /**
     * Renders HTML for the mood
     * 
     * @param doc the document from Lucene
     * @param html the HTML builder
     */
    private void renderMood(final Document doc, final StringBuilder html) {
        final String mood = doc.get("mood");
        if ("Infinitive".equals(mood)) {
            html.append(mood);
            html.append(SPACE_SEPARATOR);
        }
    }

    /**
     * 
     * @param tense the tense in question
     * @return if indeclinable, returns indeclinable
     */
    private String getTenseNotes(final String tense) {
        if ("Indeclinable Numeral".equals(tense)) {
            return "Indeclinable";
        }

        return null;
    }

    /**
     * @param function the function of the word
     * @return For pronouns, returns 'Pronoun', otherwise the function
     */
    @SuppressWarnings("PMD")
    // CHECKSTYLE:OFF
    private String getShortFunction(final String function) {
        if ("Correlative pronoun".equals(function) || "Demonstrative pronoun".equals(function)
                || "Indeclinable Noun of Other type".equals(function)
                || "Indeclinable PRoper Noun".equals(function) || "Indefinite pronoun".equals(function)
                || "Personal pronoun".equals(function) || "Posessive pronoun".equals(function)
                || "Reciprocal pronoun".equals(function) || "Reflexive pronoun".equals(function)
                || "Relative pronoun".equals(function)) {
            return "Pronoun";
        }
        return function;
    }

    // CHECKSTYLE:ON

    /**
     * @param function the function
     * @return comments about the function
     */
    @SuppressWarnings("PMD")
    private String getFunctionNotes(final String function) {
        if ("Correlative pronoun".equals(function)) {
            return "Correlative pronoun";
        }

        if ("Demonstrative pronoun".equals(function)) {
            return "Demonstrative pronoun";
        }

        if ("Indeclinable Noun of Other type".equals(function)) {
            return "Indeclinable noun";
        }

        if ("Indeclinable PRoper Noun".equals(function)) {
            return "Indeclinable proper noun";
        }

        if ("Indefinite pronoun".equals(function)) {
            return "Indefinite pronoun";
        }

        if ("Personal pronoun".equals(function)) {
            return "Personal pronoun";
        }

        if ("Posessive pronoun".equals(function)) {
            return "Posessive pronoun";
        }

        if ("Reciprocal pronoun".equals(function)) {
            return "Reciprocal pronoun";
        }

        if ("Reflexive pronoun".equals(function)) {
            return "Reflexive pronoun";
        }

        if ("Relative pronoun".equals(function)) {
            return "Relative pronoun";
        }

        return null;
    }

    /**
     * closes the bracket
     * 
     * @param openBracket indicates whether it was opened in the first place
     * @param html the html being built up
     */
    private void closeBracket(final boolean openBracket, final StringBuilder html) {
        if (openBracket) {
            // trim last space off
            if (html.charAt(html.length() - 1) == ' ') {
                html.deleteCharAt(html.length() - 1);
            }

            html.append(")");
        }
    }

    /**
     * opens a bracket safely
     * 
     * @param openBracket the open brakcet
     * @param html the html that is being built up
     * @return true to indicate the bracket has not been opened - always returns true
     */
    private boolean openBracket(final boolean openBracket, final StringBuilder html) {
        if (openBracket) {
            // append a comma
            html.append(",");
            html.append(SPACE_SEPARATOR);

            return true;
        }

        html.append("(");
        return true;
    }

    /**
     * initialises the css classes for the morphology item
     * 
     * @param config the entity configuration
     * @param doc document
     */
    private void initialiseCssClasses(final EntityConfiguration config, final Document doc) {
        final StringBuilder sb = new StringBuilder(10);
        final String number = doc.get("number");
        if (number != null) {
            sb.append(getNumberCssClass(number));
            sb.append(' ');
        }

        final String gender = doc.get("gender");
        if (gender != null) {
            sb.append(getGenderCssClass(gender));
        }

        doc.add(config.getField("cssClasses", sb.toString()));
    }

    /**
     * @param gender a given gender
     * @return its equivalent class, or a blank string
     */
    private String getGenderCssClass(final String gender) {
        if ("Feminine".equals(gender)) {
            return "fem";
        }

        if ("Masculine".equals(gender)) {
            return "mas";
        }

        if ("Neuter".equals(gender)) {
            return "neut";
        }

        return "";
    }

    /**
     * @param number a given number
     * @return its equivalent css class, or a blank string
     */
    private String getNumberCssClass(final String number) {
        if ("Singular".equals(number)) {
            return "sing";
        }

        if ("Plural".equals(number)) {
            return "plur";
        }

        return "";
    }

    /**
     * adds an item with a space afterwards if the item is not null
     * 
     * @param html the current content
     * @param item the item to add
     */
    private void appendNonNullSpacedItem(final StringBuilder html, final Object item) {
        if (item != null) {
            html.append(item);
            html.append(SPACE_SEPARATOR);
        }
    }

    /**
     * Removes all quote marks from all fields ending in explained/description
     * 
     * @param config the configuration for this entity
     * @param document the document that we are processing
     */
    private void cleanUp(final EntityConfiguration config, final Document document) {
        // need to avoid concurrent modification to the list, so we copy over the names
        final List<Fieldable> fields = document.getFields();
        final String[] fieldNames = new String[fields.size()];

        for (int j = 0; j < fields.size(); j++) {
            fieldNames[j] = fields.get(j).name();
        }

        for (final String field : fieldNames) {
            final String lowerName = field.toLowerCase(Locale.ENGLISH);
            if (lowerName.endsWith("explained") || lowerName.endsWith("description")) {
                cleanUp(config, document, field);
            }
        }
    }

    /**
     * Removes all quote marks from a single fields ending in explained/description
     * 
     * @param config the configuration for this entity
     * @param document the document that we are processing
     * @param fieldName the name of the field
     */
    private void cleanUp(final EntityConfiguration config, final Document document, final String fieldName) {
        final StringBuilder sb = new StringBuilder(document.get(fieldName));
        for (int ii = 0; ii < sb.length();) {
            if (sb.charAt(ii) == '"') {
                sb.deleteCharAt(ii);
            } else {
                ii++;
            }
        }

        document.removeField(fieldName);
        document.add(config.getField(fieldName, sb.toString()));
    }
}
