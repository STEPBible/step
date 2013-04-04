package com.tyndalehouse.step.tools.esv;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.custommonkey.xmlunit.DetailedDiff;
import org.custommonkey.xmlunit.Diff;
import org.custommonkey.xmlunit.Difference;
import org.custommonkey.xmlunit.DifferenceEngine;
import org.custommonkey.xmlunit.DifferenceListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

public class CheckXmlEquivalents {
    private static final Logger LOGGER = LoggerFactory.getLogger(CheckXmlEquivalents.class);

    public static void main(final String[] args) throws IOException, URISyntaxException, SAXException,
            ParserConfigurationException {
        final DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        final DocumentBuilder newDocumentBuilder = factory.newDocumentBuilder();

        final Document i = newDocumentBuilder.parse(CheckXmlEquivalents.class
                .getResourceAsStream("/esv2011.xml"));
        final Document o = newDocumentBuilder.parse(new File("d:\\temp\\esv-out.xml"));

        final DifferenceEngine engine = new DifferenceEngine(new DetailedDiff(new Diff(i, o)));

        engine.compare(i.getFirstChild(), o.getFirstChild(), new DifferenceListener() {

            @Override
            public void skippedComparison(final Node arg0, final Node arg1) {
                LOGGER.warn("Two nodes differ");
            }

            @Override
            public int differenceFound(final Difference diff) {
                LOGGER.warn("Difference found");
                return Diff.RETURN_ACCEPT_DIFFERENCE;
            }
        }, null);

    }
}
