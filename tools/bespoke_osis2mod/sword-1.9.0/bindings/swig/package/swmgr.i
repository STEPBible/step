%{
#include <swmgr.h>
%}

%ignore sword::SWMgr::Modules;
%ignore sword::SWMgr::findConfig;
%include "swmgr.h"

%extend sword::SWMgr {
    std::vector < sword::SWBuf > getGlobalOptionsVector() {
        std::list<sword::SWBuf> l(self->getGlobalOptions());
        return std::vector< sword::SWBuf >(l.begin(), l.end());
    }
    
    std::vector < sword::SWBuf > getGlobalOptionValuesVector(const char *option) {
        std::list<sword::SWBuf> l(self->getGlobalOptionValues(option));
        return std::vector< sword::SWBuf >(l.begin(), l.end());
    }
    
    std::map<sword::SWBuf, sword::SWModule*> &getModules() {
        return self->Modules;
    }
    
    SWModule* getModuleAt( const int pos ) {
        if (pos < 0 || pos > (int)self->Modules.size() )
            return 0;
    
        sword::ModMap::iterator it = self->Modules.begin(); 
        
        for (int i = 0; i < pos; ++i) {
            it++;
        }

        if ( it != self->Modules.end() ) {
            return (*it).second;
        }
        
        return 0;
    }
} 
