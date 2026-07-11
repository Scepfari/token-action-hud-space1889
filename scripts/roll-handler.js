export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) =>
{
	/**
	 * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
	 */
	RollHandler = class RollHandler extends coreModule.api.RollHandler
	{
		/**
		 * Handle action click
		 * Called by Token Action HUD Core when an action is left or right-clicked
		 * @override
		 * @param {object} event        The event
		 * @param {string} encodedValue The encoded value
		 */
		async handleActionClick(event, encodedValue)
		{
			const [actionTypeId, actionId] = encodedValue.split('|')

			const renderable = ['item']


			// Do nothing on right click
			if (this.isRightClick && actionTypeId !== 'item')
				return; 

			const knownCharacters = ['character']

			// If single actor is selected
			if (this.actor)
			{
				await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId)
				return
			}

			const controlledTokens = canvas.tokens.controlled
				.filter((token) => knownCharacters.includes(token.actor?.type))

			// If multiple actors are selected
			for (const token of controlledTokens)
			{
				const actor = token.actor
				await this.#handleAction(event, actor, token, actionTypeId, actionId)
			}
		}

		/**
		 * Handle action hover
		 * Called by Token Action HUD Core when an action is hovered on or off
		 * @override
		 * @param {object} event        The event
		 * @param {string} encodedValue The encoded value
		 */
		async handleActionHover(event, encodedValue) { }

		/**
		 * Handle group click
		 * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
		 * @override
		 * @param {object} event The event
		 * @param {object} group The group
		 */
		async handleGroupClick(event, group) { }

		/**
		 * Handle action
		 * @private
		 * @param {object} event        The event
		 * @param {object} actor        The actor
		 * @param {object} token        The token
		 * @param {string} actionTypeId The action type id
		 * @param {string} actionId     The actionId
		 */
		async #handleAction(event, actor, token, actionTypeId, actionId)
		{
			switch (actionTypeId)
			{
				case 'primary':
					this.#handlePrimaryAction(event, actor, actionId);
					break;
				case 'secondary':
					this.#handleSecondaryAction(event, actor, actionId);
					break;
				case 'skill':
					this.#handleSkillAction(event, actor, actionId);
					break;
				case 'specialization':
					this.#handleSpecializationAction(event, actor, actionId)
					break;
				case 'generalSkill':
					this.#handleGeneralSkillAction(actor);
					break;
				case 'talent':
					this.#handleTalentAction(event, actor, actionId)
					break;
				case 'extendedActions':
					this.#handleExtendedAction(event, actor, actionId)
					break;
				case 'weapon':
					this.#handleWeaponAction(event, actor, actionId);
					break;
				case 'combatManeuvers':
					this.#handleCombatManeuvers(event, actor, actionId, token.document);
					break;
				case 'damage':
					this.#handleDamageAction(event, actor, actionId);
					break;
				case 'manoeuvre':
					this.#handleManoeuvreAction(event, actor, actionId);
					break;
				case 'vehicleCrew':
					this.#handleVehicleCrewAction(event, actor, actionId);
					break;
				case 'defense':
					this.#handleDefenseAction(event, actor, actionId);
					break;
				case 'item':
					this.#handleItemAction(event, actor, actionId);
					break
				case 'utility':
					this.#handleUtilityAction(token, actionId);
					break
			}
		}

		/**
		 * Handle primary attribute action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handlePrimaryAction(event, actor, actionId)
		{
			actor.rollPrimary(actionId, event);
		}

		/**
		 * Handle secondary attribute action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleSecondaryAction(event, actor, actionId)
		{
			actor.rollSecondary(actionId, event);
		}

		/**
		 * Handle skill action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleSkillAction(event, actor, actionId)
		{
			actor.rollSkill(actionId, event);
		}

		/**
		 * Handle specialization action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleSpecializationAction(event, actor, actionId)
		{
			actor.rollSpecialization(actionId, event);
		}

		/**
		 * Handle talent action
		 * @private
		 * @param {object} actor    The actor
		 */

		#handleGeneralSkillAction(actor)
		{
			actor.rollAnySkill();
		}

		/**
		 * Handle talent action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleTalentAction(event, actor, actionId)
		{
			actor.rollTalent(actionId, event);
		}

		/**
		 * Handle talent action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleExtendedAction(event, actor, actionId)
		{
			actor.rollExtendedAction(actionId, event);
		}

		/**
		 * Handle weapon action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleWeaponAction(event, actor, actionId)
		{
			actor.rollAttack(actionId, event);
		}

		/**
		 * Handle weapon action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 * @param {object} tokenDocument The token document of the actor
		 */
		#handleCombatManeuvers(event, actor, actionId, tokenDocument)
		{
			actor.rollCombatManoeuver(actionId, tokenDocument, event);
		}

		/**
		 * Handle weapon action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleDamageAction(event, actor, actionId)
		{
			actor.addDamage(actionId, event);
		}

		/**
		 * Handle manoeuvre action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleManoeuvreAction(event, actor, actionId)
		{
			actor.rollManoeuvre(actionId, event);
		}

		/**
		 * Handle manoeuvre action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleVehicleCrewAction(event, actor, actionId)
		{
			actor.rollCrew(actionId, event);
		}

		/**
		 * Handle defense action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleDefenseAction(event, actor, actionId)
		{
			actor.rollDefense(actionId, event);
		}

		/**
		 * Handle item action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		#handleItemAction(event, actor, actionId)
		{
			const item = actor.items.get(actionId);

			if (!this.isAlt && ["lightSource", "shield", "weapon"].includes(item.type) && ["character", "npc"].includes(actor.type))
				actor.setWeaponHand(item, this.isRightClick);
			else
				actor.rollItemInfo(item);
		}

		/**
		 * Handle utility action
		 * @private
		 * @param {object} token    The token
		 * @param {string} actionId The action id
		 */
		async #handleUtilityAction(token, actionId)
		{
			switch (actionId)
			{
				case 'endTurn':
					if (game.combat?.current?.tokenId === token.id)
					{
						await game.combat?.nextTurn()
					}
					break
			}
		}
	}
})
