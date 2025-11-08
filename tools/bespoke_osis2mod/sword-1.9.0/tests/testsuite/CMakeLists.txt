#############################################################################
# This file will actually be responsible for running the tests
#

FILE(WRITE "${CMAKE_CURRENT_BINARY_DIR}/sword.conf" "[Install]\nLocalePath=${CMAKE_CURRENT_SOURCE_DIR}/../../")

FILE(WRITE "${CMAKE_CURRENT_BINARY_DIR}/sword.conf"
	"[Install]\nLocalePath=${CMAKE_CURRENT_SOURCE_DIR}/../../")

ADD_CUSTOM_TARGET(
	tests_configure
	COMMAND cp "${CMAKE_CURRENT_SOURCE_DIR}/*.{sh,good,imp,txt,xml}" "${CMAKE_CURRENT_BINARY_DIR}"
	DEPENDS ${test_PROGRAMS}
	WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
)

FILE(GLOB TEST_SUITE RELATIVE "${CMAKE_CURRENT_SOURCE_DIR}" "*.good")
FOREACH(TEST ${TEST_SUITE})
	GET_FILENAME_COMPONENT(TEST_NAME "${TEST}" NAME_WE)
	ADD_TEST(NAME "${TEST_NAME}"
		WORKING_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}"
		COMMAND ./runtest.sh "${TEST_NAME}")
	MESSAGE(STATUS "  Adding test ${TEST_NAME}")
ENDFOREACH(TEST ${TEST_SUITE})

ADD_DEPENDENCIES(
	buildtest
	tests_configure
)

MESSAGE(STATUS "Testing configured.")
