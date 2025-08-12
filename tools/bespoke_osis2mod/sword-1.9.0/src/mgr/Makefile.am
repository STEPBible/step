mgrdir = $(top_srcdir)/src/mgr

if CONFDEF
globdef = -DGLOBCONFPATH=\"${globalconfdir}/sword.conf\"
else
globdef =
endif

AM_CPPFLAGS += $(globdef)
AM_CPPFLAGS += -D_FTPLIB_NO_COMPAT

if WITHCURL
FTP_SOURCES = $(mgrdir)/curlftpt.cpp
FTP_SOURCES += $(mgrdir)/curlhttpt.cpp
else
FTP_SOURCES = $(mgrdir)/ftplibftpt.cpp
endif
if WITHGAPI
FTP_SOURCES += $(mgrdir)/rtranspgdrive.cpp
endif

libsword_la_SOURCES += $(FTP_SOURCES)
libsword_la_SOURCES += $(mgrdir)/swconfig.cpp
libsword_la_SOURCES += $(mgrdir)/swmgr.cpp
libsword_la_SOURCES += $(mgrdir)/swfiltermgr.cpp
libsword_la_SOURCES += $(mgrdir)/encfiltmgr.cpp
libsword_la_SOURCES += $(mgrdir)/markupfiltmgr.cpp
libsword_la_SOURCES += $(mgrdir)/filemgr.cpp
libsword_la_SOURCES += $(mgrdir)/versificationmgr.cpp
libsword_la_SOURCES += $(mgrdir)/remotetrans.cpp
libsword_la_SOURCES += $(mgrdir)/swlocale.cpp
libsword_la_SOURCES += $(mgrdir)/localemgr.cpp
libsword_la_SOURCES += $(mgrdir)/swcacher.cpp
libsword_la_SOURCES += $(mgrdir)/swsearchable.cpp
libsword_la_SOURCES += $(mgrdir)/installmgr.cpp
libsword_la_SOURCES += $(mgrdir)/stringmgr.cpp


