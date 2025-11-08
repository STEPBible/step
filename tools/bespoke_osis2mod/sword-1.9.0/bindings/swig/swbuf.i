%{
#include "swbuf.h"
%}

%rename(__str__) sword::SWBuf::operator const char *;
%ignore sword::SWBuf::operator[];
%ignore sword::SWBuf::operator+;
%ignore sword::SWBuf::operator==;
%ignore sword::SWBuf::operator!=;
%ignore sword::SWBuf::operator+=;
%ignore sword::SWBuf::operator-=;
%ignore sword::SWBuf::operator<=;
%ignore sword::SWBuf::operator>=;
%ignore sword::SWBuf::operator<;
%ignore sword::SWBuf::operator>;
%ignore sword::SWBuf::operator<<;
%ignore sword::SWBuf::operator>>;
%ignore sword::SWBuf::operator=;
%ignore sword::SWBuf::operator--;
%ignore sword::SWBuf::charAt(unsigned long);
%ignore sword::SWBuf::setFormattedVA(const char *format, va_list argptr);

/* Ignore this horrible constructor.
*  This would be the default for single character strings passed in. This can
*  lead to changing of immutable strings!!!!
*/
%ignore sword::SWBuf::SWBuf(char, unsigned long);


%include "swbuf.h"


%extend sword::SWBuf {
        char charAt2(unsigned int pos) {
                return self->charAt((unsigned long)pos);
        }
};

