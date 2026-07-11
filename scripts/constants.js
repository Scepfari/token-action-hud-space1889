/**
 * Module-based constants
 */
export const MODULE = {
	ID: 'token-action-hud-space1889'
}

/**
 * Core module
 */
export const CORE_MODULE = {
	ID: 'token-action-hud-core'
}

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = '2'

/**
 * Action types
 */
export const ACTION_TYPE = {
	item: 'tokenActionHud.space1889.item',
	utility: 'tokenActionHud.utility'
}

/**
 * Groups
 */
export const GROUP = {
	armor: { id: 'armor', name: 'tokenActionHud.space1889.armor', type: 'system' },
	equipment: { id: 'equipment', name: 'tokenActionHud.space1889.equipment', type: 'system' },
	visions: { id: 'visions', name: 'tokenActionHud.space1889.visions', type: 'system' },
	lightSources: { id: 'lightSources', name: 'tokenActionHud.space1889.lightSources', type: 'system' },
	containers: { id: 'containers', name: 'tokenActionHud.space1889.containers', type: 'system' },
	shields: { id: 'shields', name: 'tokenActionHud.space1889.shields', type: 'system' },
	weapons: { id: 'weapons', name: 'tokenActionHud.space1889.weapons', type: 'system' },
	combat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system' },
	token: { id: 'token', name: 'tokenActionHud.token', type: 'system' },
	utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system' },
	primary: { id: 'primary', name: 'tokenActionHud.space1889.primaryAttributes', type: 'system' },
	secondary: { id: 'secondary', name: 'tokenActionHud.space1889.secondaryAttributes', type: 'system' },
	skill: { id: 'skill', name: 'tokenActionHud.space1889.skills', type: 'system' },
	specialization: { id: 'specialization', name: 'tokenActionHud.space1889.specialization', type: 'system' },
	generalSkill: { id: 'generalSkill', name: 'tokenActionHud.space1889.general', type: 'system' },
	talent: { id: 'talent', name: 'tokenActionHud.space1889.talents', type: 'system' },
	extendedActions: { id: 'extendedActions', name: 'tokenActionHud.space1889.extendedActions', type: 'system' },
	fightTalent: { id: 'fightTalent', name: 'tokenActionHud.space1889.talents', type: 'system' },
	fightShields: { id: 'fightShields', name: 'tokenActionHud.space1889.shields', type: 'system' },
	fightWeapons: { id: 'fightWeapons', name: 'tokenActionHud.space1889.weapons', type: 'system' },
	defense: { id: 'defense', name: 'tokenActionHud.space1889.defense', type: 'system' },
	combatManeuvers: { id: 'combatManeuvers', name: 'tokenActionHud.space1889.combatManeuvers', type: 'system' },
	damage: { id: 'damage', name: 'tokenActionHud.space1889.damage', type: 'system' },
	manoeuvre: { id: 'manoeuvre', name: 'tokenActionHud.space1889.manoeuvre', type: 'system' },
	vehicleCrew: { id: 'vehicleCrew', name: 'tokenActionHud.space1889.crew', type: 'system' },
}

/**
 * Item types
 */
export const ITEM_TYPE = {
	armor: { groupId: 'armor' },
	container: { groupId: 'containers' },
	item: { groupId: 'equipment' },
	shield: { groupId: 'shields' },
	weapon: { groupId: 'weapons' },
	vision: { groupId: 'visions' },
	lightSource: {groupId: 'lightSources' }
}
