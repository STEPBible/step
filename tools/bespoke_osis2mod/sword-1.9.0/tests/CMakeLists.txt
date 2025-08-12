#########################################################################################
# A test suite - that is awesome.

MESSAGE(STATUS "\n-- CONFIGURING LIBRARY TESTS")

SET(test_PROGRAMS
	bibliotest
	casttest
	ciphertest
	complzss
	compnone
	configtest
	filtertest
	httptest
	introtest
	indextest
	keycast
	keytest
	lextest
	listtest
	localetest
	mgrtest
	modtest
	osistest
	ldtest
	parsekey
	rawldidxtest
	romantest
	striptest
	swaptest
	swbuftest
	testblocks
	utf8norm
	versekeytest
	vtreekeytest
	versemgrtest
	webiftest
	xmltest
)

IF(WITH_ICU)
	SET(test_PROGRAMS
		${test_PROGRAMS}
		icutest
		tlitmgrtest
		translittest
	)
ENDIF(WITH_ICU)

IF(WITH_ZLIB OR WITH_INTERNAL_ZLIB)
	SET(test_PROGRAMS
		${test_PROGRAMS}
		compzip
	)
ENDIF(WITH_ZLIB OR WITH_INTERNAL_ZLIB)

FOREACH(TEST ${test_PROGRAMS})
	ADD_EXECUTABLE(${TEST} ${TEST}.cpp)
	IF(BUILDING_SHARED)
		TARGET_LINK_LIBRARIES(${TEST}	sword)
	ELSE(BUILDING_SHARED)
		TARGET_LINK_LIBRARIES(${TEST} sword_static)
	ENDIF(BUILDING_SHARED)
ENDFOREACH(TEST ${test_PROGRAMS})

########################################################################################
# The following tests require extra libraries to run
#
IF(WITH_ICU)
	FOREACH(ICUTEST icutest translittest tlitmgrtest)
        TARGET_LINK_LIBRARIES(${ICUTEST} ${ICU_LIBRARY})
	ENDFOREACH(ICUTEST icutest translittest)
ENDIF(WITH_ICU)

# Excluded until I know we have the tests working
ADD_SUBDIRECTORY(testsuite)
