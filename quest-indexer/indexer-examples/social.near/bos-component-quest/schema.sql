
CREATE TABLE
  creator_quest (
    account_id VARCHAR PRIMARY KEY,
    num_components_created INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE
  );

CREATE TABLE
  composer_quest (
    account_id VARCHAR PRIMARY KEY,
    num_widgets_composed INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE
  );

CREATE TABLE
  contractor_quest (
    account_id VARCHAR PRIMARY KEY,
    num_contracts_deployed INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE
  );
