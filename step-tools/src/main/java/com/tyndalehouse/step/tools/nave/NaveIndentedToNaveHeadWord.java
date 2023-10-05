package com.tyndalehouse.step.tools.nave;

import java.io.IOException;
import java.util.Map;
import java.util.Map.Entry;

public class NaveIndentedToNaveHeadWord {

    public static void main(final String[] args) throws IOException {
        new NaveIndentedToNaveHeadWord(
                new NaveTransforming("C:\\Users\\Chris\\Desktop\\nave-tyndale.txt").trees);
    }

    public NaveIndentedToNaveHeadWord(final Map<String, Tree<String>> trees) throws IOException {

        for (final Entry<String, Tree<String>> entry : trees.entrySet()) {
            entry.getValue().printHeadword(null, new StringBuilder());
        }
    }
}
