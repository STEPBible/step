# This file started on 18 January 2010 by Gregory Hellings
# It is ceded to The SWORD Library developers and CrossWire under the terms
# of their own GPLv2 license and all copyright is transferred to them for
# all posterity and eternity, wherever such transfer is possible.  Where it is
# not, then this file is released under the GPLv2 by myself.
#
#
SET(sword_base_frontend_SOURCES
	src/frontend/swdisp.cpp
	src/frontend/swlog.cpp
)
SOURCE_GROUP("src\\frontend" FILES ${sword_base_frontend_SOURCES})

SET(sword_base_keys_SOURCES
	src/keys/swkey.cpp
	src/keys/listkey.cpp
	src/keys/strkey.cpp
	src/keys/treekey.cpp
	src/keys/treekeyidx.cpp
	src/keys/versekey.cpp
	src/keys/versetreekey.cpp
)
SOURCE_GROUP("src\\keys" FILES ${sword_base_keys_SOURCES})

SET(sword_base_mgr_SOURCES
	src/mgr/swconfig.cpp
	src/mgr/swmgr.cpp
	src/mgr/swfiltermgr.cpp
	src/mgr/encfiltmgr.cpp
	src/mgr/markupfiltmgr.cpp
	src/mgr/filemgr.cpp
	src/mgr/versificationmgr.cpp
	src/mgr/remotetrans.cpp
	src/mgr/swlocale.cpp
	src/mgr/localemgr.cpp
	src/mgr/swcacher.cpp
	src/mgr/swsearchable.cpp
	src/mgr/installmgr.cpp
	src/mgr/stringmgr.cpp
)
SOURCE_GROUP("src\\mgr" FILES ${sword_base_mgr_SOURCES})

