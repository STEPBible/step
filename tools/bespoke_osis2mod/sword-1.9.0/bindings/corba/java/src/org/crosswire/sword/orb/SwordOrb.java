/******************************************************************************
 *
 *  SwordOrb.java -	
 *
 * $Id: SwordOrb.java 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 2003-2013 CrossWire Bible Society (http://www.crosswire.org)
 *	CrossWire Bible Society
 *	P. O. Box 2528
 *	Tempe, AZ  85280-2528
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation version 2.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 */

package org.crosswire.sword.orb;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.StringWriter;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionBindingEvent;
import java.util.Vector;
import java.util.Hashtable;
import java.util.Date;
import java.util.Properties;

public class SwordOrb extends Object implements HttpSessionBindingListener {
	public static Properties config = null;
	public static String ORBEXE = "swordorbserver";
	public static final int MAX_REMOTE_ADDR_CONNECTIONS = 10;
	public static final int MAX_ACCESS_COUNT_PER_INTERVAL = 50;
	public static final long MAX_ACCESS_COUNT_INTERVAL = 50 * 1000;	// milliseconds
	public static final long BLACKLIST_DURATION = 10 * 60 * 1000;	// milliseconds
	public static final String BIBLES = "Biblical Texts";
	public static final String COMMENTARIES = "Commentaries";
	public static final String LEXDICTS = "Lexicons / Dictionaries";
	public static final String GENBOOKS = "Generic Books";
	public static final String DAILYDEVOS = "Daily Devotional";


	public static final int DEBUG   = 9;
	public static final int INFO    = 7;
	public static final int WARN    = 5;
	public static final int ERROR   = 2;
	public static final int NONE    = 0;

	// set this to your desired debug output level
	public static int debugLevel = WARN;


	static void log(int level, String message, Throwable e) {
		if (debugLevel >= level) {
			System.err.println(new Date() + " | " + message);
			// some warnings give a stackstrace, but we don't want to
			// see the stacktrace part unless our current run level is set to DEBUG
			if (debugLevel >= DEBUG && e != null) {
				System.err.println(e);
				e.printStackTrace(System.err);
			}
		}
	}



	static java.util.Properties p = new java.util.Properties();
	static {
		p.setProperty("com.sun.CORBA.codeset.charsets", "0x05010001, 0x00010109");    // UTF-8, UTF-16
		p.setProperty("com.sun.CORBA.codeset.wcharsets", "0x00010109, 0x05010001");    // UTF-16, UTF-8
	}

	static org.omg.CORBA.ORB orb = org.omg.CORBA_2_3.ORB.init(new String[]{}, p);
	static Hashtable<String, Vector<SwordOrb>> clients = new Hashtable<String, Vector<SwordOrb>>();
	String ior = null;
	String remoteAddr = null;
	String localeName = null;
	long   lastAccessed = 0;
	int    intervalCount = 0;
	long   intervalStamp = 0;
	long   blacklistTill = 0;

	private SWMgr attach() {

		// assert IOR has been set
		if (ior == null)
			return null;

		SWMgr retVal = null;
		try {
log(INFO, "attaching...", null);
			org.omg.CORBA.Object obj = orb.string_to_object(ior);
			retVal = SWMgrHelper.narrow(obj);
log(INFO, "calling testConnection", null);
			try {
				retVal.testConnection();
log(INFO, "testConnection successful", null);
			}
			catch (Throwable e) {
log(WARN, "We lost our ORB service.  No worries, it was likely just reaped by a cron to killall ORB services. We'll respawn another...", e);
				retVal = null;
			}
		}
		catch(Throwable e) {
			retVal = null;
log(ERROR, "failed in attach", e);
		}
		return retVal;
	}

	public SwordOrb(String remoteAddr) {
		this.remoteAddr = remoteAddr;
	}


//	this doesn't seem to work.  Never seems to get called for me
	public void finalize () throws Throwable {
		// shut down external process
		try {
log(INFO, "calling finalize.", null);
			getSWMgrInstance().terminate();
		}
		catch (Exception e) {}	// we know this doesn't return property cuz we killed the orb! :)

	}


	public void valueBound(HttpSessionBindingEvent httpSessionBindingEvent) {}

	public void valueUnbound(HttpSessionBindingEvent httpSessionBindingEvent) {
		try {
//			throw new Exception("value unbound; showing stacktrace");
			Vector orbs = (Vector)clients.get(remoteAddr);
int size = -1;
			if (orbs != null) {
size = orbs.size();
				orbs.remove(this);
			}
log(INFO, "calling valueUnbound. size before: " + size + "; size after: "+orbs.size(), null);
			getSWMgrInstance().terminate();
		}
		catch (Exception e) {}	// we know this doesn't return properly cuz we killed the orb! :)
//		catch (Exception e) {e.printStackTrace();}	// we know this doesn't return properly cuz we killed the orb! :)
	}

	private static void loadConfig(HttpServletRequest request) {
		try {
			config = new Properties();
			File propName = new File(request.getSession().getServletContext().getRealPath("/WEB-INF/swordweb.properties"));
			if (propName.exists()) {
				FileInputStream propFile = new FileInputStream(propName);
				config.load(propFile);
				propFile.close();
			}
		}
		catch (Exception e) { e.printStackTrace(); }
		ORBEXE = config.getProperty("orbexe", "swordorbserver");
	}

