%{
#include "ztext.h"
%}

%include "ztext.h"

%extend sword::zText {
	static sword::zText *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::zText*>(o);
	}
}
