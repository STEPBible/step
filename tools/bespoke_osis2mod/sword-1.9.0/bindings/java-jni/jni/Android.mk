# Copyright (C) 2009 The Android Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# the purpose of this sample is to demonstrate how one can
# generate two distinct shared libraries and have them both
# uploaded in
#


LOCAL_PATH:= $(call my-dir)

# first lib, which will be built statically
#
include $(CLEAR_VARS)

LOCAL_MODULE    := libswordcore
LOCAL_C_INCLUDES := ../sword/include ../sword/include/internal/regex
LOCAL_CFLAGS	+= -D__unix__ \
		   -fvisibility=hidden \
		   -DSTDC_HEADERS \
	 	   -Dunix \
		   -D_FTPLIB_NO_COMPAT \
		   -DANDROID \
		   -DEXCLUDEBZIP2 \
		   -DEXCLUDEXZ \
		   -DOS_ANDROID

#LOCAL_CFLAGS	+= -g

LOCAL_SRC_FILES := ../../../src/modules/comments/zcom/zcom.cpp \
../../../src/modules/comments/rawfiles/rawfiles.cpp \
../../../src/modules/comments/rawcom4/rawcom4.cpp \
../../../src/modules/comments/rawcom/rawcom.cpp \
../../../src/modules/comments/swcom.cpp \
../../../src/modules/comments/hrefcom/hrefcom.cpp \
../../../src/modules/swmodule.cpp \
../../../src/modules/tests/echomod.cpp \
../../../src/modules/genbook/swgenbook.cpp \
../../../src/modules/genbook/rawgenbook/rawgenbook.cpp \
../../../src/modules/lexdict/swld.cpp \
../../../src/modules/lexdict/rawld4/rawld4.cpp \
../../../src/modules/lexdict/zld/zld.cpp \
../../../src/modules/lexdict/rawld/rawld.cpp \
../../../src/modules/texts/rawtext/rawtext.cpp \
../../../src/modules/texts/rawtext4/rawtext4.cpp \
../../../src/modules/texts/swtext.cpp \
../../../src/modules/texts/ztext/ztext.cpp \
../../../src/modules/common/rawstr4.cpp \
../../../src/modules/common/lzsscomprs.cpp \
../../../src/modules/common/zipcomprs.cpp \
../../../src/modules/common/rawverse4.cpp \
../../../src/modules/common/swcipher.cpp \
../../../src/modules/common/swcomprs.cpp \
../../../src/modules/common/rawverse.cpp \
../../../src/modules/common/sapphire.cpp \
../../../src/modules/common/zstr.cpp \
../../../src/modules/common/entriesblk.cpp \
../../../src/modules/common/zverse.cpp \
../../../src/modules/common/rawstr.cpp \
../../../src/modules/filters/gbfwordjs.cpp \
../../../src/modules/filters/utf8latin1.cpp \
../../../src/modules/filters/utf8greekaccents.cpp \
../../../src/modules/filters/utf16utf8.cpp \
../../../src/modules/filters/gbfwebif.cpp \
../../../src/modules/filters/utf8transliterator.cpp \
../../../src/modules/filters/gbfstrongs.cpp \
../../../src/modules/filters/thmlhtmlhref.cpp \
../../../src/modules/filters/thmlxhtml.cpp \
../../../src/modules/filters/thmlgbf.cpp \
../../../src/modules/filters/utf8utf16.cpp \
../../../src/modules/filters/utf8cantillation.cpp \
../../../src/modules/filters/utf8arshaping.cpp \
../../../src/modules/filters/cipherfil.cpp \
../../../src/modules/filters/thmlheadings.cpp \
../../../src/modules/filters/thmlscripref.cpp \
../../../src/modules/filters/latin1utf8.cpp \
../../../src/modules/filters/gbfhtml.cpp \
../../../src/modules/filters/thmlosis.cpp \
../../../src/modules/filters/utf8nfkd.cpp \
../../../src/modules/filters/thmlstrongs.cpp \
../../../src/modules/filters/osisenum.cpp \
../../../src/modules/filters/osisfootnotes.cpp \
../../../src/modules/filters/osisglosses.cpp \
../../../src/modules/filters/osisheadings.cpp \
../../../src/modules/filters/osishtmlhref.cpp \
../../../src/modules/filters/osislemma.cpp \
../../../src/modules/filters/osismorph.cpp \
../../../src/modules/filters/osismorphsegmentation.cpp \
../../../src/modules/filters/osisosis.cpp \
../../../src/modules/filters/osisplain.cpp \
../../../src/modules/filters/osisredletterwords.cpp \
../../../src/modules/filters/osisrtf.cpp \
../../../src/modules/filters/osisscripref.cpp \
../../../src/modules/filters/osisstrongs.cpp \
../../../src/modules/filters/osisvariants.cpp \
../../../src/modules/filters/osiswebif.cpp \
../../../src/modules/filters/osiswordjs.cpp \
../../../src/modules/filters/osisxhtml.cpp \
../../../src/modules/filters/osisxlit.cpp \
../../../src/modules/filters/osisreferencelinks.cpp \
../../../src/modules/filters/thmlmorph.cpp \
../../../src/modules/filters/gbfplain.cpp \
../../../src/modules/filters/gbfhtmlhref.cpp \
../../../src/modules/filters/gbfxhtml.cpp \
../../../src/modules/filters/utf8html.cpp \
../../../src/modules/filters/utf8nfc.cpp \
../../../src/modules/filters/rtfhtml.cpp \
../../../src/modules/filters/gbfredletterwords.cpp \
../../../src/modules/filters/latin1utf16.cpp \
../../../src/modules/filters/thmlhtml.cpp \
../../../src/modules/filters/gbfthml.cpp \
../../../src/modules/filters/teihtmlhref.cpp \
../../../src/modules/filters/teixhtml.cpp \
../../../src/modules/filters/gbfrtf.cpp \
../../../src/modules/filters/gbfosis.cpp \
../../../src/modules/filters/teirtf.cpp \
../../../src/modules/filters/thmlwordjs.cpp \
../../../src/modules/filters/papyriplain.cpp \
../../../src/modules/filters/utf8bidireorder.cpp \
../../../src/modules/filters/gbfheadings.cpp \
../../../src/modules/filters/thmlrtf.cpp \
../../../src/modules/filters/swoptfilter.cpp \
../../../src/modules/filters/utf8arabicpoints.cpp \
../../../src/modules/filters/unicodertf.cpp \
../../../src/modules/filters/gbffootnotes.cpp \
../../../src/modules/filters/greeklexattribs.cpp \
../../../src/modules/filters/thmlfootnotes.cpp \
../../../src/modules/filters/thmlplain.cpp \
../../../src/modules/filters/utf8hebrewpoints.cpp \
../../../src/modules/filters/thmlwebif.cpp \
../../../src/modules/filters/thmlvariants.cpp \
../../../src/modules/filters/thmllemma.cpp \
../../../src/modules/filters/gbfmorph.cpp \
../../../src/modules/filters/teiplain.cpp \
../../../src/modules/filters/swbasicfilter.cpp \
../../../src/modules/filters/scsuutf8.cpp \
../../../src/modules/filters/gbflatex.cpp \
../../../src/modules/filters/thmllatex.cpp \
../../../src/modules/filters/teilatex.cpp \
../../../src/modules/filters/osislatex.cpp \
../../../src/mgr/stringmgr.cpp \
../../../src/mgr/swmgr.cpp \
../../../src/mgr/swsearchable.cpp \
../../../src/mgr/localemgr.cpp \
../../../src/mgr/swconfig.cpp \
../../../src/mgr/markupfiltmgr.cpp \
../../../src/mgr/encfiltmgr.cpp \
../../../src/mgr/swfiltermgr.cpp \
../../../src/mgr/swcacher.cpp \
../../../src/mgr/installmgr.cpp \
../../../src/mgr/swlocale.cpp \
../../../src/mgr/filemgr.cpp \
../../../src/mgr/versificationmgr.cpp \
../../../src/mgr/remotetrans.cpp \
../../../src/mgr/ftplibftpt.cpp \
../../../src/utilfuns/swobject.cpp \
../../../src/utilfuns/roman.cpp \
../../../src/utilfuns/swbuf.cpp \
../../../src/utilfuns/utilstr.cpp \
../../../src/utilfuns/ftplib.c \
../../../src/utilfuns/ftpparse.c \
../../../src/utilfuns/url.cpp \
../../../src/utilfuns/swversion.cpp \
../../../src/utilfuns/utilxml.cpp \
../../../src/utilfuns/regex.c \
../../../src/keys/swkey.cpp \
../../../src/keys/versetreekey.cpp \
../../../src/keys/treekeyidx.cpp \
../../../src/keys/versekey.cpp \
../../../src/keys/strkey.cpp \
../../../src/keys/treekey.cpp \
../../../src/keys/listkey.cpp \
../../../src/frontend/swdisp.cpp \
../../../src/frontend/swlog.cpp \
../../../src/utilfuns/zlib/untgz.c