SET(sword_base_module_SOURCES
	src/modules/swmodule.cpp
	src/modules/comments/swcom.cpp
	src/modules/comments/hrefcom/hrefcom.cpp
	src/modules/comments/rawcom/rawcom.cpp
	src/modules/comments/rawcom4/rawcom4.cpp
	src/modules/comments/rawfiles/rawfiles.cpp
	src/modules/comments/zcom/zcom.cpp
	src/modules/comments/zcom4/zcom4.cpp
	src/modules/common/rawstr.cpp
	src/modules/common/rawstr4.cpp
	src/modules/common/swcomprs.cpp
	src/modules/common/lzsscomprs.cpp
	src/modules/common/rawverse.cpp
	src/modules/common/rawverse4.cpp
	src/modules/common/swcipher.cpp
	src/modules/common/zverse.cpp
	src/modules/common/zverse4.cpp
	src/modules/common/zstr.cpp
	src/modules/common/entriesblk.cpp
	src/modules/common/sapphire.cpp
	src/modules/filters/swbasicfilter.cpp
	src/modules/filters/swoptfilter.cpp

	src/modules/filters/gbfhtml.cpp
	src/modules/filters/gbfxhtml.cpp
	src/modules/filters/gbfhtmlhref.cpp
	src/modules/filters/gbfwebif.cpp
	src/modules/filters/gbfplain.cpp
	src/modules/filters/gbfrtf.cpp
	src/modules/filters/gbfstrongs.cpp
	src/modules/filters/gbffootnotes.cpp
	src/modules/filters/gbfheadings.cpp
	src/modules/filters/gbfredletterwords.cpp
	src/modules/filters/gbfmorph.cpp
	src/modules/filters/gbfwordjs.cpp
	src/modules/filters/gbflatex.cpp

	src/modules/filters/thmlstrongs.cpp
	src/modules/filters/thmlfootnotes.cpp
	src/modules/filters/thmlheadings.cpp
	src/modules/filters/thmlmorph.cpp
	src/modules/filters/thmllemma.cpp
	src/modules/filters/thmlscripref.cpp
	src/modules/filters/thmlvariants.cpp
	src/modules/filters/thmlgbf.cpp
	src/modules/filters/thmlrtf.cpp
	src/modules/filters/thmlhtml.cpp
	src/modules/filters/thmlxhtml.cpp
	src/modules/filters/thmlhtmlhref.cpp
	src/modules/filters/thmlwebif.cpp
	src/modules/filters/thmlwordjs.cpp
	src/modules/filters/thmllatex.cpp

	src/modules/filters/teiplain.cpp
	src/modules/filters/teirtf.cpp
	src/modules/filters/teixhtml.cpp
	src/modules/filters/teihtmlhref.cpp
	src/modules/filters/teilatex.cpp

	src/modules/filters/gbfthml.cpp
	src/modules/filters/gbfosis.cpp
	src/modules/filters/thmlosis.cpp
	src/modules/filters/thmlplain.cpp
	src/modules/filters/osisosis.cpp

	src/modules/filters/osisenum.cpp
	src/modules/filters/osisglosses.cpp
	src/modules/filters/osisxlit.cpp
	src/modules/filters/osisheadings.cpp
	src/modules/filters/osisfootnotes.cpp
	src/modules/filters/osishtmlhref.cpp
	src/modules/filters/osisxhtml.cpp
	src/modules/filters/osiswebif.cpp
	src/modules/filters/osismorph.cpp
	src/modules/filters/osisstrongs.cpp
	src/modules/filters/osisplain.cpp
	src/modules/filters/osisrtf.cpp
	src/modules/filters/osislemma.cpp
	src/modules/filters/osisredletterwords.cpp
	src/modules/filters/osisscripref.cpp
	src/modules/filters/osisvariants.cpp
	src/modules/filters/osiswordjs.cpp
	src/modules/filters/osismorphsegmentation.cpp
	src/modules/filters/osisreferencelinks.cpp
	src/modules/filters/osislatex.cpp	

	src/modules/filters/latin1utf8.cpp
	src/modules/filters/latin1utf16.cpp
	src/modules/filters/utf8utf16.cpp
	src/modules/filters/utf16utf8.cpp
	src/modules/filters/utf8html.cpp
	src/modules/filters/utf8latin1.cpp
	src/modules/filters/unicodertf.cpp
	src/modules/filters/scsuutf8.cpp
	src/modules/filters/utf8scsu.cpp

	src/modules/filters/utf8cantillation.cpp
	src/modules/filters/utf8hebrewpoints.cpp
	src/modules/filters/utf8arabicpoints.cpp
	src/modules/filters/utf8greekaccents.cpp

	src/modules/filters/cipherfil.cpp

	src/modules/filters/rtfhtml.cpp
	src/modules/filters/greeklexattribs.cpp
	src/modules/filters/papyriplain.cpp

	src/modules/genbook/swgenbook.cpp
	src/modules/genbook/rawgenbook/rawgenbook.cpp
	
	src/modules/lexdict/swld.cpp
	src/modules/lexdict/rawld/rawld.cpp
	src/modules/lexdict/rawld4/rawld4.cpp
	src/modules/lexdict/zld/zld.cpp
	
	src/modules/texts/swtext.cpp
	src/modules/texts/rawtext/rawtext.cpp
	src/modules/texts/rawtext4/rawtext4.cpp
	src/modules/texts/ztext/ztext.cpp
	src/modules/texts/ztext4/ztext4.cpp
)
SOURCE_GROUP("src\\modules" FILES ${sword_base_module_SOURCES})

SET(sword_base_utilfns_SOURCES
	src/utilfuns/swobject.cpp
	src/utilfuns/utilstr.cpp
	src/utilfuns/utilxml.cpp
	src/utilfuns/swversion.cpp
	src/utilfuns/swbuf.cpp
	src/utilfuns/ftpparse.c
	src/utilfuns/url.cpp
	src/utilfuns/roman.cpp
)
SOURCE_GROUP("src\\utilfns" FILES ${sword_base_utilfns_SOURCES})

SET(sword_base_msvc_SOURCES
	src/utilfuns/win32/dirent.cpp
)
SOURCE_GROUP("src\\utilfns\\win32" FILES ${sword_base_msvc_SOURCES})

