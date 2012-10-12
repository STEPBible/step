package com.tyndalehouse.step.tools.nave;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import org.jdom.Attribute;
import org.jdom.Content;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.Text;
import org.jdom.input.SAXBuilder;

/**
 * transforming the nave's file
 * 
 * @author chrisburrell
 * 
 */
public class NaveXmlDataProcessor {
    public static void main(final String args[]) throws IOException, JDOMException {
        new NaveXmlDataProcessor(
                "D:\\dev\\projects\\step\\step-core\\src\\test\\resources\\com\\tyndalehouse\\step\\core\\data\\create\\nave.txt",
                "d:\\temp\\nave.txt");
    }

    public NaveXmlDataProcessor(final String source, final String output) throws IOException, JDOMException {
        final BufferedReader br = new BufferedReader(new FileReader(source));
        final BufferedWriter wr = new BufferedWriter(new FileWriter(output));

        Tree<String> t = null;
        final SAXBuilder builder = new SAXBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            if (line.startsWith("$$$")) {
                if (t != null) {
                    writePreviousEntry(wr, t);
                }
                t = new Tree<String>(line.substring(3));
            } else {
                process(builder, line, t);
            }

        }
        writePreviousEntry(wr, t);
        wr.close();
        br.close();

    }

    private void writePreviousEntry(final BufferedWriter wr, final Tree<String> t) throws IOException {
        final List<String> list = new ArrayList<String>();
        list.add(t.getRoot());
        writeTreeRecusively(list, t, new StringBuilder(t.getRoot()), wr, 1, new ArrayList<String>());
    }

    private void writeTreeRecusively(final List<String> headings, final Tree<String> t,
            final StringBuilder key, final BufferedWriter wr, final int level, final List<String> references)
            throws IOException {
        final List<Tree<String>> children = t.getChildren();
        for (final Tree<String> c : children) {
            final int i = 0;

            final StringBuilder cBuilder = new StringBuilder(key);
            cBuilder.append(" - ");
            cBuilder.append(c.getRoot());

            final List<String> newReferences = new ArrayList<String>(references);
            newReferences.add(getReferences(wr, c));

            final List<String> copyOfHeadings = new ArrayList<String>(headings);
            copyOfHeadings.add(cBuilder.toString());
            writeTreeRecusively(copyOfHeadings, c, cBuilder, wr, level + 1, newReferences);
        }

        writeIfLeafNode(t, headings, wr, level, key, references);
    }

    private void writeIfLeafNode(final Tree t, final List<String> headings, final BufferedWriter wr,
            final int level, final StringBuilder cBuilder, final List<String> newReferences)
            throws IOException {
        if (t.getChildren().size() != 0) {
            return;
        }
        int i = 0;
        for (final String s : headings) {
            wr.write("@HeadingLevel");
            wr.write(Integer.valueOf(i++).toString());
            wr.write("=\t");
            wr.write(s);
            wr.write('\n');
        }

        // wr.write("@HeadingLevel");
        // wr.write(Integer.valueOf(level).toString());
        // wr.write("@=\t");
        // wr.write(cBuilder.toString());
        // wr.write('\n');

        // write references
        writeReferences(wr, newReferences);

        wr.write("@LastHeading=\t");
        wr.write(t.getRoot());
        wr.write("\n");

        wr.write("==============================\n");

    }

    private void writeReferences(final BufferedWriter wr, final List<String> references) throws IOException {
        int level = 1;
        for (final String s : references) {
            wr.write("@ReferenceLevel");
            wr.write(Integer.valueOf(level++).toString());
            wr.write("=\t");
            wr.write(s);
            wr.write('\n');
        }
    }

    private String getReferences(final BufferedWriter wr, final Tree<String> c) throws IOException {
        if (!c.getReferences().isEmpty()) {
            final List<String> references = c.getReferences();
            final StringBuilder refString = new StringBuilder(256);
            for (final String string : references) {
                refString.append(string);
                refString.append(' ');
            }
            return refString.toString();
        }
        return "";
    }

    private void process(final SAXBuilder builder, final String line, final Tree t) throws JDOMException,
            IOException {
        final StringReader stringReader = new StringReader(line);
        final Document doc;
        try {
            doc = builder.build(stringReader);
        } catch (final Exception x) {
            // quietly exit and log
            System.out.println("Unable to process line: " + line);
            return;
        }

        final List<Content> content = doc.getContent();
        for (final Content c : content) {
            // look for paragraphs
            if (c instanceof Element) {
                final Element element = (Element) c;
                if (element.getName().equals("entryFree")) {
                    processEntryFree(t, doc, element);
                }
            }
        }
    }

    // if returned, the intention is for it to be appended to the existing heading...
    private String processRefEntry(final Tree t, final Element el) {
        Attribute attribute = el.getAttribute("osisRef");
        String refs;
        String retValue = null;

        if (attribute == null) {
            attribute = el.getAttribute("target");
            refs = "link:" + attribute.getValue();
            retValue = attribute.getValue();
        } else {
            refs = attribute.getValue();
            if (refs.startsWith("Bible:")) {
                refs = refs.substring("Bible:".length());
            }
        }
        t.attachReference(refs);
        return retValue;
    }

    private void processEntryFree(final Tree t, final Document doc, final Element entryFree)
            throws IOException {
        final List<Content> contents = entryFree.getChildren();
        final Tree<String> childTree = null;
        for (final Content c : contents) {
            if (c instanceof Element) {
                final Element element = (Element) c;
                if (element.getName().equals("p")) {
                    extractHeadingFromP(t, element);
                }
            }
        }

    }

    private Tree<String> extractHeadingFromP(final Tree<String> t, final Element element) {
        final List childrenOfP = element.getContent();
        final String text = ((Text) childrenOfP.get(0)).getText();
        // if (text.trim().equals("See")) {
        // if (element.getChildren().size() == 1) {
        //
        // final Content cPOf = (Content) element.getChildren().get(0);
        // if (cPOf instanceof Element && ((Element) cPOf).getName().equals("ref")
        // && ((Element) cPOf).getAttribute("target") != null) {
        // // skip
        // return null;
        // }
        // }
        // //
        // }

        final Tree<String> childTree = t.addChild(text);

        final List<Content> contents = childrenOfP;
        for (final Content c : contents) {
            if (c instanceof Element) {
                final Element childElement = (Element) c;
                final String childName = childElement.getName();
                if (childName.equals("ref")) {
                    final String appendingText = processRefEntry(childTree, ((Element) c));

                    if (appendingText != null) {
                        // need to apend to original text...
                        childTree.root = childTree.root + " " + appendingText;
                    }

                } else if (childName.equals("list")) {
                    final List<Content> children = childElement.getChildren();
                    for (final Content item : children) {
                        // recurse and process as a paragraph
                        extractHeadingFromP(childTree, (Element) item);
                    }
                }
            }
        }

        return childTree;
    }

    private void newEntry(final BufferedWriter wr) throws IOException {
        wr.write("\r\n===============================\r\n");
    }
}
