%{
#include "swoptfilter.h"
%}

%ignore sword::SWOptionFilter::getOptionValues;

%include "swoptfilter.h"

%extend sword::SWOptionFilter {
	static sword::SWOptionFilter *castTo(sword::SWFilter *o) {
		return dynamic_cast<sword::SWOptionFilter*>(o);
	}
}