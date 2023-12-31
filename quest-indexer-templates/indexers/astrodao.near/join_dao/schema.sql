CREATE TABLE
  quest_tracker (
    id SERIAL PRIMARY KEY,
    account_id VARCHAR NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    block_height DECIMAL(58, 0) NOT NULL
  );

CREATE TABLE
  details (
    "account_id" VARCHAR NOT NULL,
    "proposal_id" DECIMAL(58, 0) NOT NULL,
    "receipt" VARCHAR NOT NULL
  );

CREATE INDEX
  idx_account_id ON quest_tracker (account_id);
