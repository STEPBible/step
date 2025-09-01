EXECUTE_PROCESS(COMMAND
	make -f Makefile.perlswig install
	WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/bindings/swig/perl/)
