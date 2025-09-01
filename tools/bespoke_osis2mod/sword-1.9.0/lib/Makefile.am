AUTOMAKE_OPTIONS = 1.6

AM_CPPFLAGS = -I$(top_srcdir)/include

#TODO: Where else do we need this?
if USE_INTERNAL_REGEX
AM_CPPFLAGS += -I$(top_srcdir)/include/internal/regex
endif

AM_CPPFLAGS += -I$(includedir) -DUSE_AUTOTOOLS -DUNIX -Dunix -D__unix__

# Global config directory
globalconfdir := @sysconfdir@

lib_LTLIBRARIES = libsword.la

libsword_la_SOURCES =
if HAVE_ICU
ICUDEF = -DSWICU_DATA=\"${pkglibdir}/${VERSION}_icu_${ICU_VER}\" 
else
ICUDEF =
endif

AM_CPPFLAGS += $(ICUDEF)

libsword_la_LDFLAGS = -release $(VERSION)

include ../src/keys/Makefile.am
include ../src/utilfuns/Makefile.am
include ../src/mgr/Makefile.am
include ../src/frontend/Makefile.am
include ../src/modules/Makefile.am
#include ../bindings/Makefile.am
bindingsdir = $(top_srcdir)/bindings
#libsword_la_SOURCES += $(bindingsdir)/flatapi.cpp
include ../include/Makefile.am


