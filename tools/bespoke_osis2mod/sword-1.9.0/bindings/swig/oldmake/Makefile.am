
if RUNSWIG
PERLSWIG=perlswig
TCLSWIG=tclswig
PYTHONSWIG=pythonswig
PHPSWIG=phpswig
else
PERLSWIG=
TCLSWIG=
PYTHONSWIG=
PHPSWIG=
endif

all: $(PERLBUILD) $(TCLBUILD) $(PYTHONBUILD) $(PHPBUILD)
	echo "built"

perl_make: perl_makebuild
	cd perl && make

perlswig: sword.i
	mkdir -p perl
	$(SWIG) -perl -c++ -shadow -o perl/Sword.cxx -I$(top_srcdir) $(SWORD_INCLUDES) $(top_srcdir)/sword.i

perl_makebuild: $(PERLSWIG)
	mkdir -p perl
	echo "writing perl/Makefile.PL"
	@echo "#! /usr/bin/perl" > perl/Makefile.PL
	@echo "" >> perl/Makefile.PL
	@echo "use ExtUtils::MakeMaker;" >> perl/Makefile.PL
	@echo "" >> perl/Makefile.PL
	@echo "# See lib/ExtUtils/MakeMaker.pm for details of how to influence" >> perl/Makefile.PL
	@echo "# the contents of the Makefile that is written." >> perl/Makefile.PL
	@echo "WriteMakefile(" >> perl/Makefile.PL
	@echo "		'NAME'		=> 'Sword'," >> perl/Makefile.PL
	@echo "		'VERSION'	=> '$(VERSION)'," >> perl/Makefile.PL
	@echo "		'INC'		=> '$(SWORD_INCLUDES)'," >> perl/Makefile.PL
	@echo "		'DEFINE'	=> '-DSWIG'," >> perl/Makefile.PL
	@echo "		'LIBS'		=> '$(LIB_SWORD) -lz'," >> perl/Makefile.PL
	@echo "		'PREREQ_PM'	=> {}, # e.g., Module::Name => 1.1" >> perl/Makefile.PL
	@echo "			($$] >= 5.005 ?		## Add these new keywords supported since 5.005" >> perl/Makefile.PL
	@echo "			(ABSTRACT => 'Sword Project perl bindings', # retrieve abstract from module" >> perl/Makefile.PL
	@echo "			AUTHOR		=> 'Sword Project <sword-devel@crosswire.org>') : ())," >> perl/Makefile.PL
	@echo ");" >> perl/Makefile.PL
	@echo "" >> perl/Makefile.PL
	@echo "rename 'Makefile', 'Makefile.old' or die \"can't rename Makefile\";" >> perl/Makefile.PL
	@echo "open(INPUT, '<Makefile.old') or die \"can't open input Makefile.old\";" >> perl/Makefile.PL
	@echo "open(OUTPUT, '>Makefile') or die \"can't open output Makefile\";" >> perl/Makefile.PL
	@echo "while (<INPUT>) {" >> perl/Makefile.PL
	@echo "	s/\-lsword/\-lsword \-lstdc\+\+/;" >> perl/Makefile.PL
	@echo "	print OUTPUT \"$$""_\";" >> perl/Makefile.PL
	@echo "}" >> perl/Makefile.PL
	@echo "" >> perl/Makefile.PL
	@echo "close INPUT;" >> perl/Makefile.PL
	@echo "close OUTPUT;" >> perl/Makefile.PL
	cd perl && $(PERL) Makefile.PL && make clean
	@echo "\.old" > perl/MANIFEST.SKIP
	@echo "~$$" >> perl/MANIFEST.SKIP
	@echo "\.bak" >> perl/MANIFEST.SKIP
	@echo "^CVS" >> perl/MANIFEST.SKIP
	@echo "Makefile$$" >> perl/MANIFEST.SKIP
	cd perl && $(PERL) Makefile.PL && make manifest

tclswig: sword.i
	mkdir -p tcl
	$(SWIG) -tcl -c++ -namespace -pkgversion $(VERSION) -o tcl/Sword.cxx -I$(top_srcdir) $(top_srcdir)/sword.i

python_make: python_makebuild
	cd python && $(PYTHON) setup.py build_ext $(SWORD_INCLUDES) $(LIB_SWORD)

pythonswig: sword.i
	mkdir -p python
	$(SWIG) -python -c++ -shadow -o python/Sword.cxx -I$(top_srcdir) $(top_srcdir)/sword.i

python_makebuild: $(PYTHONSWIG)
	mkdir -p python
	echo "writing python/setup.py"
	@echo "#! /usr/bin/python" > python/setup.py
	@echo "" >> python/setup.py
	@echo "from distutils.core import setup, Extension" >> python/setup.py
	@echo "setup (name = \"sword\"," >> python/setup.py
	@echo "	version = \"$(VERSION)\"," >> python/setup.py
	@echo "	maintainer = \"Sword Developers\"," >> python/setup.py
	@echo "	maintainer_email = \"sword-devel@crosswire.org\"," >> python/setup.py
	@echo "	url = \"http://www.crosswire.org/sword\"," >> python/setup.py
	@echo "	py_modules = [\"Sword\"]," >> python/setup.py
	@echo "	ext_modules = [Extension(\"sword\", [\"Sword.cxx\"]," >> python/setup.py
	@echo "	define_macros=[('SWIG',1)])], " >> python/setup.py
	@echo ")" >> python/setup.py



phpswig: sword.i
	mkdir -p php
	$(SWIG) -php4 -c++ -fullmake -o php/Sword.cxx -I$(top_srcdir) $(top_srcdir)/sword.i

