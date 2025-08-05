######################################################################
# Basic utility programs and their joy.
#
# The general assumption is that each of these utilities is built from
# a single source file, which shares its name with the utility itself (appended with .cpp),
# and then linked against the SWORD library.
#
# This list will be built and installed, if so chosen
#
# These are in alphbetical order now - please keep them that way
# if you edit this list in the future.
#
SET(install_UTILITIES
	addld
	emptyvss
	imp2gbs
	imp2ld
	imp2vs
	installmgr
	mkfastmod
	mod2imp
	mod2osis
	mod2vpl
	tei2mod
	vpl2mod
	vs2osisref
	vs2osisreftxt
	xml2gbs
	osis2mod
)

IF(WITH_ZLIB OR WITH_INTERNAL_ZLIB)
	SET(install_UTILITIES ${install_UTILITIES} mod2zmod)
ENDIF(WITH_ZLIB OR WITH_INTERNAL_ZLIB)

######################################################################
# These utilities will be built, but they will not be installed
#
# Again, I have gone to great lengths of travail to make this list
# alphabetical.  If you add utilities to this list, please do so in a
# way that maintains this.
SET(noinstall_UTILITIES
	addgb
	addvs
	gbfidx
	genbookutil
	modwrite
	step2vpl
	stepdump
	treeidxutil
)

#####################################################################
# This will loop over both of the above utility lists and add build targets
# to the system for each one of them.
#

FOREACH(UTIL ${install_UTILITIES} ${noinstall_UTILITIES})
	ADD_EXECUTABLE("${UTIL}"	"${UTIL}.cpp")
	IF(BUILDING_SHARED)
		TARGET_LINK_LIBRARIES("${UTIL}" sword)
	ELSE(BUILDING_SHARED)
		TARGET_LINK_LIBRARIES("${UTIL}" sword_static)
	ENDIF(BUILDING_SHARED)
ENDFOREACH(UTIL ${install_UTILITIES})

####################################################################
# Just to be difficult, we have a single C file that is a utility
# and, therefore, needs its own treatment.
#

ADD_EXECUTABLE(lexdump	lexdump.c)
IF(BUILDING_SHARED)
	TARGET_LINK_LIBRARIES(lexdump sword)
ELSE(BUILDING_SHARED)
	TARGET_LINK_LIBRARIES(lexdump sword_static)
ENDIF(BUILDING_SHARED)

####################################################################
# Install the utilities
#
# We do this here, rather than up in the main install file, because
# a) it fits more logically and b) the scope of ${install_UTILITIES}
# is limited to CMake files in this directory and below, so rather than
# replicate the above list in another place, we'll just handle our
# own install, since this whole directory is optional, anyway.
#
FOREACH(UTIL ${install_UTILITIES})
	INSTALL(TARGETS ${UTIL}
        RUNTIME DESTINATION "${BINDIR}"
		COMPONENT utilities
	)
ENDFOREACH(UTIL ${install_UTILITIES})

ADD_SUBDIRECTORY("${CMAKE_CURRENT_SOURCE_DIR}/diatheke")
