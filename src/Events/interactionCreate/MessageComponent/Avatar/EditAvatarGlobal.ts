import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, Sentry, type AvatarExtension, type AvatarSize } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || !(interaction.customId.startsWith("EditAvatarGlobalExtension") || interaction.customId.startsWith("EditAvatarGlobalSize"))) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);

    const custom_id = interaction.customId.split("_");
    const extension = custom_id[0] === "EditAvatarGlobalExtension" ? interaction.values[0] : custom_id[2] as AvatarExtension;
    const size = Number(custom_id[0] === "EditAvatarGlobalSize" ? interaction.values[0] : custom_id[3]) as AvatarSize;
    const user = await client.users.fetch(custom_id[1]).catch(() => { return undefined });
    if (!user) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the user. The user either no longer exist or ${client.user.username} couldn't fetch the user.`);

    await interaction.deferUpdate();

    const avatar_url = user.displayAvatarURL({
        size: size,
        extension: extension === "Default" ? undefined : extension as Exclude<AvatarExtension, "Default">,
        forceStatic: extension === "Default" ? false : true
    });

    const embed_one = new EmbedBuilder()
    .setTitle(`${user.tag}'s Avatar`)
    .setDescription(`- **Extension** • ${extension}\n- **Size** • ${size}`)
    .setImage(avatar_url)
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
        custom_id: avatar_url,
        label: "Copy URL"
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: `EditAvatarGlobalExtension_${user.id}_${extension}_${size}`,
        select_options: [
            {
                label: `${extension === "Default" ? "Extension • " : ""}Default`,
                value: "Default",
                default: extension === "Default"
            },
            {
                label: `${extension === "jpg" ? "Extension • " : ""}JPG`,
                value: "jpg",
                default: extension === "jpg"
            },
            {
                label: `${extension === "png" ? "Extension • " : ""}PNG`,
                value: "png",
                default: extension === "png"
            },
            {
                label: `${extension === "webp" ? "Extension • " : ""}WEBP`,
                value: "webp",
                default: extension === "webp"
            }
        ],
        placeholder: "Change Extension?"
    }).BuildActionRow();

    const action_row_three = new StringSelectMenuBuilder({
        custom_id: `EditAvatarGlobalSize_${user.id}_${extension}_${size}`,
        select_options: [
            {
                label: `${size === 4096 ? "Size • " : ""}4096`,
                value: "4096",
                default: size === 4096
            },
            {
                label: `${size === 2048 ? "Size • " : ""}2048`,
                value: "2048",
                default: size === 2048
            },
            {
                label: `${size === 1024 ? "Size • " : ""}1024`,
                value: "1024",
                default: size === 1024
            },
            {
                label: `${size === 512 ? "Size • " : ""}512`,
                value: "512",
                default: size === 512
            },
            {
                label: `${size === 256 ? "Size • " : ""}256`,
                value: "256",
                default: size === 256
            },
            {
                label: `${size === 128 ? "Size • " : ""}128`,
                value: "128",
                default: size === 128
            },
            {
                label: `${size === 64 ? "Size • " : ""}64`,
                value: "64",
                default: size === 64
            },
            {
                label: `${size === 32 ? "Size • " : ""}32`,
                value: "32",
                default: size === 32
            },
            {
                label: `${size === 16 ? "Size • " : ""}16`,
                value: "16",
                default: size === 16
            }
        ],
        placeholder: "Change Size?"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two, action_row_three] });
};