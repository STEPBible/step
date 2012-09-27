package com.tyndalehouse.step.core.data.create;

import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebeaninternal.server.core.DefaultSqlUpdate;
import com.tyndalehouse.step.core.data.entities.lexicon.Definition;

/**
 * Links related entries in the lexicon
 * 
 * @author chrisburrell
 * 
 */
public class LexiconLinker {
    private static final String INSERT_INTO_LEXICON_LINKS = "INSERT INTO definition_relationships(strongNumber, other_strong) VALUES";
    private static final Logger LOGGER = LoggerFactory.getLogger(LexiconLinker.class);
    private static final String REVERSE_LINKS = "insert into definition_relationships ( other_strong, strongnumber ) "
            + "select strongnumber , other_strong from definition_relationships dr where "
            + "concat(strongnumber, other_strong) not in (select concat(other_strong, strongnumber) from definition_relationships);";
    private final EbeanServer ebean;
    private final LoaderTransaction transaction;

    /**
     * @param ebean the ebean server
     * @param transaction
     */
    public LexiconLinker(final EbeanServer ebean, final LoaderTransaction transaction) {
        this.ebean = ebean;
        this.transaction = transaction;
    }

    /**
     * Creates the links between all strong numbers
     */
    public void processStrongLinks() {
        // flush everything so far
        this.transaction.flushCommitAndContinue();

        // now we need to post-process all of the fields
        final List<Definition> allDefs = this.ebean.find(Definition.class)
                .select("id,strongNumber,relatedNos").findList();

        // now reverse code them all
        final Map<String, Definition> codedByStrongNumber = new HashMap<String, Definition>();
        for (final Definition def : allDefs) {
            if (isNotBlank(def.getStrongNumber())) {
                codedByStrongNumber.put(def.getStrongNumber(), def);
            }
        }

        this.ebean.currentTransaction().setBatchFlushOnMixed(false);
        generateDirectSqlForLinks(codedByStrongNumber);

        reverseLinks();
    }

    /**
     * Reverses the links that have been formed
     */
    private void reverseLinks() {
        final int newLinks = new DefaultSqlUpdate(REVERSE_LINKS).execute();
        LOGGER.info("Created [{}] new links.", newLinks);
    }

    /**
     * creates links direct into the database
     * 
     * @param codedByStrongNumber the list of strong numbers that are known about
     */
    private void generateDirectSqlForLinks(final Map<String, Definition> codedByStrongNumber) {
        StringBuilder sb = getLexiconLinksBuilder();

        int total = 0;
        int links = 0;
        for (final Definition definition : codedByStrongNumber.values()) {
            final String[] relatedNumbers = split(definition.getRelatedNos(), "[ ,]+");
            final Set<String> relatedSet = new HashSet<String>(relatedNumbers.length);

            // add to set to de-dupe - TODO remove this when we know there are no duplicates
            for (final String s : relatedNumbers) {
                relatedSet.add(s);
            }

            for (final String s : relatedSet) {

                // relatedId
                final Definition relatedDefinition = codedByStrongNumber.get(s);
                if (relatedDefinition == null) {
                    LOGGER.warn("Unable to find [{}]", s);
                    continue;
                }

                sb.append('(');
                sb.append(definition.getId());
                sb.append(',');
                sb.append(relatedDefinition.getId());
                sb.append(')');
                sb.append(',');
                links++;
            }

            if (links > 500) {
                // remove comma, replace by semi-colon, and execute.
                sb.deleteCharAt(sb.length() - 1);

                final String query = sb.toString();
                if (query.length() > INSERT_INTO_LEXICON_LINKS.length()) {
                    this.ebean.execute(new DefaultSqlUpdate(query));
                    LOGGER.debug("Created [{}] Strong links", total);
                    sb = getLexiconLinksBuilder();
                    total += links;
                    links = 0;
                }
                this.transaction.flushCommitAndContinue();
            }
        }
    }

    /**
     * @return an appropriately sized StringBuilder to create the insert statements.
     * 
     */
    private StringBuilder getLexiconLinksBuilder() {
        final StringBuilder sb = new StringBuilder(8192);
        sb.append(INSERT_INTO_LEXICON_LINKS);
        return sb;
    }
}
