# This method works but there is no good way to install the results of it
#FIND_PACKAGE(PerlLibs REQUIRED)
#INCLUDE_DIRECTORIES(${PERL_INCLUDE_PATH})
#
#SET_SOURCE_FILES_PROPERTIES(../sword.i PROPERTIES CPLUSPLUS ON)
#SET_SOURCE_FILES_PROPERTIES(../sword.i PROPERTIES SWIG_FLAGS "")
#
#SWIG_ADD_MODULE(Sword perl
#	"../sword.i"
#)
#
#SWIG_LINK_LIBRARIES(Sword ${PERL_LIBRARY} ${SWORD_LINK_NAME})

FIND_PACKAGE(Perl REQUIRED)

SET(PERL_MAKEFILE "#!${PERL_EXECUTABLE}

use ExtUtils::MakeMaker;

# See lib/ExtUtils/MakeMaker.pm for details of how to influence
# the contents of the Makefile that is written
WriteMakefile(
	'NAME'		=> 'Sword',
	'VERSION'	=> '${SWORD_VERSION}',
	'INC'		=> '-I\"${CMAKE_SOURCE_DIR}/include\" -I\"${CMAKE_CURRENT_SOURCE_DIR}/..\"',
	'DEFINE'	=> '-DSWIG',
	'LIBS'		=> '-L\"${CMAKE_BINARY_DIR}\" -lsword -lz',
	'FIRST_MAKEFILE' => 'Makefile.perlswig',
	'PREREQ_PM'	=> {},
		($] >= 5.005 ? ## Add these new keywords supported since 5.005
		(ABSTRACT => 'Sword Project perl bindings', # retrieve abstract from module
		AUTHOR => 'Sword Project <sword-devel@crosswire.org>') : ()),
);

rename 'Makefile.perlswig', 'Makefile.perlswig.old' or die \"Can't rename Makefile\";
open(INPUT, '<Makefile.perlswig.old') or die \"Can't open input Makefile.old\";
open(OUTPUT,'>Makefile.perlswig') or die \"Can't open output Makefile\";
while (<INPUT>) {
  s/\\-lsword/\\-lsword \\-lstdc\\+\\+/;
  print OUTPUT \"$_\";
}

close INPUT;
close OUTPUT;")
FILE(WRITE ${CMAKE_CURRENT_BINARY_DIR}/Makefile.PL "${PERL_MAKEFILE}")

SET(SKIP_MAKEFILE "\\.old
~$
\\.bak
^CVS
Makefile$")
FILE(WRITE ${CMAKE_CURRENT_BINARY_DIR}/Makefile.SKIP "${SKIP_MAKEFILE}")

SWORD_SWIG_GENERATE(perl)

ADD_CUSTOM_COMMAND(OUTPUT MANIFEST Makefile.perlswig
	COMMAND ${PERL_EXECUTABLE} Makefile.PL && make -f Makefile.perlswig clean
	COMMAND ${PERL_EXECUTABLE} Makefile.PL && make -f Makefile.perlswig manifest
	WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR})

ADD_CUSTOM_TARGET(perlswig ALL
	COMMAND make -f Makefile.perlswig
	DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/Sword.cxx ${CMAKE_CURRENT_BINARY_DIR}/Makefile.perlswig ${SWORD_LINK_NAME}
	WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR})

INSTALL(SCRIPT install.cmake)

MESSAGE(STATUS "Perl: yes")
