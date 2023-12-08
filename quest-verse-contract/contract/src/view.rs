use near_sdk::env;
use near_sdk::near_bindgen;
// TODO:
// 1. view method for all quests
// 2. quests by deployers
// 3. claimed quests by user
// 4. is_quest_completed -> bool
use crate::quest::Quest;
use crate::QuestId;
use crate::QuestProtocol;
use crate::QuestProtocolExt;
#[near_bindgen]
impl QuestProtocol {
    /**********
     * QUERIES
     **********/

    pub fn is_global_freeze(&self) -> bool {
        self.global_freeze
    }

    pub fn quests(&self) -> Vec<Quest> {
        let quests: Vec<_> = self.quest_by_id.values().collect();
        quests
    }

    pub fn quest_by_id(&self, quest_id: QuestId) -> Option<Quest> {
        self.quest_by_id.get(&quest_id)
    }

    pub fn quests_by_owner(&self) -> Vec<Quest> {
        let quest_ids = self.quest_owner_quest.get(&env::predecessor_account_id());

        let mut quests = Vec::new();

        if let Some(ids) = quest_ids {
            for id in &ids {
                if let Some(quest) = self.quest_by_id.get(id) {
                    quests.push(quest.clone());
                }
            }
        }

        quests
    }
}
