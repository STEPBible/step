package com.tyndalehouse.step.jsp;

import java.util.Locale;
import java.util.ResourceBundle;

import javax.servlet.http.HttpServletRequest;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.utils.StringUtils;

/**
 * The Class AbstractSearchStepRequest.
 */
public abstract class AbstractSearchStepRequest extends WebStepRequest {

    private final Locale userLocale;

    /**
     * Instantiates a new abstract search step request.
     *
     * @param injector the injector
     * @param request  the request
     */
    public AbstractSearchStepRequest(final Injector injector, final HttpServletRequest request) {
        super(injector, request);
        this.userLocale = injector.getInstance(ClientSession.class).getLocale();
    }

    /**
     * Adds the row.
     *
     * @param rows  the rows
     * @param basic the basic
     * @param args  the args
     * @param level the level
     */
    private void addRow(final StringBuilder rows, final String basic, final Object[] args, final int level) {
        Object[] passedArgs = args;
        if (args instanceof Object[][]) {
            final Object[][] myArgs = (Object[][]) args;
            passedArgs = new Object[args.length];
            for (int ii = 0; ii < myArgs.length; ii++) {
                passedArgs[ii] = myArgs[ii][0];
            }

        }

        final String format = String.format(basic, passedArgs);
        final String[] splitLines = format.split("#");
        for (final String line : splitLines) {
            addLine(rows, level, line);
        }
    }

    /**
     * Adds a line at a time
     *
     * @param rows   the rows
     * @param level  the level
     * @param format the format
     */
    private void addLine(final StringBuilder rows, final int level, final String format) {
        final String[] splitForm = format.split("\\|");

        rows.append("<tr level='");
        rows.append(level);
        rows.append("'>");

        for (int ii = 0; ii < splitForm.length; ii++) {
            final String cell = splitForm[ii];
            if (StringUtils.isBlank(cell)) {
                continue;
            }

            int jj = ii + 1;
            while (jj++ < splitForm.length && StringUtils.isBlank(splitForm[ii + 1])) {
                //then we continue
            }

            int colspan = jj - ii;
            if (colspan > 1) {
                rows.append("<td colspan='");
                rows.append(colspan);
                rows.append("'>");
            } else {
                rows.append("<td>");
            }
            rows.append(cell);
            rows.append("</td>");
        }
        rows.append("</tr>");
    }

    /**
     * Gets the simple search.
     *
     * @return the simple search
     */
    public String getSearch() {
        final ResourceBundle bundle = ResourceBundle.getBundle("HtmlBundle", this.userLocale);

        final StringBuilder rows = new StringBuilder(2048);
        final Object[][] values = getValues();
        for (int ii = 0; ii < values.length; ii++) {
            final String languageSpecific = bundle.getString((String) values[ii][0]);
            addRow(rows, languageSpecific, (Object[]) values[ii][1], ii);
        }
        return rows.toString();
    }

    /**
     * Localizes Object[] such that the first term is replaced with the internationalised version of the
     * second term
     *
     * @param bundle the bundle
     * @param lines  the lines
     */
    protected void localize(final ResourceBundle bundle, final Object[][] lines) {
        for (int ii = 0; ii < lines.length; ii++) {
            if (lines[ii].length == 2) {
                lines[ii] = new Object[]{String.format((String) lines[ii][0],
                        bundle.getString((String) lines[ii][1]))};
            }
        }
    }

    /**
     * Gets the values.
     *
     * @return the values
     */
    abstract Object[][] getValues();
}
