//CHECKSTYLE:OFF
package com.tyndalehouse.step.tools.nave;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import com.tyndalehouse.step.core.utils.IOUtils;
import com.tyndalehouse.step.core.utils.StringUtils;

/**
 * transforming the nave's file
 */
@SuppressWarnings("unused")
public class NaveTransforming {
    public static void main(final String[] args) throws IOException {
        new NaveTransforming("C:\\Users\\Chris\\Desktop\\nave-tyndale.txt");
    }

    final Map<String, Tree<String>> trees;

    public NaveTransforming(final String source) throws IOException {
        BufferedReader br = null;
        try {
            br = new BufferedReader(new FileReader(source));
            String line = br.readLine();
            Tree<String> root = null;

            final Map<String, Tree<String>> trees = new LinkedHashMap<String, Tree<String>>();

            int indentation = 0;
            final List<IndentedTree> parents = new ArrayList<IndentedTree>();
            Tree<String> lastChild = null;
            int ignoreIndent = 256;
            while ((line = br.readLine()) != null) {
                if (line.startsWith("$$")) {
                    continue;
                }

                final String trimmedLine = line.trim();
                if (trimmedLine.length() == 0) {
                    continue;
                }

                final char c = trimmedLine.charAt(0);
                if (c == '#') {
                    // count number of spaces
                    final int numberOfSpaces = line.indexOf('#');

                    String ref = trimmedLine.substring(1);
                    if (ref.charAt(ref.length() - 1) == '|') {
                        ref = ref.substring(0, ref.length() - 1);
                    }
                    lastChild.attachReference(ref);
                    ignoreIndent = numberOfSpaces;
                    continue;
                }

                if (c == '\\') {
                    ignoreIndent = 256;
                    if (root != null) {
                        // store root against its name
                        trees.put(parents.get(0).t.root, parents.get(0).t);
                    }

                    final String entryName = trimmedLine.substring(1, trimmedLine.length() - 1);
                    root = new Tree<String>(entryName);
                    lastChild = root;
                    indentation = 0;
                    parents.clear();
                    parents.add(new IndentedTree(root, 0));
                    continue;
                }

                if (c == '.' || c == '-') {
                    // count number of spaces...
                    int ii = 0;
                    while (line.charAt(ii) == ' ') {
                        ii++;
                    }

                    if (indentation == ii) {
                        lastChild = root.addChild(trimmedLine.substring(1));
                    } else if (ii > indentation) {
                        // we're going up a level, so add parent to stack
                        parents.add(new IndentedTree(lastChild, indentation));
                        root = lastChild;

                        lastChild = root.addChild(trimmedLine.substring(1));
                    } else {
                        // we're coming back down
                        while (parents.size() > 0) {
                            if (parents.get(parents.size() - 1).indent >= ii) {
                                // remove because we're not as indented or indented the same
                                parents.remove(parents.size() - 1);
                            } else {
                                // we break because we've reached a point where the list contains our
                                // immediate
                                // parent
                                break;
                            }
                            // else keep going...
                        } // end while

                        // so we've now got the parent at the same level, but we're interested in the level
                        // before...

                        root = parents.get(parents.size() - 1).t;
                        lastChild = root.addChild(trimmedLine.substring(1));
                    }

                    indentation = ii;
                    ignoreIndent = 256;
                    continue;
                } else if (numSpaces(line) == ignoreIndent) {
                    // attach references
                    String ref = trimmedLine;
                    if (ref.charAt(ref.length() - 1) == '|') {
                        ref = ref.substring(0, ref.length() - 1);
                    }

                    lastChild.attachReference(ref);
                    continue;
                } else {
                    // it's most likely a header that has been chopped:
                    lastChild.root = lastChild.root + ' ' + trimmedLine;
                    continue;
                }
            }

            // do the last entry
            trees.put(parents.get(0).t.root, parents.get(0).t);

            // final print trees
            final Set<Entry<String, Tree<String>>> printSet = trees.entrySet();
            for (final Entry<String, Tree<String>> tree : printSet) {
                // System.out.println(tree.getKey());
                tree.getValue().print();
            }

            this.trees = trees;

            // // create a map of the first and last entry
            // final Map<String, Map<String, List<Tree<String>>>> firstAndLast = new LinkedHashMap<String,
            // Map<String, List<Tree<String>>>>();
            // final Set<Entry<String, Tree<String>>> entrySet = trees.entrySet();
            // for (final Entry<String, Tree<String>> tree : entrySet) {
            // addLastChildren(firstAndLast, tree.getValue(), tree.getKey().toLowerCase());
            // }

            // now we can try and match it against the output file
            // matchFiles(firstAndLast);
        } finally {
            IOUtils.closeQuietly(br);

        }
    }

