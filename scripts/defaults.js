import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) =>
{
	const groups = GROUP
	Object.values(groups).forEach(group =>
	{
		group.name = coreModule.api.Utils.i18n(group.name)
		group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
	})
	const groupsArray = Object.values(groups)
	DEFAULTS = {
		layout: [
			{
				nestId: 'attributes',
				id: 'attributes',
				name: coreModule.api.Utils.i18n('tokenActionHud.space1889.attributes'),
				groups: [
					{ ...groups.primary, nestId: 'attributes_primary' },
					{ ...groups.secondary, nestId: 'attributes_secondary' },
					{ ...groups.talent, nestId: 'attributes_talents' }
				]
			},
			{
				nestId: 'skills',
				id: 'skills',
				name: coreModule.api.Utils.i18n('tokenActionHud.space1889.skills'),
				groups: [
					{ ...groups.skill, nestId: 'skills_skill' },
					{ ...groups.specialization, nestId: 'skills_specialization' },
					{ ...groups.generalSkill, nestId: 'skills_generalSkill' }
				]
			},
			{
				nestId: 'extendedAction',
				id: 'extendedAction',
				name: coreModule.api.Utils.i18n('tokenActionHud.space1889.extendedActions'),
				groups: [
					{ ...groups.extendedActions, nestId: 'extendedAction_extendedActions' },
				]
			},
			{
				nestId: 'fight',
				id: 'fight',
				name: coreModule.api.Utils.i18n('tokenActionHud.space1889.fight'),
				groups: [
					{ ...groups.fightWeapons, nestId: 'fight_fightWeapons' },
					{ ...groups.fightShields, nestId: 'fight_fightShields' },
					{ ...groups.fightTalent, nestId: 'fight_fightTalents' },
					{ ...groups.defense, nestId: 'fight_defense' },
					{ ...groups.damage, nestId: 'fight_damage' }
				]
			},
			{
				nestId: 'inventory',
				id: 'inventory',
				name: coreModule.api.Utils.i18n('tokenActionHud.space1889.inventory'),
				groups: [
					{ ...groups.weapons, nestId: 'inventory_weapons' },
					{ ...groups.armor, nestId: 'inventory_armor' },
					{ ...groups.shields, nestId: 'inventory_shields' },
					{ ...groups.equipment, nestId: 'inventory_equipment' },
					{ ...groups.lightSources, nestId: 'inventory_lightSources' },
					{ ...groups.visions, nestId: 'inventory_visions' },
					{ ...groups.containers, nestId: 'inventory_containers' },
				]
			},
			{
				nestId: 'crew',
				id: 'crew',
				name: coreModule.api.Utils.i18n('tokenActionHud.space1889.crew'),
				groups: [
					{ ...groups.vehicleCrew, nestId: 'crew_vehicleCrew' },
				]
			},
			{
				nestId: 'manoeuvre',
				id: 'manoeuvre',
				name: coreModule.api.Utils.i18n('tokenActionHud.space1889.manoeuvre'),
				groups: [
					{ ...groups.manoeuvre, nestId: 'manoeuvre_manoeuvre' },
				]
			},
			{
				nestId: 'utility',
				id: 'utility',
				name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
				groups: [
					{ ...groups.combat, nestId: 'utility_combat' },
					{ ...groups.token, nestId: 'utility_token' },
					{ ...groups.rests, nestId: 'utility_rests' },
					{ ...groups.utility, nestId: 'utility_utility' }
				]
			}
		],
		groups: groupsArray
	}
})
