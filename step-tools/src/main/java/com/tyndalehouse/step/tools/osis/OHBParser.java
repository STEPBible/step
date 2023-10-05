package com.tyndalehouse.step.tools.osis;

import org.apache.commons.io.FileUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMResult;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.sax.SAXResult;
import javax.xml.transform.sax.SAXTransformerFactory;
import javax.xml.transform.sax.TransformerHandler;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.*;
import java.util.Collection;

/**
 * Strips out the '/' character from the original source.
 */
public class OHBParser {
    /**
     * @param args the list of arguments
     */
    public static void main(String[] args) throws TransformerException, ParserConfigurationException, SAXException, IOException {
        if(args.length != 2) {
            System.out.println("Args: inputDirectory outputFile");
            System.exit(-1);
        }

        DOMSource source = new DOMSource(joinFiles(args[0]));

        SAXTransformerFactory stf = (SAXTransformerFactory) TransformerFactory.newInstance();

        // These templates objects could be reused and obtained from elsewhere.
        Templates templates1 = stf.newTemplates(new StreamSource(OHBParser.class.getResourceAsStream("ohb_parser.xsl")));

        TransformerHandler th1 = stf.newTransformerHandler(templates1);

        BufferedOutputStream fos = new BufferedOutputStream(new FileOutputStream(args[1]));

        th1.setResult(new StreamResult(fos));

        Transformer t = stf.newTransformer();

        t.transform(source, new SAXResult(th1));
        fos.close();
    }

    /**
     * Joins the files found in GitHub.
     */
    private static Document joinFiles(String directory) throws IOException, ParserConfigurationException, SAXException {
        final Collection<File> files = FileUtils.listFiles(new File(directory), new String[]{"xml"}, false);
        Document masterDoc = null;
        Node osisText = null;

        for (File f : files) {
            if("VerseMap.xml".equals(f.getName())) {
                continue;
            }

            System.out.println("Processing: " + f.getName());
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(f);

            if (masterDoc == null) {
                osisText = findElement(doc, "osisText");
                masterDoc = doc;

            } else {
                //we need to merge it, at the level of the osisText element
                Node otherOsisText = findElement(doc, "osisText");
                final NodeList childNodes = otherOsisText.getChildNodes();
                for (int ii = 0; ii < childNodes.getLength(); ii++) {
                    Node child = childNodes.item(ii);

                    if (!"header".equals(child.getNodeName())) {
                        osisText.appendChild(masterDoc.importNode(child, true));
                    }
                }
            }
        }

        return masterDoc;
    }

    private static Node findElement(final Document doc, String nodeName) {
        final NodeList childNodes = doc.getChildNodes().item(0).getChildNodes();
        for (int ii = 0; ii < childNodes.getLength(); ii++) {
            final Node item = childNodes.item(ii);
            if (item instanceof Element) {
                if (nodeName.equals(item.getNodeName())) {
                    return item;
                }
            }
        }
        return null;
    }
}
