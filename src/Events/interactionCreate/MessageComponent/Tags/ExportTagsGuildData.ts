import { AttachmentBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindTag, Sentry, type TagSystem } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || !interaction.customId.startsWith("ExportTagsGuildData")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    const tags = await FindTag(interaction.guild.id) as TagSystem[] | null;
    if (!tags) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} doesn't have any tags that exist.`);

    const data = tags.map((tag) => {
        return {
            tagID: tag.BlossomID,
            content: tag.Content,
            creationTimestamp: tag.CreationTimestamp,
            creatorID: tag.CreatorID,
            name: tag.Name,
            requireStaffRole: tag.RequireStaffRole,
            usageCount: tag.UsageCount
        }
    });

    const format = {
        guild_name: interaction.guild.name,
        guild_id: interaction.guild.id,
        total_tags: String(tags.length),
        tag_data: data
    };

    const file_one = new AttachmentBuilder(Buffer.from(JSON.stringify(format, null, 2)), { name: `${interaction.guild.id}.json` });

    return void await interaction.followUp({ content: `Exported tag data belonging to ${interaction.guild.name}.`, files: [file_one], ephemeral: true });
};