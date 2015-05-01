package com.tyndalehouse.step.tools.performance;

import java.lang.management.ManagementFactory;
import java.lang.management.ThreadInfo;
import java.lang.management.ThreadMXBean;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.passage.NoSuchKeyException;

import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.utils.TestUtils;

public class PerformancePassageRetrieval {
    /**
     * tries to replicate the issue with bookdata not being able to be read in a concurrent fashion
     * 
     * @throws NoSuchKeyException a no such key exception
     * @throws BookException a book exception
     * @throws InterruptedException when the thread is interrupted
     */

    public static void testConcurrencyIssueThroughStep() throws NoSuchKeyException, BookException,
            InterruptedException {
        final String[] names = { "KJV", "ESV-THE" };
        final String[] ref = { "Rom.2", "John 7", "2Ki.2", "Rom.1;John 4;2Ki.2", "Acts 3:4-6" };

        final ThreadMXBean thbean = ManagementFactory.getThreadMXBean();
        thbean.setThreadContentionMonitoringEnabled(true);
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                TestUtils.mockVersificationService(), null, null, null, TestUtils.mockVersionResolver(), null);

        final Queue<Long> times = new ConcurrentLinkedQueue<Long>();
        final AtomicLong iterations = new AtomicLong();

        final Runnable r1 = new Runnable() {
            @Override
            public void run() {
                for (int ii = 0; ii < 1000; ii++) {
                    final long l = System.currentTimeMillis();
                    jsi.getOsisText(names[ii % 2], ref[ii % 5]);
                    times.add(System.currentTimeMillis() - l);
                    iterations.incrementAndGet();
                }

                final ThreadInfo threadInfo = thbean.getThreadInfo(new long[] { Thread.currentThread()
                        .getId() }, true, true)[0];
                System.err.println("Waited a total of " + threadInfo.getBlockedCount()
                        + " times, resulting in " + threadInfo.getBlockedTime() + "ms wasted time");
            }
        };

        int ii = 0;

        final long start = System.currentTimeMillis();
        final List<Thread> threads = new ArrayList<Thread>();
        while (ii++ < 16) {
            final Thread t1 = new Thread(r1);
            t1.start();
            threads.add(t1);
        }

        new Thread(new Runnable() {
            @Override
            public void run() {
                while (true) {
                    try {
                        Thread.sleep(10000);
                    } catch (final InterruptedException e) {
                        e.printStackTrace();
                    }
                    System.out.println(iterations.get() + " iterations so far");
                }

            }
        }).start();

        for (final Thread t : threads) {
            t.join();
        }

        final long total = System.currentTimeMillis() - start;
        System.err.println(String.format("Executed: %d in %d ms, %f ms / iteration", iterations.get(), total,
                (double) total / (double) iterations.get()));
    }

}