# add BibleSync 
LOCAL_C_INCLUDES += ../biblesync/include
LOCAL_SRC_FILES += \
	../../../../biblesync/src/biblesync.cc \
	../../../../biblesync/src/ifaddrs.c
	

#../../../src/modules/common/bz2comprs.cpp \
#../../../src/modules/common/xzcomprs.cpp \
#../../../../../sword/src/mgr/curlftpt.cpp \
#../../../../../sword/src/mgr/curlhttpt.cpp \
#../../../../../sword/src/utilfuns/win32/dirent.cpp \
#../../../../../sword/src/frontend/framework/femain.cpp \
#../../../../../sword/src/frontend/im/nullim.cpp \
#../../../../../sword/src/frontend/im/swinputmeth.cpp \
#../../../../../sword/src/frontend/im/hebrewmcim.cpp \

include $(BUILD_STATIC_LIBRARY)

# second lib, which will depend on and include the first one
#
include $(CLEAR_VARS)

LOCAL_MODULE    := libsword
LOCAL_C_INCLUDES := ../sword/include ../sword/include/internal/regex

# add BibleSync stuff
LOCAL_C_INCLUDES += ../biblesync/include

LOCAL_CFLAGS	+= -D__unix__ \
		   -Dunix \
		   -D_FTPLIB_NO_COMPAT \
		   -DANDROID \
		   -DOS_ANDROID

LOCAL_LDLIBS	+= -lz -llog

LOCAL_SRC_FILES := swordstub.cpp

LOCAL_STATIC_LIBRARIES := libswordcore

include $(BUILD_SHARED_LIBRARY)
