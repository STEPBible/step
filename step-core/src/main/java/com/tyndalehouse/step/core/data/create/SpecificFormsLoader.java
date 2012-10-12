package com.tyndalehouse.step.core.data.create;

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.data.loaders.AbstractClasspathBasedModuleLoader;

/**
 * Loads up all lexical forms
 * 
 * @author chrisburrell
 * 
 */
public class SpecificFormsLoader extends AbstractClasspathBasedModuleLoader {
    private static final Logger LOGGER = LoggerFactory.getLogger(HeadwordLineBasedLoaded.class);
    private final EntityIndexWriterImpl writer;

    /**
     * @param writer to the index file
     * @param resourcePath the file
     */
    public SpecificFormsLoader(final EntityIndexWriterImpl writer, final String resourcePath) {
        super(resourcePath);
        this.writer = writer;
    }

    @Override
    protected void parseFile(final Reader reader) {
        final BufferedReader bufferedReader = new BufferedReader(reader);
        String line = null;

        int lines = 0;
        try {
            while ((line = bufferedReader.readLine()) != null) {
                parseLine(line);
                lines++;
            }
        } catch (final IOException io) {
            LOGGER.warn(io.getMessage(), io);
        } finally {
            closeQuietly(bufferedReader);
        }
        LOGGER.info("Finished loading [{}] specific forms", lines);
    }

    /**
     * parses a line into SQL
     * 
     * @param line the line
     */
    private void parseLine(final String line) {
        final String[] split = line.split("[,]");
        if (split[0].contains("|")) {
            return;
        }

        this.writer.addFieldToCurrentDocument("strongNumber", split[0]);
        this.writer.addFieldToCurrentDocument("originalForm", split[1]);
        this.writer.save();
    }
}
