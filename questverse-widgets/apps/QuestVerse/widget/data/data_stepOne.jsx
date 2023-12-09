function fetch_step_one_data({}) {
  return {
    options: [
      {
        name: "ALL",
        actions: {
          "interaction on contract": {
            account_id: "<text_input>",
            number_of_interactions: "<number_input>",
          },
          "interaction for specific method on contract": {
            account_id: "<text_input>",
            method_name: "<text_input>",
            number_of_interactions: "<number_input>",
          },
          transfer: {
            account_id: "<text_input>",
            near_amount: "<number_input>",
          },
        },
      },
      {
        name: "social.near",
        actions: {
          "follow a user": {
            user: "<text_input>",
          },
          "like a post": {
            post_id: "<number_input>",
          },
          repost: {
            post_id: "<number_input>",
          },
          "use hash tag in post": {
            hash_tag: "<text_input>",
          },
          "comment on a post": {
            post_id: "<number_input>",
          },
          // "complete widget metadata information": {},
        },
      },
      {
        name: "astrodao.near",
        actions: {
          "join a dao": {
            dao_account_id: "<text_input>",
            role: "<text_input>",
          },
          "vote on proposal": {
            dao_account_id: "<text_input>",
            proposal_id: "<number_input>",
          },
        },
      },
      {
        name: "near horizon",
        actions: {
          "propose a contribution": {
            project_name: "<input_text>",
          },
        },
      },
      {
        name: "devgogs.near",
        actions: {
          "post a solution": {
            get_number_likes: "<number_input>",
          },
          "reply to a post": {
            id: "<number_input>",
          },
          "interact with community": {
            community_name: "<text_input>",
          },
          "fund a project": {
            "greater than": "<number_input>",
            "less than": "<number_input>",
            equal: "<number_input>",
          },
        },
      },
      {
        name: "Mintbase",
        actions: {
          "Buy NFT from Mintbase": {
            // account_id: "<text_input>",
            // number_of_interactions: "<number_input>",
          },
          "List NFT on Mintbase": {
            // account_id: "<text_input>",
            // method_name: "<text_input>",
            // number_of_interactions: "<number_input>",
          },
          "Create a collection on Mintbase": {
            // account_id: "<text_input>",
            // near_amount: "<number_input>",
          },
        },
      },
      {
        name: "Paras",
        actions: {
          "Buy NFT from Paras": {},
        },
      },
    ],
  };
}

return { fetch_step_one_data };
