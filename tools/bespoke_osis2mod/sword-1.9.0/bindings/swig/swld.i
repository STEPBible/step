%{
#include "swld.h"
%}

%ignore sword::SWLD::SWLD;

%include "swld.h"

%extend sword::SWLD {
	static sword::SWLD *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::SWLD*>(o);
	}
}