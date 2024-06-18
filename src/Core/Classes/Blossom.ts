import type { APIEmbed } from "discord-api-types/v10";
import type { ContextMenuCommandInteraction, RepliableInteraction } from "discord.js";

export class Blossom {
    /**
     * Creates an interaction ephemeral response to be used for the error system
     * @param {RepliableInteraction | ContextMenuCommandInteraction} interaction - Your interaction class for creating the interaction response
     * @param {string} message - The error message
     * @param {number} error_color - The error color
     * 
     * @example
     * ```ts
     * await Blossom.CreateInteractionError(interaction, "You are unauthorized to use Blossom."");
     * ```
     */
    public static async CreateInteractionError(interaction: RepliableInteraction | ContextMenuCommandInteraction, message: string, error_color: number = 0xFFB7C5): Promise<undefined> {
        if (interaction.deferred || interaction.replied) return void await interaction.followUp({ embeds: [this.CreateErrorEmbed(message, error_color)], ephemeral: true });
        else return void await interaction.reply({ embeds: [this.CreateErrorEmbed(message, error_color)], ephemeral: true });
    };

    /**
     * Returns Blossom default hex code, can be changed for holidays
     * 
     * @example
     * ```ts
     * Blossom.DefaultHex();
     * ```
     */
    public static DefaultHex(): number {
        return 0xFFB7C5;
    };

    /**
     * Creates an embed to be used in the error system
     * @param {string} message - The error message to use in the embed description
     * @param {number} error_color - The error color to use in the embed color
     */
    private static CreateErrorEmbed(message: string, error_color: number = 0xFFB7C5): APIEmbed {
        const data: APIEmbed = {
            description: message,
            color: error_color
        };

        return data;
    };
};