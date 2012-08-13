package com.avaje.ebeaninternal.server.ddl;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.LineNumberReader;
import java.io.PrintStream;
import java.io.StringReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.persistence.PersistenceException;

import com.avaje.ebean.Transaction;
import com.avaje.ebean.config.NamingConvention;
import com.avaje.ebean.config.ServerConfig;
import com.avaje.ebean.config.dbplatform.DatabasePlatform;
import com.avaje.ebeaninternal.api.SpiEbeanServer;

/**
 * Controls the generation of DDL and potentially runs the resulting scripts.
 */
// CHECKSTYLE:OFF
public class DdlGenerator {

    private static final Logger logger = Logger.getLogger(DdlGenerator.class.getName());

    private final SpiEbeanServer server;

    private final DatabasePlatform dbPlatform;

    private final PrintStream out = System.out;

    private final int summaryLength = 80;

    private final boolean debug = true;

    private final boolean generateDdl;
    private final boolean runDdl;

    private String dropContent;
    private String createContent;

    private final NamingConvention namingConvention;

    public DdlGenerator(final SpiEbeanServer server, final DatabasePlatform dbPlatform,
            final ServerConfig serverConfig) {
        this.server = server;
        this.dbPlatform = dbPlatform;
        this.generateDdl = serverConfig.isDdlGenerate();
        this.runDdl = serverConfig.isDdlRun();
        this.namingConvention = serverConfig.getNamingConvention();
    }

    /**
     * Generate the DDL and then run the DDL based on property settings (ebean.ddl.generate and ebean.ddl.run
     * etc).
     */
    public void execute(final boolean online) {
        generateDdl();
        if (online) {
            runDdl();
        }
    }

    /**
     * Generate the DDL drop and create scripts if the properties have been set.
     */
    public void generateDdl() {
        if (this.generateDdl) {
            writeDrop(getDropFileName());
            writeCreate(getCreateFileName());
        }
    }

    /**
     * Run the DDL drop and DDL create scripts if properties have been set.
     */
    public void runDdl() {

        if (this.runDdl) {
            try {
                if (this.dropContent == null) {
                    this.dropContent = readFile(getDropFileName());
                }
                if (this.createContent == null) {
                    this.createContent = readFile(getCreateFileName());
                }
                runScript(true, this.dropContent);
                runScript(false, this.createContent);

            } catch (final IOException e) {
                final String msg = "Error reading drop/create script from file system";
                throw new RuntimeException(msg, e);
            }
        }
    }

    protected void writeDrop(final String dropFile) {

        // String c = generateDropDdl();
        try {
            final String c = generateDropDdl();
            writeFile(dropFile, c);

        } catch (final IOException e) {
            final String msg = "Error generating Drop DDL";
            throw new PersistenceException(msg, e);
        }
    }

    protected void writeCreate(final String createFile) {

        // String c = generateCreateDdl();
        try {
            final String c = generateCreateDdl();
            writeFile(createFile, c);

        } catch (final IOException e) {
            final String msg = "Error generating Create DDL";
            throw new PersistenceException(msg, e);
        }
    }

    public String generateDropDdl() {

        final DdlGenContext ctx = createContext();

        final DropTableVisitor drop = new DropTableVisitor(ctx);
        VisitorUtil.visit(this.server, drop);

        final DropSequenceVisitor dropSequence = new DropSequenceVisitor(ctx);
        VisitorUtil.visit(this.server, dropSequence);

        ctx.flush();
        this.dropContent = ctx.getContent();
        return this.dropContent;
    }

    public String generateCreateDdl() {

        final DdlGenContext ctx = createContext();
        final CreateTableVisitor create = new CreateTableVisitor(ctx);
        VisitorUtil.visit(this.server, create);

        final CreateSequenceVisitor createSequence = new CreateSequenceVisitor(ctx);
        VisitorUtil.visit(this.server, createSequence);

        final AddForeignKeysVisitor fkeys = new AddForeignKeysVisitor(ctx);
        VisitorUtil.visit(this.server, fkeys);

        ctx.flush();
        this.createContent = ctx.getContent();
        return this.createContent;
    }

    protected String getDropFileName() {
        return this.server.getName() + "-drop.sql";
    }

    protected String getCreateFileName() {
        return this.server.getName() + "-create.sql";
    }

    protected DdlGenContext createContext() {
        return new DdlGenContext(this.dbPlatform, this.namingConvention);
    }

