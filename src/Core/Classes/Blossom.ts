import type { APIEmbed } from "discord-api-types/v10";
import type { ContextMenuCommandInteraction, RepliableInteraction } from "discord.js";

export class Blossom {
    private static CreateErrorEmbed(message: string, error_color: number = 0xFFB7C5): APIEmbed {
        const data: APIEmbed = {
            description: message,
            color: error_color
        };

        return data;
    };

    public static async CreateInteractionError(interaction: RepliableInteraction | ContextMenuCommandInteraction, message: string, error_color: number = 0xFFB7C5): Promise<void> {
        if (interaction.deferred || interaction.replied) await interaction.followUp({ embeds: [this.CreateErrorEmbed(message, error_color)], ephemeral: true });
        else await interaction.reply({ embeds: [this.CreateErrorEmbed(message, error_color)], ephemeral: true });
    };

    public static DefaultHex(): number {
        return 0xFFB7C5;
    };
};