package com.tyndalehouse.step.tools.analysis;

import org.apache.commons.io.FileUtils;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.util.Collection;

/**
 * Outputs all variations of XML attributes and nodes in a file
 * Created by cjburrell on 30/04/2015.
 */
public class AnalyseXML {
    public static void main(String[] args) throws Exception {
        //arg0 is a directory

        final Collection<File> files = FileUtils.listFiles(new File(args[0]), null, false);
        for(File f : files) {
            parseFile(readFile(f));
        }
    }

    private static void parseFile(Document document) {

        final NodeList childNodes = document.getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            final Node item = childNodes.item(i);

            //now recurse
            if (item instanceof Element) {
                Element el = (Element) item;
                System.out.println(el.getNodeName());
            }
        }
    }

    private static Document readFile(File file) throws Exception {
        final DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        final DocumentBuilder newDocumentBuilder = factory.newDocumentBuilder();
        return newDocumentBuilder.parse(file);
    }

}
