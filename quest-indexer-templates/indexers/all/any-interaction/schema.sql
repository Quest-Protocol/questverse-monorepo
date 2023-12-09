CREATE TABLE quest_tracker (
  id SERIAL PRIMARY KEY,
  account_id TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  block_height DECIMAL(58, 0) NOT NULL
);

CREATE TABLE details (
  account_id TEXT NOT NULL,
  num_of_interactions DECIMAL(58, 0) NOT NULL
);

-- Indexes
CREATE INDEX idx_account_id ON quest_tracker(account_id);
