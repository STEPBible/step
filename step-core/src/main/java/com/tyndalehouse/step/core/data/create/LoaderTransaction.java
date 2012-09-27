package com.tyndalehouse.step.core.data.create;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebean.Transaction;
import com.avaje.ebean.TxIsolation;

/**
 * Loader transaction
 * 
 * @author chrisburrell
 * 
 */
public class LoaderTransaction {
    private final int batchSize;
    private final EbeanServer ebean;

    /**
     * prevent instantiation
     * 
     * @param ebean ebean
     * @param batchSize the size of the batch
     */
    public LoaderTransaction(final EbeanServer ebean, final int batchSize) {
        this.ebean = ebean;
        this.batchSize = batchSize;
    }

    /**
     * Writes everything to the disk and continues by re-opening a different transaction
     */
    public void flushCommitAndContinue() {
        commitAndEnd();

        openNewBatchTransaction();

    }

    /**
     * Commits and ends the transaction
     */
    public void commitAndEnd() {
        final Transaction oldTransaction = this.ebean.currentTransaction();
        oldTransaction.flushBatch();
        oldTransaction.commit();
    }

    /**
     * opens a new transaction for batch processing
     */
    public void openNewBatchTransaction() {
        final Transaction newTransaction = this.ebean.beginTransaction(TxIsolation.READ_UNCOMMITTED);
        newTransaction.setBatchMode(true);
        newTransaction.setBatchSize(this.batchSize);
    }
}
