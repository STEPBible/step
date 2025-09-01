AUTOMAKE_OPTIONS = 1.6
AM_CPPFLAGS = -I $(top_srcdir)/include
if USE_INTERNAL_REGEX
AM_CPPFLAGS += -I$(top_srcdir)/include/internal/regex
endif
LDADD = $(top_builddir)/lib/libsword.la

noinst_PROGRAMS = lookup search threaded_search listoptions verserangeparse outplain outvplskeleton outrender stripaccents

lookup_SOURCES = lookup.cpp
search_SOURCES = search.cpp
stripaccents_SOURCES = stripaccents.cpp
listoptions_SOURCES = listoptions.cpp
verserangeparse_SOURCES = verserangeparse.cpp
threaded_search_SOURCES = threaded_search.cpp
outplain_SOURCES = outplain.cpp
outvplskeleton_SOURCES = outvplskeleton.cpp
outrender_SOURCES = outrender.cpp
threaded_search_LDADD = $(LDADD) -lpthread