SET(sword_base_binding_SOURCES
	bindings/flatapi.cpp
)

# Universal sources
SET(sword_base_SOURCES
	${sword_base_frontend_SOURCES}
	${sword_base_keys_SOURCES}
	${sword_base_mgr_SOURCES}
	${sword_base_module_SOURCES}
	${sword_base_utilfns_SOURCES}
)

IF(NOT MSVC)
	SET(sword_base_SOURCES
		${sword_base_SOURCES}
		${sword_base_binding_SOURCES}
	)
ELSE(NOT MSVC)
	SET(sword_base_SOURCES
		${sword_base_SOURCES}
		${sword_base_msvc_SOURCES}
	)
ENDIF(NOT MSVC)

# Sources relying on ZLib
SET(sword_zlib_used_SOURCES
	src/modules/common/zipcomprs.cpp
	src/utilfuns/zlib/untgz.c
)
SET(sword_zlib_nofound_SOURCES
	src/utilfuns/zlib/adler32.c
	src/utilfuns/zlib/compress.c
	src/utilfuns/zlib/crc32.c
	src/utilfuns/zlib/deflate.c
	src/utilfuns/zlib/gzclose.c
	src/utilfuns/zlib/gzlib.c
	src/utilfuns/zlib/gzread.c
	src/utilfuns/zlib/gzwrite.c
	src/utilfuns/zlib/infback.c
	src/utilfuns/zlib/inftrees.c
	src/utilfuns/zlib/inflate.c
	src/utilfuns/zlib/inffast.c
	src/utilfuns/zlib/trees.c
	src/utilfuns/zlib/uncompr.c
	src/utilfuns/zlib/zutil.c
)

# Sources relying on bzip2 (libbz2)
SET(sword_bzip2_used_SOURCES
	src/modules/common/bz2comprs.cpp
)

# Sources relying on xz (liblzma)
SET(sword_xz_used_SOURCES
	src/modules/common/xzcomprs.cpp
)

# Sources relying on cURL
SET(sword_curl_found_SOURCES
	src/mgr/curlftpt.cpp
	src/mgr/curlhttpt.cpp
)
SET(sword_curl_nofound_SOURCES
	src/mgr/ftplibftpt.cpp
	src/utilfuns/ftplib.c
)

# Sources relying on CLucene
SET(sword_clucene_found_SOURCES)
SET(sword_clucene_nofound_SOURCES)

# Sources based on the regex stuff
SET(sword_internal_regex_SOURCES
	src/utilfuns/regex.c
)
SET(sword_external_regex_SOURCES)

# Sources based on the ICU status
SET(sword_icu_found_SOURCES
	src/modules/filters/utf8transliterator.cpp
	src/modules/filters/utf8nfc.cpp
	src/modules/filters/utf8nfkd.cpp
	src/modules/filters/utf8arshaping.cpp
	src/modules/filters/utf8bidireorder.cpp
)

