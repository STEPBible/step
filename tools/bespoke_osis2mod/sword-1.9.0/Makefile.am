AUTOMAKE_OPTIONS = 1.6

ACLOCAL_AMFLAGS = -I m4
LDADD = $(top_builddir)/lib/libsword.la

# Global config directory
globalconfdir := @sysconfdir@

SUBDIRS = lib .

#if BUILDTESTS
#TESTSDIR = tests
#else
TESTSDIR =
#endif

#if BUILDUTILS
UTILSDIR = utilities
#else
#UTILSDIR =
#endif

#if BUILDEXAMPLES
#EXAMPLESDIR = examples
#else
EXAMPLESDIR =
#endif

SUBDIRS += $(TESTSDIR) $(UTILSDIR) $(EXAMPLESDIR)

EXTRA_DIST = sword.spec sword.kdevprj sword.bmp usrinst.sh autogen.sh sword.pc.in

if USE_PKGCONF
pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = sword.pc

$(pkgconfig_DATA): config.status
endif

if INSTCONF
sysconf_DATA = sword.conf
sword.conf:
	@echo "[Install]" > sword.conf
	@echo "DataPath=$(pkgdatadir)/" >> sword.conf

clean-generic:
	-rm -f sword.conf
endif

#noinst_PROGRAMS = buildtest
#buildtest_SOURCES = buildtest.cpp


include locales.d/Makefile.am
include samples/Makefile.am
include doc/Makefile.am

restore:
	cd $(top_srcdir) && ./scripts/restoremake.sh

install: install-recursive
	@echo ""
	@echo "SWORD is installed."
	@echo ""
	@echo "If this is your first time, you may need a basic global"
	@echo "configuration file.  One can be generated to $(DESTDIR)$(sysconfdir)/sword.conf"
	@echo "by typing: \"sudo make install_config\""
	@echo ""
	@echo "Modules (Bibles, etc.), may then be unzipped to $(pkgdatadir)/"
	@echo "or installed with the command line tool: installmgr"
	@echo ""
	@echo "Type \"make register\" to help us keep track of how many"
	@echo "people are using SWORD."
	@echo ""



install-data-am: installlocaleDATA installmodsDATA install-pkgconfigDATA

uninstall-am: uninstall-info-am uninstalllocaleDATA \
	uninstallmodsDATA uninstall-sysconfDATA uninstall-pkgconfigDATA

register:
	@echo ""
	echo "(***) $$USER@$$HOSTNAME, $$(date), $$(uname -m -r -s), SWORD @VERSION@, ${pkgdatadir}" | mail sword.users@crosswire.org
	@echo ""
	@echo "The output of this command has been sent to CrossWire-- thank you.  Enjoy!"
	@echo ""

install_config: 
	@echo "[Install]" > $(DESTDIR)$(sysconfdir)/sword.conf
	@echo "DataPath=$(pkgdatadir)/" >> $(DESTDIR)$(sysconfdir)/sword.conf
	@echo "sword.conf generated"
	@echo ""
	@echo "You can now try to install modules with installmgr, e.g.,"
	@echo "sudo installmgr -sc -r CrossWire -ri CrossWire KJV"
	@echo ""
	@echo "Run installmgr with no options for help."



dist-hook:
	(cd $(distdir) && ./autogen.sh)
	rm -r $(distdir)/autom4te.cache