    protected void writeFile(final String fileName, final String fileContent) throws IOException {
        System.out.println(System.getProperty("java.io.tmpdir"));
        final File f = new File(new File(System.getProperty("java.io.tmpdir")), fileName);

        final FileWriter fw = new FileWriter(f);
        try {
            fw.write(fileContent);
            fw.flush();
        } finally {
            fw.close();
        }
    }

    protected String readFile(final String fileName) throws IOException {

        final File f = new File(new File(System.getProperty("java.io.tmpdir")), fileName);
        if (!f.exists()) {
            return null;
        }

        final StringBuilder buf = new StringBuilder();

        final FileReader fr = new FileReader(f);
        final LineNumberReader lr = new LineNumberReader(fr);
        try {
            String s = null;
            while ((s = lr.readLine()) != null) {
                buf.append(s).append("\n");
            }
        } finally {
            lr.close();
        }

        return buf.toString();
    }

    /**
     * Execute all the DDL statements in the script.
     */
    public void runScript(final boolean expectErrors, final String content) {

        final StringReader sr = new StringReader(content);
        final List<String> statements = parseStatements(sr);

        final Transaction t = this.server.createTransaction();
        try {
            final Connection connection = t.getConnection();

            this.out.println("runScript");
            this.out.flush();

            runStatements(expectErrors, statements, connection);

            this.out.println("... end of script");
            this.out.flush();

            t.commit();

        } catch (final Exception e) {
            final String msg = "Error: " + e.getMessage();
            throw new PersistenceException(msg, e);
        } finally {
            t.end();
        }
    }

    /**
     * Execute the list of statements.
     */
    private void runStatements(final boolean expectErrors, final List<String> statements, final Connection c) {

        for (int i = 0; i < statements.size(); i++) {
            final String xOfy = (i + 1) + " of " + statements.size();
            runStatement(expectErrors, xOfy, statements.get(i), c);
        }
    }

    /**
     * Execute the statement.
     */
    private void runStatement(final boolean expectErrors, final String oneOf, String stmt, final Connection c) {

        PreparedStatement pstmt = null;
        try {

            // trim and remove trailing ; or /
            stmt = stmt.trim();
            if (stmt.endsWith(";")) {
                stmt = stmt.substring(0, stmt.length() - 1);
            } else if (stmt.endsWith("/")) {
                stmt = stmt.substring(0, stmt.length() - 1);
            }

            if (this.debug) {
                this.out.println("executing " + oneOf + " " + getSummary(stmt));
                this.out.flush();
            }

            pstmt = c.prepareStatement(stmt);
            pstmt.execute();

        } catch (final Exception e) {
            if (expectErrors) {
                this.out.println(" ... ignoring error executing " + getSummary(stmt) + "  error: "
                        + e.getMessage());
                e.printStackTrace();
                this.out.flush();
            } else {
                final String msg = "Error executing stmt[" + stmt + "] error[" + e.getMessage() + "]";
                throw new RuntimeException(msg, e);
            }
        } finally {
            if (pstmt != null) {
                try {
                    pstmt.close();
                } catch (final SQLException e) {
                    logger.log(Level.SEVERE, "Error closing pstmt", e);
                }
            }
        }
    }

    /**
     * Break up the sql in reader into a list of statements using the semi-colon character;
     */
    protected List<String> parseStatements(final StringReader reader) {

        try {
            final BufferedReader br = new BufferedReader(reader);

            final ArrayList<String> statements = new ArrayList<String>();

            StringBuilder sb = new StringBuilder();
            String s;
            while ((s = br.readLine()) != null) {
                s = s.trim();
                final int semiPos = s.indexOf(';');
                if (semiPos == -1) {
                    sb.append(s).append(" ");

                } else if (semiPos == s.length() - 1) {
                    // semicolon at end of line
                    sb.append(s);
                    statements.add(sb.toString().trim());
                    sb = new StringBuilder();

                } else {
                    // semicolon in middle of line
                    final String preSemi = s.substring(0, semiPos);
                    sb.append(preSemi);
                    statements.add(sb.toString().trim());
                    sb = new StringBuilder();
                    sb.append(s.substring(semiPos + 1));

                }
            }

            return statements;
        } catch (final IOException e) {
            throw new PersistenceException(e);
        }
    }

    private String getSummary(final String s) {
        if (s.length() > this.summaryLength) {
            return s.substring(0, this.summaryLength).trim() + "...";
        }
        return s;
    }
}
// CHECKSTYLE:ON
