package com.tyndalehouse.step.core.data.loaders;

import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotEmpty;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Used for Geography
 * 
 * @author chrisburrell
 * 
 */
public class GeoStreamingCsvModuleLoader extends StreamingCsvModuleLoader {
    private static final String PRECISION_EXACT = "exact";
    private static final String PRECISION_APPROXIMATE = "approximate";
    private static final String PRECISION_UNKNOWN = "unknown";

    private static final Logger LOG = LoggerFactory.getLogger(GeoStreamingCsvModuleLoader.class);

    // Precision type, can be one of three: exact, unknown, approximate
    private String precisionType = PRECISION_EXACT;
    private final JSwordPassageService jsword;

    /**
     * sets up for tab delimited reading
     * 
     * @param writer the index writer
     * @param resourcePath the path to the resource
     * @param jsword access to jsword for populating references
     */
    public GeoStreamingCsvModuleLoader(final EntityIndexWriterImpl writer, final String resourcePath,
            final JSwordPassageService jsword) {
        super(writer, resourcePath);
        this.jsword = jsword;
        setSeparator('\t');
    }

    @Override
    protected void processFields(final String[] line, final String[] headerLine) {
        reset();

        getWriter().addFieldToCurrentDocument("esvName", line[0]);
        getWriter().addFieldToCurrentDocument("root", line[1]);
        processCoordinate("latitude", line[2]);
        processCoordinate("longitude", line[3]);
        getWriter().addFieldToCurrentDocument("precision", this.precisionType);

        getWriter().addFieldToCurrentDocument("references",
                this.jsword.getAllReferences(line[4].replace("Sng", "Song"), "ESV_th").replace(',', ';'));
    }

    /**
     * Resets the initial state
     */
    private void reset() {
        this.precisionType = PRECISION_EXACT;
    }

    /**
     * Adds the coordinate to the document
     * 
     * @param fieldName the field name
     * @param fieldValue the field value
     */
    private void processCoordinate(final String fieldName, final String fieldValue) {
        final String longitude = fieldValue;
        final Double longitudeValue = getCoordinate(longitude);
        if (longitudeValue != null) {
            getWriter().addFieldToCurrentDocument(fieldName, longitudeValue);
        }
    }

    /**
     * @param coordinate the coordinate
     * @return a string
     */
    private Double getCoordinate(final String coordinate) {
        if (isEmpty(coordinate)) {
            this.precisionType = PRECISION_UNKNOWN;
            return null;
        }

        final String coordinateSuffix = getCoordinateFromString(coordinate);
        try {

            if (isNotEmpty(coordinateSuffix)) {
                return Double.parseDouble(coordinateSuffix);
            }
            // set to unknown
            this.precisionType = PRECISION_UNKNOWN;
            return null;
        } catch (final NumberFormatException e) {
            LOG.error("Unable to parse number: " + coordinate, e);
            this.precisionType = PRECISION_UNKNOWN;
            return null;
        }
    }

    /**
     * Gets the right part of the string for further conversion into a decimal value
     * 
     * @param coordinate the coordinate string
     * @return the coordinate
     */
    private String getCoordinateFromString(final String coordinate) {
        // advance to first digit
        int ii = 0;
        final int coordLength = coordinate.length();
        LOG.trace("Parsing value coordinate [{}]", coordinate);
        while (ii < coordLength && !Character.isDigit(coordinate.charAt(ii))) {
            // do something with the characters we find
            ii++;
        }

        // check last character, and remove
        int jj = coordinate.length() - 1;
        while (jj > 0 && !Character.isDigit(coordinate.charAt(jj))) {
            if (coordinate.charAt(jj) == '?' && !PRECISION_UNKNOWN.equals(this.precisionType)) {
                this.precisionType = PRECISION_APPROXIMATE;
            }

            jj--;
        }

        if (jj <= ii) {
            // then we have only dodgy characters indicating unknown
            return null;
        }

        LOG.trace("Substring of [{}] and [{}]", ii, jj);
        return coordinate.substring(ii, jj + 1);
    }

}