# Headers
SET(SWORD_INSTALL_HEADERS
	include/bz2comprs.h
	include/canon.h
	include/canon_abbrevs.h
	include/cipherfil.h
	include/curlftpt.h
	include/curlhttpt.h
	include/defs.h
	include/echomod.h
	include/encfiltmgr.h
	include/entriesblk.h
	include/femain.h
	include/filemgr.h
	include/versificationmgr.h
	include/flatapi.h
	include/ftpparse.h
	include/remotetrans.h
	include/ftplibftpt.h
	include/ftplib.h

	include/gbffootnotes.h
	include/gbfheadings.h
	include/gbfhtml.h
	include/gbfxhtml.h
	include/gbfhtmlhref.h
	include/gbfwebif.h
	include/gbfmorph.h
	include/gbfosis.h
	include/gbfplain.h
	include/gbfredletterwords.h
	include/gbfrtf.h
	include/gbfstrongs.h
	include/gbfwordjs.h
	include/gbfthml.h
	include/gbflatex.h

	include/greeklexattribs.h
	include/hebrewmcim.h
	include/hrefcom.h
	include/installmgr.h
	include/latin1utf16.h
	include/latin1utf8.h
	include/listkey.h
	include/localemgr.h
	include/lzsscomprs.h
	include/markupfiltmgr.h
	include/multimapwdef.h
	include/nullim.h

	include/osisenum.h
	include/osisglosses.h
	include/osisxlit.h
	include/osisheadings.h
	include/osishtmlhref.h
	include/osisxhtml.h
	include/osiswebif.h
	include/osismorph.h
	include/osismorphsegmentation.h
	include/osisplain.h
	include/osisrtf.h
	include/osisosis.h
	include/osisstrongs.h
	include/osisfootnotes.h
	include/osislemma.h
	include/osisredletterwords.h
	include/osisscripref.h
	include/osiswordjs.h
	include/osisvariants.h
	include/osisreferencelinks.h
	include/osislatex.h

	include/papyriplain.h
	include/rawcom.h
	include/rawfiles.h
	include/rawgenbook.h
	include/rawld.h
	include/rawld4.h
	include/rawstr.h
	include/rawstr4.h
	include/rawtext.h
	include/rawverse.h

	include/roman.h
	include/rtfhtml.h
	include/sapphire.h
	include/scsuutf8.h
	include/strkey.h
	include/swbasicfilter.h
	include/swbuf.h
	include/swcacher.h
	include/swcipher.h
	include/swcom.h
	include/swcomprs.h
	include/swconfig.h
	include/swdisp.h
	include/swfilter.h
	include/swfiltermgr.h
	include/swgenbook.h
	include/swinputmeth.h
	include/swkey.h
	include/swld.h
	include/swlocale.h
	include/swlog.h
	include/swmacs.h
	include/swmgr.h
	include/stringmgr.h
	include/swmodule.h
	include/swoptfilter.h
	include/swobject.h
	include/swsearchable.h
	include/swtext.h
    "${CMAKE_CURRENT_BINARY_DIR}/include/swversion.h"
	include/sysdata.h

	include/thmlfootnotes.h
	include/thmlgbf.h
	include/thmlheadings.h
	include/thmlhtml.h
	include/thmlxhtml.h
	include/thmlhtmlhref.h
	include/thmlwebif.h
	include/thmllemma.h
	include/thmlmorph.h
	include/thmlosis.h
	include/thmlplain.h
	include/thmlrtf.h
	include/thmlscripref.h
	include/thmlstrongs.h
	include/thmlvariants.h
	include/thmlwordjs.h
	include/thmllatex.h

	include/teiplain.h
	include/teirtf.h
	include/teixhtml.h
	include/teihtmlhref.h
	include/teilatex.h

	include/treekey.h
	include/treekeyidx.h
	include/unicodertf.h
	include/url.h
	include/utf16utf8.h
	include/utf8arshaping.h
	include/utf8bidireorder.h
	include/utf8cantillation.h
	include/utf8greekaccents.h
	include/utf8hebrewpoints.h
	include/utf8arabicpoints.h
	include/utf8html.h
	include/utf8latin1.h
	include/utf8nfc.h
	include/utf8nfkd.h
	include/utf8scsu.h
	include/utf8transliterator.h
	include/utf8utf16.h
	include/utilstr.h
	include/utilxml.h

	include/versekey.h
	include/versetreekey.h
	include/xzcomprs.h
	include/zcom.h
	include/zcom4.h
	include/zconf.h
	include/zipcomprs.h
	include/zld.h
	include/zstr.h
	include/ztext.h
	include/ztext4.h
	include/zverse.h
	include/zverse4.h

	include/canon_kjva.h
	include/canon_leningrad.h
	include/canon_mt.h
	include/canon_nrsv.h
	include/canon_nrsva.h
	include/canon_synodal.h
	include/canon_vulg.h
	include/canon_german.h
	include/canon_luther.h
	include/canon_null.h
	include/canon_lxx.h
	include/canon_orthodox.h
	include/canon_synodalprot.h
)

SET(INTERNAL_REGEX_HEADER
	include/internal/regex/regex.h
)
