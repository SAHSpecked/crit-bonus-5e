const MODULE_ID = "crit-bonus-5e";

// First argument for registering settings is the module's "id" or just "core" for unmanaged settings
Hooks.on("init", () => {
  console.log("------ REGISTERING CRIT BONUS SETTINGS -------");

  game.settings.register(MODULE_ID, "enableCritBonus", {
    name: "Enable Crit Bonus",
    hint: "Add a bonus to the total of all player natural twenty ability tests, skills, tool checks, ability saves, or concentrations.",
    scope: "world", // "world" = sync to db, "client" = local storage
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      // value is the new value of the setting
      console.log("Enable Crit Bonus: " + value);
    },
  });

  game.settings.register(MODULE_ID, "critBonusValue", {
    name: "Crit Bonus Value",
    hint: "The bonus value to add to the total on all player natural twenty ability tests, skills, tool checks, ability saves, or concentrations.",
    scope: "world", // "world" = sync to db, "client" = local storage
    config: true,
    type: Number,
    default: 10,
    onChange: (value) => {
      // value is the new value of the setting
      console.log("Crit Bonus Value: " + value);
    },
  });

  game.settings.register(MODULE_ID, "naturalTwentyMessage", {
    name: "Natural Twenty Message",
    hint: "The message, preceding the Critical Total, on all player natural twentys.",
    scope: "world", // "world" = sync to db, "client" = local storage
    config: true,
    type: String,
    default: "Natural twenty!",
    onChange: (value) => {
      // value is the new value of the setting
      const vt = value.trim();
      game.settings.set(MODULE_ID, "naturalTwentyMessage", vt);
      console.log("Natural Twenty Message: " + vt);
    },
  });

  game.settings.register(MODULE_ID, "naturalOneMessage", {
    name: "Natural One Message",
    hint: "The message on all player natural ones.",
    scope: "world", // "world" = sync to db, "client" = local storage
    config: true,
    type: String,
    default: "Natural one. Oof...",
    onChange: (value) => {
      // value is the new value of the setting
      const vt = value.trim();
      game.settings.set(MODULE_ID, "naturalOneMessage", vt);
      console.log("Natural One Message: " + vt);
    },
  });
});

// v3.1.0
async function checkRollForNaturals(roll) {
  // Get active die number
  let rollValue = null;
  for (const rv of roll.dice[0].results) {
    if (rv.active == true) {
      rollValue = rv.result;
      break;
    }
  }

  // Do things on natural 20 and 1
  if (rollValue == 20) {
    const rollModified = roll._total + game.settings.get(MODULE_ID, "critBonusValue");
    await ChatMessage.create({
      speaker: { alias: "Critical Confirmation" },
      content: `${game.settings.get(MODULE_ID, "naturalTwentyMessage")}<br><br>Critical Total: <b>${rollModified}</b>`,
    });
  } else if (rollValue == 1) {
    await ChatMessage.create({
      speaker: { alias: "Critical Confirmation" },
      content: `${game.settings.get(MODULE_ID, "naturalOneMessage")}`,
    });
  }
}

// v4.1.0
async function checkRollsForNaturals(rolls) {
  // Get active die number
  let rollValue = null;
  for (const rv of rolls[0].d20.results) {
    if (rv.active == true) {
      rollValue = rv.result;
      break;
    }
  }

  // Do things on natural 20 and 1
  if (rollValue == 20) {
    const rollModified = rolls[0].total + game.settings.get(MODULE_ID, "critBonusValue");
    await ChatMessage.create({
      speaker: { alias: "Critical Confirmation" },
      content: `${game.settings.get(MODULE_ID, "naturalTwentyMessage")}<br><br>Critical Total: <b>${rollModified}</b>`,
    });
  } else if (rollValue == 1) {
    await ChatMessage.create({
      speaker: { alias: "Critical Confirmation" },
      content: `${game.settings.get(MODULE_ID, "naturalOneMessage")}`,
    });
  }
}

// v3.1.0
// Modify ability test
Hooks.on("dnd5e.rollAbilityTest", async (actor, roll, abilityId) => {
  if (!game.settings.get(MODULE_ID, "enableCritBonus")) return;
  if (!(game.system.version >= "3.1.0" && game.system.version < "4.1.0")) return;
  if (!actor.hasPlayerOwner) return;

  await checkRollForNaturals(roll);
});

// Modify skill
Hooks.on("dnd5e.rollSkill", async (actor, roll, skillId) => {
  if (!game.settings.get(MODULE_ID, "enableCritBonus")) return;
  if (!(game.system.version >= "3.1.0" && game.system.version < "4.1.0")) return;
  if (!actor.hasPlayerOwner) return;

  await checkRollForNaturals(roll);
});

// Modify tool check
Hooks.on("dnd5e.rollToolCheck", async (actor, roll, toolId) => {
  if (!game.settings.get(MODULE_ID, "enableCritBonus")) return;
  if (!(game.system.version >= "3.1.0" && game.system.version < "4.1.0")) return;
  if (!actor.hasPlayerOwner) return;

  await checkRollForNaturals(roll);
});

// Modify ability save
Hooks.on("dnd5e.rollAbilitySave", async (actor, roll, abilityId) => {
  if (!game.settings.get(MODULE_ID, "enableCritBonus")) return;
  if (!(game.system.version >= "3.1.0" && game.system.version < "4.1.0")) return;
  if (!actor.hasPlayerOwner) return;

  await checkRollForNaturals(roll);
});

// ! CONCENTRATION NOT NEEDED BECAUSE IT IS A SAVE ALREADY !

// v4.1.0
// Modify ability check
Hooks.on("dnd5e.rollAbilityCheck", async (rolls, data, ability, subject) => {
  if (!game.settings.get(MODULE_ID, "enableCritBonus")) return;
  if (!(game.system.version >= "4.1.0")) return;
  if (!data.subject.hasPlayerOwner) return;

  await checkRollsForNaturals(rolls);
});

// Modify saving throw
Hooks.on("dnd5e.rollSavingThrow", async (rolls, data, ability, subject) => {
  if (!game.settings.get(MODULE_ID, "enableCritBonus")) return;
  if (!(game.system.version >= "4.1.0")) return;
  if (!data.subject.hasPlayerOwner) return;

  await checkRollsForNaturals(rolls);
});

// Modify skill
Hooks.on("dnd5e.rollSkillV2", async (rolls, data, skill, tool, subject) => {
  if (!game.settings.get(MODULE_ID, "enableCritBonus")) return;
  if (!(game.system.version >= "4.1.0")) return;
  if (!data.subject.hasPlayerOwner) return;

  await checkRollsForNaturals(rolls);
});

// Modify tool check
Hooks.on("dnd5e.rollToolCheckV2", async (rolls, data, skill, tool, subject) => {
  if (!game.settings.get(MODULE_ID, "enableCritBonus")) return;
  if (!(game.system.version >= "4.1.0")) return;
  if (!data.subject.hasPlayerOwner) return;

  await checkRollsForNaturals(rolls);
});

// ! CONCENTRATION NOT NEEDED BECAUSE IT IS A SAVE ALREADY !