	private void startOrb() {
		try {
			// start external process
			java.lang.Process p = Runtime.getRuntime().exec(ORBEXE);
			InputStream is = p.getInputStream();
			InputStreamReader isr = new InputStreamReader(is);
			BufferedReader input = new BufferedReader(isr);

			String line;
			line = input.readLine();
//		retVal = p.waitFor();
			ior = line;
log(INFO, "Launched ORB, IOR: " + ior, null);
		}
		catch (Exception e) {e.printStackTrace();}
	}

	void checkAccessAbuse() throws Exception {
		if ((blacklistTill > 0) && (System.currentTimeMillis() < blacklistTill)) {
			throw new Exception("You're an abuser and have been blacklisted till " + new Date(blacklistTill));
		}
		if (++intervalCount > MAX_ACCESS_COUNT_PER_INTERVAL) {
			if (System.currentTimeMillis() < intervalStamp + MAX_ACCESS_COUNT_INTERVAL) {
				// abuser
				blacklistTill = System.currentTimeMillis() + BLACKLIST_DURATION;
			}
			intervalStamp = System.currentTimeMillis();
			intervalCount = 0;
		}
	}

	public SWMgr getSWMgrInstance() throws Exception {
		lastAccessed = System.currentTimeMillis();
		checkAccessAbuse();
		SWMgr retVal = null;
		try {
log(INFO, "trying to see if we have and attach to a running ORB", null);
			retVal = attach();
		}
		catch(Exception e) {
log(ERROR, "exception attaching to running ORB", e);
			retVal = null;
		}
		if (retVal == null) {
			try {
log(INFO, "no ORB running; trying to launch", null);
				startOrb();
log(INFO, "trying to attach to newly launched ORB", null);
				retVal = attach();
				if (retVal != null) {
					if (localeName != null) {
						retVal.setDefaultLocale(localeName);
					}
				}
			}
			catch(org.omg.CORBA.SystemException e) {
				e.printStackTrace();
			}
		}
		return retVal;
	}

	public static void setSessionLocale(String localeName, HttpServletRequest request) throws Exception {
		request.getSession().setAttribute("SwordOrbLocale", localeName);
		SWMgr mgr = getSWMgrInstance(request);
		if (mgr != null) {
			mgr.setDefaultLocale(localeName);
		}
	}

	public static SwordOrb getSessionOrb(HttpServletRequest request) throws Exception {
		if (config == null) loadConfig(request);
		HttpSession session = request.getSession();
		SwordOrb orb = (SwordOrb)session.getAttribute("SwordOrb");
		String remoteAddr = request.getRemoteAddr();
		if (orb == null) {
log(INFO, "No ORB found in session; constructing a new instance", null);

			Vector<SwordOrb> orbs = clients.get(remoteAddr);
			if (orbs == null) {
				orbs = new Vector<SwordOrb>();
				clients.put(remoteAddr, orbs);
			}
			if (orbs.size() < MAX_REMOTE_ADDR_CONNECTIONS) {
				orb = new SwordOrb(remoteAddr);
				orbs.add(orb);

				String locName = (String)session.getAttribute("SwordOrbLocale");
				if (locName != null)
					orb.localeName = locName;

				session.setAttribute("SwordOrb", orb);
			}
			else {
				// recycle oldest orb
				orb = orbs.remove(0);
				orbs.add(orb);
			}
		}
		else {
log(INFO, "ORB found in session", null);
		}
		return orb;
	}

	public static SWMgr getSWMgrInstance(HttpServletRequest request) throws Exception {
		SwordOrb orb = getSessionOrb(request);
		SWMgr mgr = orb.getSWMgrInstance();
		return mgr;
	}


	public static void main(String args[]) throws Exception {
		SWMgr mgr = new SwordOrb("127.0.0.1").getSWMgrInstance();

		System.out.println("PrefixPath: " + mgr.getPrefixPath());
		System.out.println("ConfigPath: " + mgr.getConfigPath());
		ModInfo[] modInfoList = mgr.getModInfoList();
		System.out.println("sequence size: " + modInfoList.length);
		SWModule module;
		for (int i = 0; i < modInfoList.length; i++) {
			System.out.println(modInfoList[i].name + ": " + modInfoList[i].category + ": " + modInfoList[i].language + ": " + modInfoList[i].description);
/*
			module = mgr.getModuleByName(modInfoList[i].name);
			module.setKeyText("jas1:19");
			System.out.println(module.getRenderText());
*/
		}
/*
		module = mgr.getModuleByName("WHNU");
		module.setKeyText("rev.22.21");
		System.out.println(module.getRawEntry());
/*
		boolean lucene = module.hasSearchFramework();
		SearchHit[] searchResults = module.search("God love world", (lucene)?SearchType.LUCENE:SearchType.MULTIWORD, 0, "");
		for (int i = 0; i < searchResults.length; i++)
			System.out.println(searchResults[i].key);

*/
	}
}
