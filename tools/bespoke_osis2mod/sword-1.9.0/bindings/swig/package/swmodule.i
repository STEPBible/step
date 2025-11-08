%{
#include "swmodule.h"
%}

%ignore sword::SWModule::operator SWKey &;
%ignore sword::SWModule::operator SWKey *;

%ignore sword::SWModule::Search;

%ignore sword::SWModule::SWModule;
%ignore sword::SWModule::filterBuffer;
%ignore sword::SWModule::getEntryAttributes;
%ignore sword::SWModule::getConfig;
%ignore sword::SWModule::setConfig;

%include "swmodule.h"

%extend sword::SWModule {
	
	static sword::SWModule *castTo(sword::SWSearchable *o) {
		return dynamic_cast<sword::SWModule*>(o);
	}


    std::map < sword::SWBuf, std::map < sword::SWBuf, std::map < sword::SWBuf, sword::SWBuf > > > 
    
      &getEntryAttributesMap() {
            return self->getEntryAttributes();
    }

  std::map <sword::SWBuf, sword::SWBuf> *getConfigMap() {
    return ( std::map < sword::SWBuf, sword::SWBuf > * ) &self->getConfig();
  }
}

