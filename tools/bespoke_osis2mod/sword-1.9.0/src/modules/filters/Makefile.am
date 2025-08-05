filtersdir = $(top_srcdir)/src/modules/filters

libsword_la_SOURCES += $(filtersdir)/swbasicfilter.cpp
libsword_la_SOURCES += $(filtersdir)/swoptfilter.cpp

GBFFIL = $(filtersdir)/gbfhtml.cpp
GBFFIL += $(filtersdir)/gbfhtmlhref.cpp
GBFFIL += $(filtersdir)/gbfxhtml.cpp
GBFFIL += $(filtersdir)/gbfwebif.cpp
GBFFIL += $(filtersdir)/gbfplain.cpp
GBFFIL += $(filtersdir)/gbfrtf.cpp
GBFFIL += $(filtersdir)/gbfstrongs.cpp
GBFFIL += $(filtersdir)/gbffootnotes.cpp
GBFFIL += $(filtersdir)/gbfheadings.cpp
GBFFIL += $(filtersdir)/gbfredletterwords.cpp
GBFFIL += $(filtersdir)/gbfmorph.cpp
GBFFIL += $(filtersdir)/gbfwordjs.cpp
GBFFIL += $(filtersdir)/gbflatex.cpp

THMLFIL = $(filtersdir)/thmlstrongs.cpp
THMLFIL += $(filtersdir)/thmlfootnotes.cpp
THMLFIL += $(filtersdir)/thmlheadings.cpp
THMLFIL += $(filtersdir)/thmlmorph.cpp
THMLFIL += $(filtersdir)/thmllemma.cpp
THMLFIL += $(filtersdir)/thmlscripref.cpp
THMLFIL += $(filtersdir)/thmlvariants.cpp
THMLFIL += $(filtersdir)/thmlgbf.cpp
THMLFIL += $(filtersdir)/thmlrtf.cpp
THMLFIL += $(filtersdir)/thmlhtml.cpp
THMLFIL += $(filtersdir)/thmlhtmlhref.cpp
THMLFIL += $(filtersdir)/thmlxhtml.cpp
THMLFIL += $(filtersdir)/thmlwebif.cpp
THMLFIL += $(filtersdir)/thmlwordjs.cpp
THMLFIL += $(filtersdir)/thmllatex.cpp

TEIFIL = $(filtersdir)/teiplain.cpp
TEIFIL += $(filtersdir)/teirtf.cpp
TEIFIL += $(filtersdir)/teihtmlhref.cpp
TEIFIL += $(filtersdir)/teixhtml.cpp
TEIFIL += $(filtersdir)/teilatex.cpp

CONVFIL = $(filtersdir)/gbfthml.cpp
CONVFIL += $(filtersdir)/gbfosis.cpp
CONVFIL += $(filtersdir)/thmlosis.cpp
CONVFIL += $(filtersdir)/thmlplain.cpp
CONVFIL += $(filtersdir)/osisosis.cpp

OSISFIL = $(filtersdir)/osisheadings.cpp
OSISFIL += $(filtersdir)/osisfootnotes.cpp 
OSISFIL += $(filtersdir)/osishtmlhref.cpp
OSISFIL += $(filtersdir)/osisxhtml.cpp
OSISFIL += $(filtersdir)/osiswebif.cpp
OSISFIL += $(filtersdir)/osismorph.cpp
OSISFIL += $(filtersdir)/osisstrongs.cpp
OSISFIL += $(filtersdir)/osisplain.cpp
OSISFIL += $(filtersdir)/osisrtf.cpp
OSISFIL += $(filtersdir)/osislemma.cpp
OSISFIL += $(filtersdir)/osisredletterwords.cpp
OSISFIL += $(filtersdir)/osisscripref.cpp
OSISFIL += $(filtersdir)/osisvariants.cpp
OSISFIL += $(filtersdir)/osiswordjs.cpp
OSISFIL += $(filtersdir)/osismorphsegmentation.cpp
OSISFIL += $(filtersdir)/osisglosses.cpp
OSISFIL += $(filtersdir)/osisenum.cpp
OSISFIL += $(filtersdir)/osisxlit.cpp
OSISFIL += $(filtersdir)/osisreferencelinks.cpp
OSISFIL += $(filtersdir)/osislatex.cpp

libsword_la_SOURCES += $(filtersdir)/latin1utf8.cpp
libsword_la_SOURCES += $(filtersdir)/latin1utf16.cpp
libsword_la_SOURCES += $(filtersdir)/utf8utf16.cpp
libsword_la_SOURCES += $(filtersdir)/utf16utf8.cpp
libsword_la_SOURCES += $(filtersdir)/utf8html.cpp
libsword_la_SOURCES += $(filtersdir)/utf8latin1.cpp
libsword_la_SOURCES += $(filtersdir)/unicodertf.cpp
libsword_la_SOURCES += $(filtersdir)/scsuutf8.cpp
libsword_la_SOURCES += $(filtersdir)/utf8scsu.cpp

libsword_la_SOURCES += $(filtersdir)/utf8cantillation.cpp
libsword_la_SOURCES += $(filtersdir)/utf8hebrewpoints.cpp
libsword_la_SOURCES += $(filtersdir)/utf8arabicpoints.cpp
libsword_la_SOURCES += $(filtersdir)/utf8greekaccents.cpp

libsword_la_SOURCES += $(filtersdir)/cipherfil.cpp

PLFIL = $(filtersdir)/rtfhtml.cpp
PLFIL += $(filtersdir)/greeklexattribs.cpp
PLFIL += $(filtersdir)/papyriplain.cpp


SWICUSRC = $(filtersdir)/utf8transliterator.cpp
SWICUSRC += $(filtersdir)/utf8nfc.cpp
SWICUSRC += $(filtersdir)/utf8nfkd.cpp
SWICUSRC += $(filtersdir)/utf8arshaping.cpp
SWICUSRC += $(filtersdir)/utf8bidireorder.cpp

if HAVE_ICU
DISTSWICUSRC =
SWREALICUSRC = $(SWICUSRC)
else
if HAVE_ICUSWORD
DISTSWICUSRC =
SWREALICUSRC = $(SWICUSRC)
else
DISTSWICUSRC = $(SWICUSRC)
SWREALICUSRC =
endif
endif

libsword_la_SOURCES += $(SWREALICUSRC)
EXTRA_DIST = $(DISTSWICUSRC)

libsword_la_SOURCES += $(OSISFIL) $(GBFFIL) \
	$(THMLFIL) $(CONVFIL) $(PLFIL) $(TEIFIL)
