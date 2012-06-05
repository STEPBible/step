create table bookmark (
  id                        integer not null,
  bookmark_reference        varchar(255) not null,
  user_id                   integer,
  constraint pk_bookmark primary key (id))
;

create table dictionary_article (
  id                        integer not null,
  headword                  varchar(255),
  headword_instance         integer,
  clazz                     varchar(255),
  status                    varchar(255),
  source                    integer,
  text                      clob,
  constraint ck_dictionary_article_source check (source in (0)),
  constraint pk_dictionary_article primary key (id))
;

create table geo_place (
  id                        integer not null,
  esv_name                  varchar(255),
  root                      varchar(255),
  latitude                  double(17),
  longitude                 double(17),
  comment                   varchar(255),
  precision                 integer,
  constraint ck_geo_place_precision check (precision in (0,1,2)),
  constraint pk_geo_place primary key (id))
;

create table history (
  id                        integer not null,
  history_reference         varchar(255) not null,
  user_id                   integer,
  last_updated              timestamp not null,
  constraint pk_history primary key (id))
;

create table hot_spot (
  id                        integer not null,
  start                     timestamp,
  end                       timestamp,
  description               varchar(255),
  scale                     integer,
  color                     varchar(255),
  magnify                   double,
  constraint ck_hot_spot_scale check (scale in (0,1,2,3,4,5,6)),
  constraint pk_hot_spot primary key (id))
;

create table morphology (
  code                      varchar(255) not null,
  function                  integer,
  tense                     integer,
  voice                     integer,
  mood                      integer,
  word_case                 integer,
  person                    integer,
  number                    integer,
  gender                    integer,
  suffix                    integer,
  root_code                 varchar(255),
  constraint ck_morphology_function check (function in (0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23)),
  constraint ck_morphology_tense check (tense in (0,1,2,3,4,5,6,7,8,9,10,11,12,13,14)),
  constraint ck_morphology_voice check (voice in (0,1,2,3,4,5,6,7,8)),
  constraint ck_morphology_mood check (mood in (0,1,2,3,4,5)),
  constraint ck_morphology_word_case check (word_case in (0,1,2,3,4)),
  constraint ck_morphology_person check (person in (0,1,2,3,4)),
  constraint ck_morphology_number check (number in (0,1)),
  constraint ck_morphology_gender check (gender in (0,1,2,3,4,5,6,7,8)),
  constraint ck_morphology_suffix check (suffix in (0,1,2,3,4,5,6,7)),
  constraint pk_morphology primary key (code))
;

create table scripture_reference (
  id                        integer not null,
  geo_place_id              integer,
  timeline_event_id         integer,
  dictionary_article_id     integer,
  target_type               integer,
  start_verse_id            integer,
  end_verse_id              integer,
  constraint ck_scripture_reference_target_type check (target_type in (0,1,2)),
  constraint pk_scripture_reference primary key (id))
;

create table session (
  id                        integer not null,
  j_session_id              varchar(255),
  user_id                   integer,
  ip_address                varchar(255),
  expires_on                timestamp,
  constraint uq_session_j_session_id unique (j_session_id),
  constraint pk_session primary key (id))
;

create table strong_definition (
  id                        integer not null,
  original_language         varchar(255),
  transliteration           varchar(255),
  pronunciation             varchar(255),
  kjv_definition            varchar(255),
  strongs_derivation        varchar(255),
  lexicon_summary           varchar(255),
  constraint pk_strong_definition primary key (id))
;

create table timeline_event (
  id                        integer not null,
  summary                   varchar(255),
  from_date                 timestamp,
  to_date                   timestamp,
  from_precision            integer,
  to_precision              integer,
  constraint ck_timeline_event_from_precision check (from_precision in (0,1,2,3)),
  constraint ck_timeline_event_to_precision check (to_precision in (0,1,2,3)),
  constraint pk_timeline_event primary key (id))
;

create table timeline_events_and_date (
  date_time                 timestamp)
;

create table users (
  id                        integer not null,
  name                      varchar(255),
  password                  varbinary(255) not null,
  salt                      varbinary(255) not null,
  email_address             varchar(255) not null,
  country                   varchar(255),
  language                  varchar(255),
  constraint pk_users primary key (id))
;

create sequence bookmark_seq;

create sequence dictionary_article_seq;

create sequence geo_place_seq;

create sequence history_seq;

create sequence hot_spot_seq;

create sequence morphology_seq;

create sequence scripture_reference_seq;

create sequence session_seq;

create sequence strong_definition_seq;

create sequence timeline_event_seq;

create sequence users_seq;

alter table bookmark add constraint fk_bookmark_user_1 foreign key (user_id) references users (id) on delete restrict on update restrict;
create index ix_bookmark_user_1 on bookmark (user_id);
alter table history add constraint fk_history_user_2 foreign key (user_id) references users (id) on delete restrict on update restrict;
create index ix_history_user_2 on history (user_id);
alter table scripture_reference add constraint fk_scripture_reference_geoPlac_3 foreign key (geo_place_id) references geo_place (id) on delete restrict on update restrict;
create index ix_scripture_reference_geoPlac_3 on scripture_reference (geo_place_id);
alter table scripture_reference add constraint fk_scripture_reference_timelin_4 foreign key (timeline_event_id) references timeline_event (id) on delete restrict on update restrict;
create index ix_scripture_reference_timelin_4 on scripture_reference (timeline_event_id);
alter table scripture_reference add constraint fk_scripture_reference_diction_5 foreign key (dictionary_article_id) references dictionary_article (id) on delete restrict on update restrict;
create index ix_scripture_reference_diction_5 on scripture_reference (dictionary_article_id);
alter table session add constraint fk_session_user_6 foreign key (user_id) references users (id) on delete restrict on update restrict;
create index ix_session_user_6 on session (user_id);


