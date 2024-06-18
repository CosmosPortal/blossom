import { ButtonBuilder, ChatInputCommandBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, ButtonStyle, EmbedBuilder } from "discord.js";
import { Blossom, Sentry } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "avatar",
    description: "Displays an avatar",
    options: [
        {
            name: "user",
            description: "The user to view the avatar of",
            type: ApplicationCommandOptionType.User
        }
    ],
    dm_permission: false
}).BuildCommand();

export async function run({ client, handler, interaction }: SlashCommandProps): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);

    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser("user", false) ?? interaction.user;

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

    return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one, action_row_two, action_row_three], ephemeral: true });
};