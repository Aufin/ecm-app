-- DROP TABLE acl_class;
  CREATE TABLE IF NOT EXISTS acl_class (
   "name" TEXT PRIMARY KEY,
   "supers" text[],
   "remark" text
  );

  --DROP TABLE IF EXISTS acl_group CASCADE;
  CREATE TABLE IF NOT EXISTS acl_group (
   "name" TEXT UNIQUE,
   "member" TEXT, -- user or group? 
   "remark" text,
   PRIMARY KEY ("name", "member")
  );

CREATE INDEX IF NOT EXISTS idx_member_hash ON acl_group USING hash ("member");

-- drop table if exists acl;
CREATE TABLE IF NOT EXISTS acl (
 "id" bigserial PRIMARY KEY,
 "class" text NOT NULL REFERENCES acl_class("name"),
 "user" text REFERENCES app_user(username),
 "group" text REFERENCES acl_group("name"),
 "create" BOOLEAN NOT NULL DEFAULT FALSE,
 "read" BOOLEAN NOT NULL DEFAULT FALSE,
 "update" BOOLEAN NOT NULL DEFAULT FALSE,
 "delete" BOOLEAN NOT NULL DEFAULT FALSE,
 "statement" JSONB, 
 "remark" text,
 UNIQUE ("class", "user")
 -- PRIMARY KEY ("class", "user")
);

INSERT INTO acl_class("name", "remark") VALUES ('admin_reports',
  'The "Administrator" report section') ON CONFLICT DO NOTHING;


INSERT INTO acl("class", "user", "read", "remark") VALUES
  ('admin_reports', NULL, FALSE, 'The Default for all users without an ACL'),
  ('admin_reports', 'admin', TRUE, 'I like to see things'),

  ('admin_reports', 'Trish', TRUE,
  'An easy win – anything under “Administrator” should only be viewable by me, Cindy and Edith (for now)'),

  ('admin_reports', 'Cindy Locke', TRUE,
  'An easy win – anything under “Administrator” should only be viewable by me, Cindy and Edith (for now)'),

  ('admin_reports', 'Edith Beaumont', TRUE,
  'An easy win – anything under “Administrator” should only be viewable by me, Cindy and Edith (for now)')
  ON CONFLICT DO NOTHING;
