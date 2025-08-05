# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html

# Sets the minimum version of CMake required to build the native library.

cmake_minimum_required(VERSION 3.4.1)

SET(CMAKE_C_FLAGS "-DBIBLESYNC ${CMAKE_C_FLAGS}")

#SET(NDK_DEBUG 0)
SET(CMAKE_C_FLAGS "-D__unix__ ${CMAKE_C_FLAGS}")
SET(CMAKE_C_FLAGS "-D_FTPLIB_NO_COMPAT ${CMAKE_C_FLAGS}")

SET(CMAKE_C_FLAGS "-Wno-invalid-source-encoding ${CMAKE_C_FLAGS}")


SET(CMAKE_C_FLAGS "-DOS_ANDROID ${CMAKE_C_FLAGS}")

SET(CMAKE_C_FLAGS "-fvisibility=hidden ${CMAKE_C_FLAGS}")
SET(CMAKE_C_FLAGS "-DSTDC_HEADERS ${CMAKE_C_FLAGS}")
SET(CMAKE_C_FLAGS "-Dunix ${CMAKE_C_FLAGS}")
SET(CMAKE_C_FLAGS "-DANDROID ${CMAKE_C_FLAGS}")
SET(CMAKE_C_FLAGS "-DEXCLUDEBZIP2 ${CMAKE_C_FLAGS}")
SET(CMAKE_C_FLAGS "-DEXCLUDEXZ ${CMAKE_C_FLAGS}")
SET(CMAKE_C_FLAGS "-DEXCLUDEXZ ${CMAKE_C_FLAGS}")


SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${CMAKE_C_FLAGS}")

# Creates and names a library, sets it as either STATIC
# or SHARED, and provides the relative paths to its source code.
# You can define multiple libraries, and CMake builds them for you.
# Gradle automatically packages shared libraries with your APK.

