package com.tyndalehouse.step.core.data.create;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.data.loaders.AbstractClasspathBasedModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Loads an Easton Dictionary
 * 
 * @author chrisburrell
 * 
 */
public class HeadwordLineBasedLoader extends AbstractClasspathBasedModuleLoader {
    private static final Logger LOGGER = LoggerFactory.getLogger(HeadwordLineBasedLoader.class);
    private static final String START_TOKEN = "==============";

    // state used during processing
    private int count;
    private final EntityIndexWriterImpl writer;

    /**
     * Loads up dictionary items
     * 
     * @param writer the lucene index writer
     * @param resourcePath the classpath to the data
     */
    public HeadwordLineBasedLoader(final EntityIndexWriterImpl writer, final String resourcePath) {
        super(resourcePath);
        this.writer = writer;
    }

    @Override
    protected void parseFile(final Reader reader, int skipLines) {
        final BufferedReader bufferedReader = new BufferedReader(reader);
        String line = null;

        try {
            while ((line = bufferedReader.readLine()) != null) {
                parseLine(line);
            }

        } catch (final IOException e) {
            throw new StepInternalException("Unable to read a line from the source file ", e);
        }

        // save last article
        this.writer.save();

        LOGGER.info("Loaded [{}] entries.", this.count);
    }

    /**
     * Parses a line by setting the current state of this loader appropriately
     * 
     * @param line the line that has been read from file
     */
    private void parseLine(final String line) {
        // deal with case where we are hitting a new word
        if (line.endsWith(START_TOKEN)) {
            this.count++;
            this.writer.save();

            if (this.count % 5000 == 0) {
                super.getMainLoader().addUpdate("install_generic_progress", this.count);
            }
        }

        parseField(line);
    }

    /**
     * parses a simple field by examining the type and setting the content (or appending the content to a
     * 
     * @param line the line content including field name and value
     */
    private void parseField(final String line) {
        if (line == null || line.length() == 0 || line.charAt(0) != '@') {
            // ignoring line
            return;
        }

        // get the field name
        final int tabIndex = line.indexOf('\t');
        if (tabIndex < 1) {
            LOGGER.error("Invalid line was found in file: [{}]", line);
            return;
        }

        // get field name and value
        final String fieldName = line.substring(0, tabIndex - 1);
        final int startValue = tabIndex + 1;
        // get value
        if (startValue > line.length()) {
            // no value, so skip
            LOGGER.trace("Skipping empty field [{}]", fieldName);
            return;
        }

        final String fieldValue = line.substring(startValue);
        if (isBlank(fieldValue)) {
            LOGGER.trace("Skipping empty field [{}] => [{}]", fieldName, fieldValue);
            // skipping empty field
            return;
        }

        this.writer.addFieldToCurrentDocument(fieldName, fieldValue);
    }
}
