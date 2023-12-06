// const TYPES = {

// };

function fetch_step_one_data({}) {
  return {
    project_types: [
      {
        name: "Crypto Currency",
        crypto_currencies: [
          {
            name: "Bitcoin",
            options: ["Lend", "Bridge"],
            actions: {
              Lend: {
                fields: [
                  {
                    name: "network",
                    type: "dropdown",
                    options: ["Option 1", "Option 2", "Option 3"],
                  },
                ],
              },
              Bridge: {
                fields: [
                  {
                    name: "from",
                    type: "dropdown",
                    options: ["Option A", "Option B", "Option C"],
                  },
                  {
                    name: "to",
                    type: "dropdown",
                    options: ["Option X", "Option Y", "Option Z"],
                  },
                  {
                    name: "dropdown_type",
                    type: "dropdown",
                    options: ["Type 1", "Type 2", "Type 3"],
                  },
                ],
              },
            },
          },
          {
            name: "NEAR",
            options: ["Bridge"],
            actions: {
              Lend: {
                fields: [
                  {
                    name: "network",
                    type: "dropdown",
                    options: ["Option 50", "Option 500", "Option 500"],
                  },
                ],
              },
              Bridge: {
                fields: [
                  {
                    name: "from",
                    type: "dropdown",
                    options: ["Option 0", "Option 00", "Option 000"],
                  },
                  {
                    name: "to",
                    type: "dropdown",
                    options: ["Option XXX", "Option YYY", "Option ZZZ"],
                  },
                  {
                    name: "dropdown_type",
                    type: "dropdown",
                    options: ["Type 111", "Type 222", "Type 333"],
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  };
}

return { fetch_step_one_data };
