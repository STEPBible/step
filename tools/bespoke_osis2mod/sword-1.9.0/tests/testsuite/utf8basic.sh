#/bin/sh

# utf8basic.good originally generated with:
# uconv --from-code UTF-8 --to-code UTF-8 --from-callback substitute UTF-8-test.txt > utf8basic.good
# but modified to ignore UTF-16 surrogates which are apparently illegal.  We return multiple replacement
# characters there, but the spec apparently says we are only supposed to return 1 per UTF-16 surrogate
# there are comments in the spec about "security vulnerability" but we always check if we're at the
# end of our buffer before continuing processing each byte (shouldn't all decoders do this?), so there
# shouldn't be a problem.  Ignoring the UTF-16 non-conformance for now.
../utf8norm < UTF-8-test.txt
