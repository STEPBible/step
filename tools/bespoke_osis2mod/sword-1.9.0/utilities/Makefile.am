AUTOMAKE_OPTIONS = 1.6

# SUBDIRS = diatheke
AM_CPPFLAGS = -I $(top_srcdir)/include
if USE_INTERNAL_REGEX
AM_CPPFLAGS += -I$(top_srcdir)/include/internal/regex
endif
LDADD = $(top_builddir)/lib/libsword.la
#noinst_PROGRAMS = lexdump \
#	stepdump step2vpl gbfidx modwrite addvs  \
#	addgb genbookutil treeidxutil addld  

noinst_PROGRAMS = 
bin_PROGRAMS = osis2mod

osis2mod_SOURCES = osis2mod.cpp json.c load_custom_versification.cpp


EXTRA_DIST = 
# include bcppmake/Makefile.am
# include kylixmake/Makefile.am
# include perl/Makefile.am
