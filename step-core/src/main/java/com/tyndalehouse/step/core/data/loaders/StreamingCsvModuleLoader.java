package com.tyndalehouse.step.core.data.loaders;

import au.com.bytecode.opencsv.CSVReader;
import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.Reader;

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;

/**
 * Loads modules straight from a CSV file to a database form
 */
public class StreamingCsvModuleLoader extends AbstractClasspathBasedModuleLoader {
    private static final Logger LOG = LoggerFactory.getLogger(StreamingCsvModuleLoader.class);
    private char separator = ',';
    private final EntityIndexWriterImpl writer;

    /**
     * @param writer       the writer to the index
     * @param resourcePath the resource path to load
     */
    public StreamingCsvModuleLoader(final EntityIndexWriterImpl writer, final String resourcePath) {
        super(resourcePath);
        this.writer = writer;
    }

    @Override
    protected void parseFile(final Reader reader, int skipLines) {
        CSVReader csvReader = null;
        try {
            LOG.debug("Parsing file with a CsvReader");
            csvReader = new CSVReader(reader, this.separator, '"', skipLines);
            parseCsvFile(csvReader);
        } finally {
            closeQuietly(csvReader);
        }
    }

    /**
     * Default method for parsing file, uses column strategy
     *
     * @param csvReader the csv reader
     */
    protected void parseCsvFile(final CSVReader csvReader) {
        String[] line;
        String[] headerLine = null;
        try {
            while ((line = csvReader.readNext()) != null) {
                if ((line[0].charAt(0) == '#') || (line[0].charAt(1) == '#')) // skip lines that are a comment
                    continue;
                if (headerLine == null)
                    headerLine = line;
                else {
                    processFields(line, headerLine);
                    this.writer.save();
                }
            }
        } catch (final IOException e) {
            throw new StepInternalException("Failed to read file", e);
        }
    }

    /**
     * @param line       line read from a csv file
     * @param headerLine the headers
     */
    protected void processFields(final String[] line, final String[] headerLine) {
        for (int ii = 0; ii < line.length; ii++) {
            if (ii >= headerLine.length)
                continue;
            this.writer.addFieldToCurrentDocument(headerLine[ii], line[ii]);
        }
    }

    /**
     * @return the writer
     */
    public EntityIndexWriterImpl getWriter() {
        return this.writer;
    }

    /**
     * @param separator the separator to set
     */
    public void setSeparator(final char separator) {
        this.separator = separator;
    }
}
