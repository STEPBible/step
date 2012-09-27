package com.tyndalehouse.step.core.data.create;

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.transliterate;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.unAccent;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebeaninternal.server.core.DefaultSqlUpdate;
import com.tyndalehouse.step.core.data.create.loaders.AbstractClasspathBasedModuleLoader;
import com.tyndalehouse.step.core.data.entities.lexicon.SpecificForm;

/**
 * Loads up all lexical forms
 * 
 * @author chrisburrell
 * 
 */
public class SpecificFormsLoader extends AbstractClasspathBasedModuleLoader<SpecificForm> {
    private static final Logger LOGGER = LoggerFactory.getLogger(LexiconLoader.class);
    private static final String INSERT_INTO_SPECIFIC_FORMS = "INSERT INTO specific_form(RAW_STRONG_NUMBER, RAW_FORM, UNACCENTED_FORM, TRANSLITERATION) VALUES";
    private static final String INSERT_LEXICON = "insert into specific_form (raw_form , unaccented_form , transliteration , raw_strong_number )"
            + "select accented_unicode, unaccented_unicode, step_transliteration, strong_number from definition where accented_unicode not in (select raw_form from specific_form)";
    private static final Pattern QUOTE_ESCAPE = Pattern.compile("'");

    /**
     * @param ebean the persistence server
     * @param resourcePath the file
     */
    public SpecificFormsLoader(final EbeanServer ebean, final String resourcePath) {
        super(ebean, resourcePath);
    }

    @Override
    protected List<SpecificForm> parseFile(final Reader reader) {
        final BufferedReader bufferedReader = new BufferedReader(reader);
        String line = null;
        StringBuilder sql = getAdjustedStringBuilder();

        int total = 0;
        int lines = 0;
        try {
            while ((line = bufferedReader.readLine()) != null) {
                parseLine(sql, line);
                lines++;

                if (lines > 10000) {
                    sql.deleteCharAt(sql.length() - 1);
                    final String query = sql.toString();
                    if (query.length() > INSERT_INTO_SPECIFIC_FORMS.length()) {
                        getEbean().execute(new DefaultSqlUpdate(query));
                        getEbean().currentTransaction().flushBatch();

                        LOGGER.debug("Created [{}] specific forms", total);
                        sql = getAdjustedStringBuilder();
                        total += lines;
                        lines = 0;
                    }
                }
            }
        } catch (final IOException io) {
            LOGGER.warn(io.getMessage(), io);
        } finally {
            closeQuietly(bufferedReader);
        }

        sql.deleteCharAt(sql.length() - 1);
        final String query = sql.toString();
        if (query.length() > INSERT_INTO_SPECIFIC_FORMS.length()) {
            getEbean().execute(new DefaultSqlUpdate(sql.toString()));
            getEbean().currentTransaction().flushBatch();
        }

        // tie in the lexicon
        getEbean().execute(new DefaultSqlUpdate(INSERT_LEXICON));
        LOGGER.info("Finished loading specific forms");
        return new ArrayList<SpecificForm>();
    }

    /**
     * @return a new string builder with an appropriate size
     */
    private StringBuilder getAdjustedStringBuilder() {
        final StringBuilder sql = new StringBuilder(8192);
        sql.append(INSERT_INTO_SPECIFIC_FORMS);
        return sql;
    }

    /**
     * parses a line into SQL
     * 
     * @param sql the sql to be processed
     * @param line the line
     */
    private void parseLine(final StringBuilder sql, final String line) {
        final String[] split = line.split("[,]");

        if (split[0].contains("|")) {
            return;
        }

        sql.append('(');
        sql.append('\'');
        sql.append(split[0]);
        sql.append('\'');
        sql.append(',');
        sql.append('\'');
        sql.append(split[1]);
        sql.append('\'');
        sql.append(',');
        sql.append('\'');
        sql.append(unAccent(split[1]));
        sql.append('\'');
        sql.append(',');
        sql.append('\'');
        sql.append(QUOTE_ESCAPE.matcher(transliterate(split[1])).replaceAll("''"));
        sql.append('\'');
        sql.append(')');
        sql.append(',');
    }
}
