CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  "placeId" TEXT DEFAULT '',
  "createdAt" TEXT NOT NULL,
  "reviewStats" JSONB DEFAULT '{"total":0,"average":0,"distribution":{"1":0,"2":0,"3":0,"4":0,"5":0}}'::jsonb
);
