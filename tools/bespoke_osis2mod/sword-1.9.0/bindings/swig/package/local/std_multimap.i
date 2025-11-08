//file std_multimap.i

%include <std_common.i>


%{
#include <map>
#include <algorithm>
#include <stdexcept>
#include <iostream>
%}

// exported class

namespace std {

        template<class T1, class T2> class multimap {
                // add typemaps here
                public:
                        multimap();
                        multimap(const multimap<T1,T2> &);

                        unsigned int size() const;
                        bool empty() const;
                        void clear();

                        %extend {
                                //need a way to get the first element 
                                const T1 getElementOne(std::multimap<T1,T2>::iterator it) throw (std::out_of_range) {
                                        return it->first;
                                }
                                //and the second
                                T2 getElementTwo(std::multimap<T1,T2>::iterator it) throw (std::out_of_range) {
                                        return it->second;
                                }
                                //nice to have the beginning iterator
                                std::multimap<T1,T2>::iterator getBeginIterator() {
                                        return self->begin();
                                }
                                //and to get the next iterator
                                std::multimap<T1,T2>::iterator getNextIterator(std::multimap<T1,T2>::iterator it) {
                                        if (it != self->end()) {
                                                return ++it;
                                        } else {
                                                return it;
                                        }
                                }
                        }
        };

        //The rest is pretty much straight from std_map.i with name and signature changes
        // specializations for built-ins 

        %define specialize_std_multimap_on_key(K,CHECK,CONVERT_FROM,CONVERT_TO)

                template<class T> class multimap<K,T> {
                        // add typemaps here
                        public:
                                multimap();
                                multimap(const multimap<K,T> &);

                                unsigned int size() const;
                                bool empty() const;
                                void clear();
                                %extend {
                                        T& get(K key) throw (std::out_of_range) {
                                                std::multimap<K,T >::iterator i = self->find(key);
                                                if (i != self->end())
                                                        return i->second;
                                                else
                                                        throw std::out_of_range("key not found");
                                        }
                                        void set(K key, const T& x) {
                                                (*self)[key] = x;
                                        }
                                        void del(K key) throw (std::out_of_range) {
                                                std::multimap<K,T >::iterator i = self->find(key);
                                                if (i != self->end())
                                                        self->erase(i);
                                                else
                                                        throw std::out_of_range("key not found");
                                        }
                                        bool has_key(K key) {
                                                std::multimap<K,T >::iterator i = self->find(key);
                                                return i != self->end();
                                        }
                                }
                };
        %enddef

                %define specialize_std_multimap_on_value(T,CHECK,CONVERT_FROM,CONVERT_TO)
                template<class K> class multimap<K,T> {
                        // add typemaps here
                        public:
                                multimap();
                                multimap(const multimap<K,T> &);

                                unsigned int size() const;
                                bool empty() const;
                                void clear();
                                %extend {
                                        T get(const K& key) throw (std::out_of_range) {
                                                std::multimap<K,T >::iterator i = self->find(key);
                                                if (i != self->end())
                                                        return i->second;
                                                else
                                                        throw std::out_of_range("key not found");
                                        }
                                        void set(const K& key, T x) {
                                                (*self)[key] = x;
                                        }
                                        void del(const K& key) throw (std::out_of_range) {
                                                std::multimap<K,T >::iterator i = self->find(key);
                                                if (i != self->end())
                                                        self->erase(i);
                                                else
                                                        throw std::out_of_range("key not found");
                                        }
                                        bool has_key(const K& key) {
                                                std::multimap<K,T >::iterator i = self->find(key);
                                                return i != self->end();
                                        }
                                }
                };
        %enddef

                %define specialize_std_multimap_on_both(K,CHECK_K,CONVERT_K_FROM,CONVERT_K_TO,
                                T,CHECK_T,CONVERT_T_FROM,CONVERT_T_TO)
                template<> class multimap<K,T> {
                        // add typemaps here
                        public:
                                multimap();
                                multimap(const multimap<K,T> &);

                                unsigned int size() const;
                                bool empty() const;
                                void clear();
                                %extend {
                                        T get(K key) throw (std::out_of_range) {
                                                std::multimap<K,T >::iterator i = self->find(key);
                                                if (i != self->end())
                                                        return i->second;
                                                else
                                                        throw std::out_of_range("key not found");
                                        }
                                        void set(K key, T x) {
                                                (*self)[key] = x;
                                        }
                                        void del(K key) throw (std::out_of_range) {
                                                std::multimap<K,T >::iterator i = self->find(key);
                                                if (i != self->end())
                                                        self->erase(i);
                                                else
                                                        throw std::out_of_range("key not found");
                                        }
                                        bool has_key(K key) {
                                                std::multimap<K,T >::iterator i = self->find(key);
                                                return i != self->end();
                                        }
                                }
                };
        %enddef

                // add specializations here

}
