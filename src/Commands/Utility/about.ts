import { ButtonBuilder, ChatInputCommandBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder } from "discord.js";
import { Blossom, Sentry } from "../../Core";
import { dependencies, devDependencies, version } from "../../../package.json"
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "about",
    description: "Provides information about Blossom",
    dm_permission: false
}).BuildCommand();

export async function run({ client, handler, interaction }: SlashCommandProps): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);

    const current_count = client.guilds.cache.map((x) => x.memberCount).reduce((a, b) => a + b, 0);

    const embed_one = new EmbedBuilder()
    .setThumbnail(client.user.avatarURL({ forceStatic: false, size: 4096 }))
    .setDescription(`Cosmos Portal presents to you ${client.user.username}, a multi-purpose Discord application.\n### ${client.user.username} Information\n- **Member Count** • ${current_count.toLocaleString()}\n- **Ping** • ${client.ws.ping}ms\n- **Uptime** • Online since <t:${Math.trunc(Math.floor((Date.now() - client.uptime) / 1000))}:D>\n### Version\n- **${client.user.username}** • v${version}\n- **@CosmosPortal/Blossom.Utils** • v${dependencies["@cosmosportal/blossom.utils"].replace(/^\^/g, "")}\n- **Discord.JS** • v${dependencies["discord.js"].replace(/^\^/g, "")}\n- **TypeScript** • v${devDependencies["typescript"].replace(/^\^/g, "")}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateLinkButton({
        custom_id: "https://discord.com/invite/starlight-cafe-706382255274328115",
        style: ButtonStyle.Link,
        label: "Community Server"
    })
    .CreateLinkButton({
        custom_id: "https://discord.gg/wtHFmdvGVC",
        style: ButtonStyle.Link,
        label: "Support Server"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal/blossom#readme",
        style: ButtonStyle.Link,
        label: "Documentation"
    }).BuildActionRow();

    return void await interaction.reply({ embeds: [embed_one], components: [action_row_one], ephemeral: true });
};