    /**
     * @param firstAndLast
     */
    private void matchFiles(final Map<String, Map<String, List<Tree<String>>>> firstAndLast)
            throws IOException {

        BufferedReader br = null;
        try {
            br = new BufferedReader(new FileReader("d:\\temp\\nave.txt"));

            // read an entry:
            Nave n;
            int errors = 0;
            while ((n = readEntry(br)) != null) {
                if (StringUtils.isBlank(n.references)) {
                    continue;
                }

                final Map<String, List<Tree<String>>> map = firstAndLast.get(n.level0.toLowerCase());
                if (map == null) {
                    errors++;
                    System.err.println("Can't find " + n.level0);
                    continue;
                }

                final List<Tree<String>> matchedEntry = map.get(n.lastHeading.toLowerCase());
                if (matchedEntry == null) {
                    errors++;
                    System.err.println("Can't find last level heading: " + n.highestLevel);
                    continue;
                }

                matchesAnyLine(matchedEntry, n);

                // now write nave to file
            }
            System.out.println("Number of errors " + errors);
        } finally {
            IOUtils.closeQuietly(br);
        }
    }

    private boolean matchesAnyLine(final List<Tree<String>> matchedEntry, final Nave n) {
        if (matchedEntry.size() == 1) {
            // then it's bound to be this, so just make the change...
            // so we found something, so rewrite the headings of the tree...
            final StringBuilder sb = new StringBuilder(128);
            getLongName(sb, matchedEntry.get(0));
            final String shouldBeName = sb.toString();

            if (!shouldBeName.equals(n.highestLevel)) {
                System.out.println("Was " + n.highestLevel + ", now is " + shouldBeName);
                n.highestLevel = shouldBeName;
            }
            return true;
        }

        // otherwise, we need to try all entries
        for (final Tree<String> ent : matchedEntry) {
            final StringBuilder sb = new StringBuilder(128);
            getLongName(sb, matchedEntry.get(0));
            final String shouldBeName = sb.toString();

            if (shouldBeName.equals(sb.toString())) {
                // no change required, as matched
                return true;
            }
        }

        // if we're still here, then we need to warn, as multiple entries match, and can't decide which one it
        // might be...
        System.err.println("Unable to match entry: " + n.lastHeading);
        return false;
    }

    private void getLongName(final StringBuilder sb, final Tree<String> matchedEntry) {

        if (matchedEntry.parentTree != null) {
            getLongName(sb, matchedEntry.parentTree);
        }
        if (sb.length() > 0) {
            sb.append(" - ");
        }
        sb.append(matchedEntry.root);

    }

    class Nave {
        String level0;
        String highestLevel;
        String references;
        String lastHeading;
    }

    private Nave readEntry(final BufferedReader br) throws IOException {
        try {
            final Nave n = new Nave();
            while (readLine(n, br.readLine())) {
                ;
            }

            return n;
        } catch (final RuntimeException e) {
            // abort
            return null;
        }
    }

    private boolean readLine(final Nave n, final String line) {
        if (line == null) {
            throw new RuntimeException("abort");
        }

        if (line.startsWith("@HeadingLevel0")) {
            n.level0 = line.substring(line.indexOf('\t') + 1);
        } else if (line.startsWith("@HeadingLevel0")) {

        } else if (line.startsWith("@HeadingLevel")) {
            n.highestLevel = line.substring(line.indexOf('\t') + 1);
        } else if (line.startsWith("@ReferenceLevel")) {
            n.references = line.substring(line.indexOf('\t') + 1);
        } else if (line.startsWith("@LastHeading")) {
            n.lastHeading = line.substring(line.indexOf('\t') + 1);
        } else if (line.startsWith("=======")) {
            return false;
        }
        return true;
    }

    private int numSpaces(final String line) {
        int spaces = 0;
        while (line.charAt(spaces) == ' ') {
            spaces++;
        }

        return spaces;
    }
}
