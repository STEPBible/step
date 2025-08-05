%{
#include "swlocale.h"
%}

%ignore sword::SWLocale::operator+=;
%ignore sword::SWLocale::getBookAbbrevs(int *);

%include "swlocale.h"

%extend sword::SWLocale {
    const sword::abbrev* getBookAbbrevs() {
        int x;
        return self->getBookAbbrevs(&x);
    }

}
