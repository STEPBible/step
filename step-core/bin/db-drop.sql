SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists bookmark;

drop table if exists dictionary_article;

drop table if exists geo_place;

drop table if exists history;

drop table if exists hot_spot;

drop table if exists morphology;

drop table if exists scripture_reference;

drop table if exists session;

drop table if exists strong_definition;

drop table if exists timeline_event;

drop table if exists timeline_events_and_date;

drop table if exists users;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence if exists bookmark_seq;

drop sequence if exists dictionary_article_seq;

drop sequence if exists geo_place_seq;

drop sequence if exists history_seq;

drop sequence if exists hot_spot_seq;

drop sequence if exists morphology_seq;

drop sequence if exists scripture_reference_seq;

drop sequence if exists session_seq;

drop sequence if exists strong_definition_seq;

drop sequence if exists timeline_event_seq;

drop sequence if exists users_seq;

