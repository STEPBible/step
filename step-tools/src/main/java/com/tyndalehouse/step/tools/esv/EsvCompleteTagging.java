package com.tyndalehouse.step.tools.esv;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class EsvCompleteTagging {
    private static final Logger LOGGER = LoggerFactory.getLogger(EsvCompleteTagging.class);
    private Map<Node, List<Node>> nodeChanges = new LinkedHashMap<Node, List<Node>>(72000);

    /**
     * @param args the args, not used
     * @throws Exception
     */
    public static void main(final String[] args) throws Exception {
        new EsvCompleteTagging().process(args[0], args[1]);
    }

    private void process(final String path, final String output) throws Exception {
        final DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        final DocumentBuilder newDocumentBuilder = factory.newDocumentBuilder();

        final Document i = newDocumentBuilder.parse(new File(path));

        final Element root = i.getDocumentElement();

        boolean hasChanges = true;
        int n = 1;
        while (hasChanges) {
            walkNode(root);
            hasChanges = this.nodeChanges.size() > 0;
            LOGGER.info("Pass #{}, {} changes", n++, this.nodeChanges.size());
            processChanges();
        }

        final TransformerFactory tfFactory = TransformerFactory.newInstance();
        final Transformer t = tfFactory.newTransformer();

        final OutputStream os = new FileOutputStream(new File(output));
        t.transform(new DOMSource(root), new StreamResult(os));
        os.close();
    }

    private void processChanges() {
        for (final Entry<Node, List<Node>> change : this.nodeChanges.entrySet()) {
            final Node source = change.getKey();
            final List<Node> mutations = change.getValue();

            for (final Node destination : mutations) {
                final Node firstChild = source.getFirstChild();
                source.insertBefore(destination, firstChild);
            }
        }
        this.nodeChanges = new HashMap<Node, List<Node>>(8000);
    }

    private void walkNode(final Node theNode) {
        final NodeList children = theNode.getChildNodes();
        // printNode(theNode);

        for (int ii = 0; ii < children.getLength(); ii++) {
            final Node currentNode = children.item(ii);
            final boolean isWNode = "w".equals(currentNode.getNodeName());
            if (isWNode) {
                // put as many changes as are allowed
                final List<Node> changes = new ArrayList<Node>();
                for (int jj = ii - 1; jj >= 0; jj--) {
                    final Node previousNode = children.item(jj);
                    if (isFoldableNode(previousNode)) {
                        LOGGER.trace("Two nodes, sharing the same parent, and current node is w");
                        changes.add(previousNode);
                    } else {
                        break;
                    }
                }
                if (changes.size() > 0) {
                    this.nodeChanges.put(currentNode, changes);
                }
            }

            if (currentNode.hasChildNodes()) {
                walkNode(currentNode);
            } else {
                // do nothing with leaf nodes
                // printNode(currentNode);
            }
        }
    }

    private boolean isFoldableNode(final Node previousNode) {
        // OSIS spec says that a, index, note, seg are allowed in w's, and obviously text
        final String nodeName = previousNode.getNodeName();
        final boolean isTextNode = "#text".equals(nodeName);

        if (isTextNode) {
            // is a proper textNode?
            return isProperText(previousNode);
        }

        if ("a".equals(nodeName) || "index".equals(nodeName) || "note".equals(nodeName)
                || "seg".equals(nodeName)) {
            // check that it is preceded by a proper text
            final Node previousSibling = previousNode.getPreviousSibling();
            if (previousSibling == null) {
                // first note and such like don't get wrapped up
                return false;
            }

            // otherwise check that it isn't just punctuation
            return isProperText(previousSibling);
        }

        return false;
    }

    private boolean isProperText(final Node previousNode) {
        if (!"#text".equals(previousNode.getNodeName())) {
            return false;
        }

        final Node nodeBeforePrevious = previousNode.getPreviousSibling();
        if (nodeBeforePrevious != null && "#text".equals(nodeBeforePrevious.getNodeName())) {
            // we have two subsequent text nodes, so alert
            LOGGER.warn("Several text nodes follow each other");
            return true;
        }

        final String s = previousNode.getNodeValue();
        for (int ii = 0; ii < s.length(); ii++) {
            if (Character.isLetter(s.charAt(ii))) {
                return true;
            }
        }
        return false;
    }
}
