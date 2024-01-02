CREATE TABLE
  quest_tracker (
    id SERIAL PRIMARY KEY,
    account_id VARCHAR NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    block_height DECIMAL(58, 0) NOT NULL
  );

CREATE TABLE
  quest_details (
    account_id VARCHAR NOT NULL,
    block_height DECIMAL(58, 0) NOT NULL
    token_amount_swapped VARCHAR,
    pair_name VARCHAR,
    receipt VARCHAR NOT NULL
  );

CREATE INDEX
  idx_account_id ON quest_tracker (account_id);

CREATE INDEX
  idx_account_id ON quest_details (account_id, block_height);
