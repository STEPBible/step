package com.tyndalehouse.step.tools.nave;

import java.util.ArrayList;
import java.util.List;

public class Tree<T> {
    List<Tree<T>> children;
    List<String> references;
    String root;
    Tree<T> parentTree;

    public Tree(final String root) {
        this.root = root;
        this.references = new ArrayList<String>();
        this.children = new ArrayList<Tree<T>>();
    }

    Tree<T> addChild(final String s) {
        final Tree<T> t = new Tree<T>(s.trim());
        t.parentTree = this;
        this.children.add(t);
        return t;
    }

    /**
     * @return the children
     */
    public List<Tree<T>> getChildren() {
        return this.children;
    }

    /**
     * @return the root
     */
    public String getRoot() {
        return this.root;
    }

    public void attachReference(final String ref) {
        this.references.add(ref);
    }

    /**
     * @return the references
     */
    public List<String> getReferences() {
        return this.references;
    }

    public void print() {
        print(0);
    }

    void print(final int level) {
        for (int ii = 0; ii < level; ii++) {
            System.out.print("\t");
        }
        System.out.println(this.root);

        // print all children
        for (final Tree<T> c : this.children) {
            c.print(level + 1);
        }

        // print references on leaf node
        if (this.children.size() == 0 && this.references.size() != 0) {
            for (int ii = 0; ii < level; ii++) {
                System.out.print("\t");
            }
            // plus 1
            System.out.print("\t");

            final StringBuilder sb = new StringBuilder(128);
            for (final String r : this.references) {
                sb.append(r);
                sb.append(' ');
            }
            if (sb.length() != 0) {
                sb.deleteCharAt(sb.length() - 1);
                System.out.println(sb.toString());
            } else {
                // should never happen, but we need to get rid of the tabs
                System.out.println();
            }
        }
    }

    void printHeadword(final String rootName, final StringBuilder concatenatedHeader) {
        String r = rootName;
        if (r == null) {
            r = this.root;
        }

        final StringBuilder runningHeader = new StringBuilder(concatenatedHeader);
        if (runningHeader.length() != 0) {
            runningHeader.append(" - ");
        }
        if (rootName != null) {
            runningHeader.append(this.root);
        }

        if (this.children.isEmpty()) {
            // leaf node so print out
            System.out.print("@EntryRoot=\t");
            System.out.println(rootName);

            System.out.print("@FullHeader=\t");
            System.out.println(runningHeader);

            // output any references
            if (this.references.size() != 0) {
                System.out.print("@References=\t");
                for (final String ref : this.references) {
                    System.out.print(ref);
                    System.out.print(' ');
                }
                System.out.println();
            }

            System.out.println("===================================================");
            return;
        }

        for (final Tree<T> child : this.children) {
            child.printHeadword(r, runningHeader);
        }
    }

    @Override
    public String toString() {
        return this.root;
    }
}
