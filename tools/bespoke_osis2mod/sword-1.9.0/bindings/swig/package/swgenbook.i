%{
#include "swgenbook.h"
%}

%include "swgenbook.h"

%extend sword::SWGenBook {
	static sword::SWGenBook *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::SWGenBook*>(o);
	}
}