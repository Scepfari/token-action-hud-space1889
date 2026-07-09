// System Module Imports
import { ACTION_TYPE, ITEM_TYPE } from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) =>
{
	/**
	 * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
	 */
	ActionHandler = class ActionHandler extends coreModule.api.ActionHandler
	{
		/**
		 * Build system actions
		 * Called by Token Action HUD Core
		 * @override
		 * @param {array} groupIds
		 */a
		async buildSystemActions(groupIds)
		{
			// Set actor and token variables
			//this.actors = (!this.actor) ? this.actors() : [this.actor]
			this.actorType = this.actor?.type

			// Settings
			this.displayUnequipped = Utils.getSetting('displayUnequipped')

			// Set items variable
			if (this.actor)
			{
				let items = this.actor.items
				items = coreModule.api.Utils.sortItemsByName(items)
				this.items = items
			}

			if (this.actorType !== 'vehicle' && this.actorType != undefined) 
			{
				this.#buildCharacterActions()
			}
			else if (this.actorType === 'vehicle') 
			{
				this.#buildVehicleActions()
			}
			else if (!this.actor)
			{
				this.#buildMultipleTokenActions()
			}
		}

		/**
		 * Build character actions
		 * @private
		 */
		#buildCharacterActions() 
		{
			this.#buildAttributes();
			this.#buildSkills();
			this.#buildExtendedActions();
			this.#buildFight();
			this.#buildInventory();
		}

		#buildVehicleActions()
		{
			this.#buildVehicleCrew();
			this.#buildManoeuvre();
		}

		/**
		 * Build multiple token actions
		 * @private
		 * @returns {object}
		 */
		#buildMultipleTokenActions()
		{
		}

		/**
		 * Build inventory
		 * @private
		 */
		async #buildInventory() 
		{
			if (this.items.size === 0) return

			const actionTypeId = 'item'
			const inventoryMap = new Map()

			for (const [itemId, itemData] of this.items) 
			{
				const type = itemData.type
				const equipped = this.actor ? this.actor.canDoUseItem(itemData) : itemData.system.containerId == "";

				if (equipped || this.displayUnequipped)
				{
					const typeMap = inventoryMap.get(type) ?? new Map()
					typeMap.set(itemId, itemData)
					inventoryMap.set(type, typeMap)
				}
			}

			for (const [type, typeMap] of inventoryMap)
			{
				const groupId = ITEM_TYPE[type]?.groupId;

				if (!groupId)
					continue;

				const groupData = { id: groupId, type: 'system' };

				// Get actions
				const actions = [...typeMap].map(([itemId, itemData]) =>
				{
					const id = itemId
					const name = itemData.name
					const encodedValue = [actionTypeId, id].join(this.delimiter)
					const tooltip = itemData.getInfoText(false);

					return {
						id,
						name,
						encodedValue,
						tooltip: { content: tooltip }
					};
				})

				// TAH Core method to add actions to the action list
				this.addActions(actions, groupData)
			}
		}

		async #buildAttributes()
		{
			if (!this.actor?.derived?.abilities || this.actor.type === 'vehicle')
				return;

			const abilities = this.actor.derived.abilities;
			const secondaries = this.actor.derived.secondaries;
			if (Object.entries(abilities).length === 0)
				return;


			const actionTypeId = 'attribute'
			const attributeMap = new Map()

			let type = "primary";
			for (const [key, attributeData] of Object.entries(abilities)) 
			{
				const primeMap = attributeMap.get(type) ?? new Map()
				primeMap.set(key, attributeData)
				attributeMap.set(type, primeMap)
			}

			type = "secondary";
			for (const [key, attributeData] of Object.entries(secondaries))
			{
				const secMap = attributeMap.get(type) ?? new Map();
				secMap.set(key, attributeData);
				attributeMap.set(type, secMap);
			}

			type = "talent";
			for (const talent of this.actor.talents)
			{
				if (talent.system.id != "geschaerfterSinn")
					continue;

				const talentMap = attributeMap.get(type) ?? new Map();
				talentMap.set(talent.system.id, talent);
				attributeMap.set(type, talentMap);
			}

			for (const [type, typeMap] of attributeMap)
			{
				const groupId = type;

				if (!groupId)
					continue;

				const groupData = { id: groupId, type: 'system' }

				// Get actions
				const actions = [...typeMap].map(([key, data]) =>
				{
					if (type == "talent")
					{
						return {
							id: key,
							name: data.derived.label,
							encodedValue: [type, key].join(this.delimiter),
							info1: {
								text: '(' + this.actor.getItemDiceCount(data) + ')'
							},
							tooltip: { content: data.getInfoText(false) }
						}
					}

					const name = type == "primary" ? game.i18n.localize(game.space1889.config.abilities[key]) : data.label;
					const desc = type == "primary" ? this.actor.getAbilityInfoText(key, false) : this.actor.getSecondaryInfoText(key, false);

					return {
						id: key,
						name: name,
						encodedValue: [type, key].join(this.delimiter),
						info1: {
							text: '(' + data.total + ')'
						},
						tooltip: { content: desc }
					}

				});

				// TAH Core method to add actions to the action list
				this.addActions(actions, groupData);
			}
		}

		async #buildFight()
		{
			if (!this.actor)
				return;

			const theMap = new Map();
			let type = "fightWeapons";
			for (const weapon of this.actor.weapons) 
			{
				const equipped = this.actor ? this.actor.canDoUseItem(weapon) : weapon.system.containerId == "";
				if (!equipped)
					continue;

				const isHeld = this.#isHeld(weapon, this.actor.type);
				if (isHeld || this.displayUnequipped)
				{
					const map = theMap.get(type) ?? new Map();
					map.set(weapon.system.id, weapon);
					theMap.set(type, map);
				}
			}

			type = "fightShields";
			for (const shield of this.actor.shields)
			{
				const equipped = this.actor ? this.actor.canDoUseItem(shield) : shield.system.containerId == "";
				if (!equipped)
					continue;

				const isHeld = this.#isHeld(shield, this.actor.type);
				if (isHeld || this.displayUnequipped)
				{
					const map = theMap.get(type) ?? new Map();
					map.set(shield.system.id, shield);
					theMap.set(type, map);
				}
			}

			type = "fightTalent";
			const fightTalents = ["paralysierenderSchlag", "assassine", "eigenartigerKampfstil"];
			for (const talent of this.actor.talents)
			{
				if (fightTalents.findIndex(e => e === talent.system.id) < 0)
					continue;

				const talentMap = theMap.get(type) ?? new Map();
				talentMap.set(talent.system.id, talent);
				theMap.set(type, talentMap);
			}

			type = "defense";
			const defenses = ['defense', 'activeDefense', 'passiveDefense', 'totalDefense'];
			for (const defType of defenses)
			{
				if (this.actor.type === 'vehicle' && defType === "activeDefense")
					continue;

				const defenseMap = theMap.get(type) ?? new Map();
				defenseMap.set(defType, this.actor.derived.secondaries.defense);
				theMap.set(type, defenseMap);
			}
			if (!['creature', 'vehicle'].includes(this.actor.type))
			{
				const defenseMap = theMap.get(type) ?? new Map();
				defenseMap.set('block', this.actor.derived.block);
				defenseMap.set('parry', this.actor.derived.parry);
				defenseMap.set('evasion', this.actor.derived.evasion);
				theMap.set(type, defenseMap);
			}

			type = "damage";
			const damageTypes = this.actor.type == 'vehicle' ? ['lethal', 'controls','propulsion', 'guns', 'crew'] : ['nonLethal', 'lethal'];
			for (const damType of damageTypes)
			{
				const defenseMap = theMap.get(type) ?? new Map();
				defenseMap.set(damType, null);
				theMap.set(type, defenseMap);
			}

			for (const [type, typeMap] of theMap)
			{
				const groupId = type;
				if (!groupId)
					continue;

				const groupData = { id: groupId, type: 'system' }
				let encodeType = this.#getEncodeType(type);

				// Get actions
				const actions = [...typeMap].map(([key, data]) =>
				{
					let tooltip = "";
					let icon = "";
					let isHeld = false;
					let diceCount = 0;
					let name = "";
					if (['block', 'parry', 'evasion'].includes(key))
					{
						tooltip = `<p>${data.info}</p>`;
						diceCount = data.value;
						name = data.label;
					}
					else if (defenses.includes(key))
					{
						const info = this.#getDefenseInfo(key, data)
						tooltip = info.tooltip;
						diceCount = info.diceCount;
						name = info.name;
					}
					else if (type === 'damage')
					{
						tooltip = game.i18n.localize("SPACE1889.AddDamage");
						diceCount = null;
						name = this.#getDamageName(key, this.actor.type);
					}
					else
					{
						name = data.derived.label;
						diceCount = this.actor.getItemDiceCount(data);
						tooltip = data.getInfoText(false);
						isHeld = this.#isHeld(data, this.actor.type, true);
						if (isHeld)
						{
							icon = `<i class="${data.system.usedHandsIcon}" title="${data.system.usedHandsInfo}"></i>`;
						}
					}
					return {
						id: key,
						name: name,
						encodedValue: [encodeType, key].join(this.delimiter),
						info1: {
							text: diceCount != null ? `(${diceCount})` : "",
						},
						icon1: icon,
						tooltip: { content: tooltip }
					}
				});

				// TAH Core method to add actions to the action list
				this.addActions(actions, groupData);
			}
		}

		async #buildSkills()
		{
			if (!this.actor)
				return;

			const theMap = new Map();
			let type = "skill";
			for (const skill of this.actor.skills) 
			{
				const map = theMap.get(type) ?? new Map();
				map.set(skill.system.id, skill);
				theMap.set(type, map);
			}
			type = "specialization";
			for (const spezi of this.actor.speciSkills)
			{
				const speziMap = theMap.get(type) ?? new Map();
				speziMap.set(spezi.system.id, spezi);
				theMap.set(type, speziMap);
			}

			type = "generalSkill";
			const genMap = theMap.get(type) ?? new Map();
			genMap.set("idDieKeinerBraucht", {});
			theMap.set(type, genMap);


			for (const [type, typeMap] of theMap)
			{
				const groupId = type;
				if (!groupId)
					continue;

				const groupData = { id: groupId, type: 'system' };

				const actions = [...typeMap].map(([key, skillData]) =>
				{
					let tooltip = "";
					let name = type == "generalSkill" ? game.i18n.localize("SPACE1889.KeyRollAnySkill") : skillData.derived.label;
					let infoText = type == "generalSkill" ?  "" : `(${skillData.system.rating})`;
					if (type == "generalSkill")
					{
						tooltip = `<p>${game.i18n.localize("SPACE1889.InfoRollAnySkill")}</p>`;
					}
					else if (type == "skill")
						tooltip = skillData.getInfoText(false);
					else
					{
						const skillItem = this.actor.skills.find((x) => x.system.id === skillData.system.underlyingSkillId);
						if (skillItem)
							tooltip = skillItem.derived.label;
					}

					return {
						id: key,
						name: name,
						encodedValue: [type, key].join(this.delimiter),
						info1: {
							text: infoText
						},
						tooltip: { content: tooltip }
					}
				});

				// TAH Core method to add actions to the action list
				this.addActions(actions, groupData);
			}
		}

		async #buildExtendedActions()
		{
			if (!this.actor)
				return;

			const theMap = new Map();
			let type = "extendedActions";
			for (const extendedAction of this.actor.extendedActions) 
			{
				const finished = extendedAction.system.successes >= extendedAction.system.totalNumberOfSuccesses;
				if (finished)
					continue;

				const map = theMap.get(type) ?? new Map();
				map.set(extendedAction.id, extendedAction);
				theMap.set(type, map);
			}

			for (const [type, typeMap] of theMap)
			{
				const groupId = type;
				if (!groupId)
					continue;

				const groupData = { id: groupId, type: 'system' };

				const actions = [...typeMap].map(([key, data]) =>
				{
					return {
						id: key,
						name: data.derived.label,
						encodedValue: [type, key].join(this.delimiter),
						info1: {
							text: `(${data.system.successes} / ${data.system.totalNumberOfSuccesses})`
						},
						tooltip: { content: data.getInfoText(false) }
					}
				});

				this.addActions(actions, groupData);
			}
		}

		async #buildManoeuvre()
		{
			if (!this.actor || this.actor.type != "vehicle")
				return;

			let type = "manoeuvre";
			const manoeuvres = Object.entries(game.space1889.config.vehicleManoeuvres);
			const groupData = { id: type, type: 'system' };

			// Get actions
			const actions = [...manoeuvres].map(([key, langId]) =>
			{
				const tooltip = `<p>${game.i18n.localize(langId + "Desc")}</p>`;
				const name = game.i18n.localize(langId);
				let infoText = "";
				if (key === 'defense')
					infoText = `(${this.actor?.derived?.secondaries?.defense?.total})`;
				else if (key === 'totalDefense')
					infoText = `(${this.actor?.derived?.secondaries?.defense?.totalDefense})`;

				return {
					id: key,
					name: name,
					encodedValue: [type, key].join(this.delimiter),
					info1: {
						text: infoText,
					},
					tooltip: { content: tooltip }
				}
			});

			// TAH Core method to add actions to the action list
			this.addActions(actions, groupData);
		}

		#buildVehicleCrew()
		{
			if (!this.actor || this.actor.type != "vehicle")
				return;

			let type = "vehicleCrew";
			const crew = Object.entries(game.space1889.config.vehicleCrewPositions);
			const groupData = { id: type, type: 'system' };

			// Get actions
			const actions = [...crew].map(([key, langId]) =>
			{
				const tooltip = `<p>${game.i18n.localize(langId + "Desc")}</p>`;
				const name = game.i18n.localize(langId);
				let diceCount = this.actor.derived?.positions[key]?.total != undefined ? this.actor.derived.positions[key].total : 0;

				return {
					id: key,
					name: name,
					encodedValue: [type, key].join(this.delimiter),
					info1: {
						text: `(${diceCount})`,
					},
					tooltip: { content: tooltip }
				}
			});

			// TAH Core method to add actions to the action list
			this.addActions(actions, groupData);
		}

		#isHeld(item, actorType, ignoreActorType = false)
		{
			if (actorType == 'creature' && !ignoreActorType)
				return true;

			if (!item?.system?.usedHands)
				return false;

			return ["primaryHand", "offHand", "bothHands"].includes(item.system.usedHands);
		}

		#getDefenseInfo(key, defenseData)
		{
			if (key === 'defense')
				return {
					tooltip: `<p>${game.i18n.localize("SPACE1889.SecondaryAttributeDefDesc")}</p>`,
					diceCount: defenseData.total,
					name: game.i18n.localize("SPACE1889.SecondaryAttributeDef")
				};

			if (key === 'activeDefense')
				return {
					tooltip: `<p>${game.i18n.localize(this.actor.type === 'vehicle' ? "SPACE1889.ActiveDefenseVehicleDesc" : "SPACE1889.ActiveDefenseDesc")}</p>`,
					diceCount: defenseData.activeTotal,
					name: game.i18n.localize("SPACE1889.ActiveDefense")
				};

			if (key === 'passiveDefense')
				return {
					tooltip: `<p>${game.i18n.localize("SPACE1889.PassiveDefenseDesc")}</p>`,
					diceCount: defenseData.passiveTotal,
					name: game.i18n.localize("SPACE1889.PassiveDefense")
				};

			if (key === 'totalDefense')
				return {
					tooltip: `<p>${game.i18n.localize("SPACE1889.TotalDefenseDesc")}</p>`,
					diceCount: defenseData.totalDefense,
					name: game.i18n.localize("SPACE1889.TotalDefense")
				};

			return {
				tooltip: "",
				diceCount: 0,
				name: "unknown"
			}

		}

		#getEncodeType(type)
		{
			if (type === 'fightTalent')
				return 'talent';
			if (type === 'fightShields')
				return 'weapon';
			if (type === 'fightWeapons')
				return 'weapon';

			return type;
		}

		#getDamageName(key, actorType)
		{
			if (actorType === 'vehicle')
				return game.i18n.localize(game.space1889.config.vehicleDamageTypes[key]);

			return game.i18n.localize(game.space1889.config.damageTypes[key]);
		}
	}
})