add_library( # Sets the name of the library.
             sword

             # Sets the library as a shared library.
             SHARED

             # Provides a relative path to your source file(s).
        jni/swordstub.cpp
        utilfuns/swversion.cpp
        modules/comments/zcom/zcom.cpp
        modules/comments/zcom4/zcom4.cpp
        modules/comments/rawfiles/rawfiles.cpp
        modules/comments/rawcom4/rawcom4.cpp
        modules/comments/rawcom/rawcom.cpp
        modules/comments/swcom.cpp
        modules/comments/hrefcom/hrefcom.cpp
        modules/swmodule.cpp
        modules/tests/echomod.cpp
        modules/genbook/swgenbook.cpp
        modules/genbook/rawgenbook/rawgenbook.cpp
        modules/lexdict/swld.cpp
        modules/lexdict/rawld4/rawld4.cpp
        modules/lexdict/zld/zld.cpp
        modules/lexdict/rawld/rawld.cpp
        modules/texts/rawtext/rawtext.cpp
        modules/texts/rawtext4/rawtext4.cpp
        modules/texts/swtext.cpp
        modules/texts/ztext/ztext.cpp
        modules/texts/ztext4/ztext4.cpp
        modules/common/rawstr4.cpp
        modules/common/lzsscomprs.cpp
        modules/common/zipcomprs.cpp
        modules/common/rawverse4.cpp
        modules/common/swcipher.cpp
        modules/common/swcomprs.cpp
        modules/common/rawverse.cpp
        modules/common/sapphire.cpp
        modules/common/zstr.cpp
        modules/common/entriesblk.cpp
        modules/common/zverse.cpp
        modules/common/zverse4.cpp
        modules/common/rawstr.cpp
        modules/filters/gbfwordjs.cpp
        modules/filters/utf8latin1.cpp
        modules/filters/utf8greekaccents.cpp
        modules/filters/utf16utf8.cpp
        modules/filters/gbfwebif.cpp
        modules/filters/utf8transliterator.cpp
        modules/filters/gbfstrongs.cpp
        modules/filters/thmlhtmlhref.cpp
        modules/filters/thmlxhtml.cpp
        modules/filters/thmlgbf.cpp
        modules/filters/utf8utf16.cpp
        modules/filters/utf8cantillation.cpp
        modules/filters/utf8arshaping.cpp
        modules/filters/cipherfil.cpp
        modules/filters/thmlheadings.cpp
        modules/filters/thmlscripref.cpp
        modules/filters/latin1utf8.cpp
        modules/filters/gbfhtml.cpp
        modules/filters/thmlosis.cpp
        modules/filters/utf8nfkd.cpp
        modules/filters/thmlstrongs.cpp
        modules/filters/osisenum.cpp
        modules/filters/osisfootnotes.cpp
        modules/filters/osisglosses.cpp
        modules/filters/osisheadings.cpp
        modules/filters/osishtmlhref.cpp
        modules/filters/osislemma.cpp
        modules/filters/osismorph.cpp
        modules/filters/osismorphsegmentation.cpp
        modules/filters/osisosis.cpp
        modules/filters/osisplain.cpp
        modules/filters/osisredletterwords.cpp
        modules/filters/osisrtf.cpp
        modules/filters/osisscripref.cpp
        modules/filters/osisstrongs.cpp
        modules/filters/osisvariants.cpp
        modules/filters/osiswebif.cpp
        modules/filters/osiswordjs.cpp
        modules/filters/osisxhtml.cpp
        modules/filters/osisxlit.cpp
        modules/filters/osisreferencelinks.cpp
        modules/filters/thmlmorph.cpp
        modules/filters/gbfplain.cpp
        modules/filters/gbfhtmlhref.cpp
        modules/filters/gbfxhtml.cpp
        modules/filters/utf8html.cpp
        modules/filters/utf8nfc.cpp
        modules/filters/rtfhtml.cpp
        modules/filters/gbfredletterwords.cpp
        modules/filters/latin1utf16.cpp
        modules/filters/thmlhtml.cpp
        modules/filters/gbfthml.cpp
        modules/filters/teihtmlhref.cpp
        modules/filters/teixhtml.cpp
        modules/filters/gbfrtf.cpp
        modules/filters/gbfosis.cpp
        modules/filters/teirtf.cpp
        modules/filters/thmlwordjs.cpp
        modules/filters/papyriplain.cpp
        modules/filters/utf8bidireorder.cpp
        modules/filters/gbfheadings.cpp
        modules/filters/thmlrtf.cpp
        modules/filters/swoptfilter.cpp
        modules/filters/utf8arabicpoints.cpp
        modules/filters/unicodertf.cpp
        modules/filters/gbffootnotes.cpp
        modules/filters/greeklexattribs.cpp
        modules/filters/thmlfootnotes.cpp
        modules/filters/thmlplain.cpp
        modules/filters/utf8hebrewpoints.cpp
        modules/filters/thmlwebif.cpp
        modules/filters/thmlvariants.cpp
        modules/filters/thmllemma.cpp
        modules/filters/gbfmorph.cpp
        modules/filters/teiplain.cpp
        modules/filters/swbasicfilter.cpp
        modules/filters/scsuutf8.cpp
        modules/filters/gbflatex.cpp
        modules/filters/thmllatex.cpp
        modules/filters/teilatex.cpp
        modules/filters/osislatex.cpp
        mgr/stringmgr.cpp
        mgr/swmgr.cpp
        mgr/swsearchable.cpp
        mgr/localemgr.cpp
        mgr/swconfig.cpp
        mgr/markupfiltmgr.cpp
        mgr/encfiltmgr.cpp
        mgr/swfiltermgr.cpp
        mgr/swcacher.cpp
        mgr/installmgr.cpp
        mgr/swlocale.cpp
        mgr/filemgr.cpp
        mgr/versificationmgr.cpp
        mgr/remotetrans.cpp
        mgr/ftplibftpt.cpp
        utilfuns/swobject.cpp
        utilfuns/roman.cpp
        utilfuns/swbuf.cpp
        utilfuns/utilstr.cpp
        utilfuns/ftplib.c
        utilfuns/ftpparse.c
        utilfuns/url.cpp
        utilfuns/utilxml.cpp
        keys/swkey.cpp
        keys/versetreekey.cpp
        keys/treekeyidx.cpp
        keys/versekey.cpp
        keys/strkey.cpp
        keys/treekey.cpp
        keys/listkey.cpp
        frontend/swdisp.cpp
        frontend/swlog.cpp
        utilfuns/zlib/untgz.c

        biblesync/biblesync.cc
        biblesync/Android/ifaddrs.c
        biblesync/Android/uuid.c

        )

include_directories(
        ../../../../../../../include

        ../../../../../../../../biblesync/include
        ../../../../../../../../biblesync/src/Android/

)
# Searches for a specified prebuilt library and stores the path as a
# variable. Because CMake includes system libraries in the search path by
# default, you only need to specify the name of the public NDK library
# you want to add. CMake verifies that the library exists before
# completing its build.

find_library( # Sets the name of the path variable.
              log-lib

              # Specifies the name of the NDK library that
              # you want CMake to locate.
              log
        )

# Specifies libraries CMake should link to your target library. You
# can link multiple libraries, such as libraries you define in this
# build script, prebuilt third-party libraries, or system libraries.

target_link_libraries( # Specifies the target library.
                      sword

                       # Links the target library to the log library
                       # included in the NDK.
                       ${log-lib}
                       z
        )