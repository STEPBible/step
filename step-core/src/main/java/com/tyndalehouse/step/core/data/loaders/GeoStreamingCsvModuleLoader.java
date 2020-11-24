//pt20201119 This code was never used so Patrick Tang commented it out on November 19, 2020.  Search for the "November 19, 2020" string to find all the related changes in the Java code.
//pt20201119package com.tyndalehouse.step.core.data.loaders;
//pt20201119
//pt20201119import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
//pt20201119import static com.tyndalehouse.step.core.utils.StringUtils.isNotEmpty;
//pt20201119
//pt20201119import org.slf4j.Logger;
//pt20201119import org.slf4j.LoggerFactory;
//pt20201119
//pt20201119import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
//pt20201119import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Used for Geography
 * 
 * @author chrisburrell
 * 
 */
//pt20201119public class GeoStreamingCsvModuleLoader extends StreamingCsvModuleLoader {
//pt20201119    private static final String PRECISION_EXACT = "exact";
//pt20201119    private static final String PRECISION_APPROXIMATE = "approximate";
//pt20201119    private static final String PRECISION_UNKNOWN = "unknown";
//pt20201119
//pt20201119    private static final Logger LOG = LoggerFactory.getLogger(GeoStreamingCsvModuleLoader.class);
//pt20201119
//pt20201119    // Precision type, can be one of three: exact, unknown, approximate
//pt20201119    private String precisionType = PRECISION_EXACT;
//pt20201119    private final JSwordPassageService jsword;
//pt20201119
//pt20201119    /**
//pt20201119     * sets up for tab delimited reading
//pt20201119     *
//pt20201119     * @param writer the index writer
//pt20201119     * @param resourcePath the path to the resource
//pt20201119     * @param jsword access to jsword for populating references
//pt20201119     */
//pt20201119    public GeoStreamingCsvModuleLoader(final EntityIndexWriterImpl writer, final String resourcePath,
//pt20201119            final JSwordPassageService jsword) {
//pt20201119        super(writer, resourcePath);
//pt20201119        this.jsword = jsword;
//pt20201119        setSeparator('\t');
//pt20201119    }

//pt20201119    @Override
//pt20201119    protected void processFields(final String[] line, final String[] headerLine) {
//pt20201119        reset();
//pt20201119
//pt20201119        getWriter().addFieldToCurrentDocument("esvName", line[0]);
//pt20201119        getWriter().addFieldToCurrentDocument("root", line[1]);
//pt20201119        processCoordinate("latitude", line[2]);
//pt20201119        processCoordinate("longitude", line[3]);
//pt20201119        getWriter().addFieldToCurrentDocument("precision", this.precisionType);
//pt20201119
//pt20201119        getWriter().addFieldToCurrentDocument("references",
//pt20201119                this.jsword.getAllReferences(line[4].replace("Sng", "Song"), "ESV_th").replace(',', ';'));
//pt20201119    }

    /**
     * Resets the initial state
     */
//pt20201119    private void reset() {
//pt20201119        this.precisionType = PRECISION_EXACT;
//pt20201119    }

    /**
     * Adds the coordinate to the document
     * 
     * @param fieldName the field name
     * @param fieldValue the field value
     */
//pt20201119    private void processCoordinate(final String fieldName, final String fieldValue) {
//pt20201119        final String longitude = fieldValue;
//pt20201119        final Double longitudeValue = getCoordinate(longitude);
//pt20201119        if (longitudeValue != null) {
//pt20201119            getWriter().addFieldToCurrentDocument(fieldName, longitudeValue);
//pt20201119        }
//pt20201119    }

    /**
     * @param coordinate the coordinate
     * @return a string
     */
//pt20201119    private Double getCoordinate(final String coordinate) {
//pt20201119        if (isEmpty(coordinate)) {
//pt20201119            this.precisionType = PRECISION_UNKNOWN;
//pt20201119            return null;
//pt20201119        }
//pt20201119
//pt20201119        final String coordinateSuffix = getCoordinateFromString(coordinate);
//pt20201119        try {
//pt20201119
//pt20201119            if (isNotEmpty(coordinateSuffix)) {
//pt20201119                return Double.parseDouble(coordinateSuffix);
//pt20201119            }
//pt20201119            // set to unknown
//pt20201119            this.precisionType = PRECISION_UNKNOWN;
//pt20201119            return null;
//pt20201119        } catch (final NumberFormatException e) {
//pt20201119            LOG.error("Unable to parse number: " + coordinate, e);
//pt20201119            this.precisionType = PRECISION_UNKNOWN;
//pt20201119            return null;
//pt20201119        }
//pt20201119    }

    /**
     * Gets the right part of the string for further conversion into a decimal value
     * 
     * @param coordinate the coordinate string
     * @return the coordinate
     */
//pt20201119    private String getCoordinateFromString(final String coordinate) {
//pt20201119        // advance to first digit
//pt20201119        int ii = 0;
//pt20201119        final int coordLength = coordinate.length();
//pt20201119        LOG.trace("Parsing value coordinate [{}]", coordinate);
//pt20201119        while (ii < coordLength && !Character.isDigit(coordinate.charAt(ii))) {
//pt20201119            // do something with the characters we find
//pt20201119            ii++;
//pt20201119        }

        // check last character, and remove
//pt20201119        int jj = coordinate.length() - 1;
//pt20201119        while (jj > 0 && !Character.isDigit(coordinate.charAt(jj))) {
//pt20201119            if (coordinate.charAt(jj) == '?' && !PRECISION_UNKNOWN.equals(this.precisionType)) {
//pt20201119                this.precisionType = PRECISION_APPROXIMATE;
//pt20201119            }
//pt20201119
//pt20201119            jj--;
//pt20201119        }
//pt20201119
//pt20201119        if (jj <= ii) {
//pt20201119            // then we have only dodgy characters indicating unknown
//pt20201119            return null;
//pt20201119        }
//pt20201119
//pt20201119        LOG.trace("Substring of [{}] and [{}]", ii, jj);
//pt20201119        return coordinate.substring(ii, jj + 1);
//pt20201119    }
//pt20201119
//pt20201119}
