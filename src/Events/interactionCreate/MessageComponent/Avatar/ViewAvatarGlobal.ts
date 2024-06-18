import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, Sentry } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || !interaction.customId.startsWith("ViewAvatarGlobal")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);

    const custom_id = interaction.customId.split("_");
    const user = await client.users.fetch(custom_id[1]).catch(() => { return undefined });
    if (!user) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the user. The user either no longer exist or ${client.user.username} couldn't fetch the user.`);

    await interaction.deferUpdate();

    const embed_one = new EmbedBuilder()
    .setTitle(`${user.tag}'s Avatar`)
    .setDescription("- **Extension** • Default\n- **Size** • 4096")
    .setImage(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: `ViewAvatarGlobal_${user.id}`,
        style: ButtonStyle.Primary,
        disabled: true,
        label: "Global"
    })
    .CreateRegularButton({
        custom_id: `ViewAvatarGuild_${user.id}`,
        style: ButtonStyle.Secondary,
        label: "Server"
    })
    .CreateRegularButton({
        custom_id: `ViewAvatarBanner_${user.id}`,
        style: ButtonStyle.Secondary,
        label: "Banner"
    })
    .CreateLinkButton({
        custom_id: user.displayAvatarURL({ forceStatic: false, size: 4096 }),
        style: ButtonStyle.Link,
        label: "Copy URL"
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: `EditAvatarGlobalExtension_${user.id}_Default_4096`,
        select_options: [
            {
                label: "Extension • Default",
                value: "Default",
                default: true
            },
            {
                label: "JPG",
                value: "jpg"
            },
            {
                label: "PNG",
                value: "png"
            },
            {
                label: "WEBP",
                value: "webp"
            }
        ],
        placeholder: "Change Extension?"
    }).BuildActionRow();

    const action_row_three = new StringSelectMenuBuilder({
        custom_id: `EditAvatarGlobalSize_${user.id}_Default_4096`,
        select_options: [
            {
                label: "Size • 4096",
                value: "4096",
                default: true
            },
            {
                label: "2048",
                value: "2048"
            },
            {
                label: "1024",
                value: "1024"
            },
            {
                label: "512",
                value: "512"
            },
            {
                label: "256",
                value: "256"
            },
            {
                label: "128",
                value: "128"
            },
            {
                label: "64",
                value: "64"
            },
            {
                label: "32",
                value: "32"
            },
            {
                label: "16",
                value: "16"
            }
        ],
        placeholder: "Change Size?"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two, action_row_three] });
};