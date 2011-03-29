create table bookmark (
  id                        integer not null,
  bookmark_reference        varchar(255) not null,
  user_id                   integer,
  constraint pk_bookmark primary key (id))
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
  description               varchar(255),
  code                      varchar(255),
  scale                     integer,
  timeband_id               integer,
  constraint ck_hot_spot_scale check (scale in (0,1,2,3,4,5,6)),
  constraint pk_hot_spot primary key (id))
;

create table scripture_reference (
  scripture_reference_id    integer not null,
  target_id                 integer,
  target_type               integer,
  start_verse_id            integer,
  end_verse_id              integer,
  constraint ck_scripture_reference_target_type check (target_type in (0)),
  constraint pk_scripture_reference primary key (scripture_reference_id))
;

create table scripture_target (
  targetTypeId              integer(31) not null,
  id                        integer not null,
  summary                   varchar(255),
  from_date                 bigint,
  to_date                   bigint,
  from_precision            integer,
  to_precision              integer,
  hot_spot_id               integer,
  constraint ck_scripture_target_from_precision check (from_precision in (0,1,2,3)),
  constraint ck_scripture_target_to_precision check (to_precision in (0,1,2,3)),
  constraint pk_scripture_target primary key (id))
;

create table session (
  id                        integer not null,
  j_session_id              varchar(255),
  user_id                   integer,
  ip_address                varchar(255),
  expires_on                timestamp,
  constraint pk_session primary key (id))
;

create table timeband (
  id                        integer not null,
  code                      varchar(255),
  scale                     integer,
  description               varchar(255),
  constraint ck_timeband_scale check (scale in (0,1,2,3,4,5,6)),
  constraint pk_timeband primary key (id))
;

create table users (
  id                        integer not null,
  name                      varchar(255),
  password                  varchar(255),
  email_address             varchar(255),
  country                   varchar(255),
  constraint pk_users primary key (id))
;

create sequence bookmark_seq;

create sequence history_seq;

create sequence hot_spot_seq;

create sequence scripture_reference_seq;

create sequence scripture_target_seq;

create sequence session_seq;

create sequence timeband_seq;

create sequence users_seq;

alter table bookmark add constraint fk_bookmark_user_1 foreign key (user_id) references users (id) on delete restrict on update restrict;
create index ix_bookmark_user_1 on bookmark (user_id);
alter table history add constraint fk_history_user_2 foreign key (user_id) references users (id) on delete restrict on update restrict;
create index ix_history_user_2 on history (user_id);
alter table hot_spot add constraint fk_hot_spot_timeband_3 foreign key (timeband_id) references timeband (id) on delete restrict on update restrict;
create index ix_hot_spot_timeband_3 on hot_spot (timeband_id);
alter table scripture_reference add constraint fk_scripture_reference_target_4 foreign key (target_id) references scripture_target (id) on delete restrict on update restrict;
create index ix_scripture_reference_target_4 on scripture_reference (target_id);
alter table scripture_target add constraint fk_scripture_target_hotSpot_5 foreign key (hot_spot_id) references hot_spot (id) on delete restrict on update restrict;
create index ix_scripture_target_hotSpot_5 on scripture_target (hot_spot_id);
alter table session add constraint fk_session_user_6 foreign key (user_id) references users (id) on delete restrict on update restrict;
create index ix_session_user_6 on session (user_id);


