import { ButtonBuilder, ChatInputCommandBuilder } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, ButtonStyle, EmbedBuilder } from "discord.js";
import { Blossom, CreateTag, DeleteEntity, FindOneEntity, FindTag, FormatTag, Sentry, TagSystem, UpdateEntity } from "../../Core";
import type { AutocompleteProps, CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "tags",
    description: "View, manage, or get a list of tags",
    options: [
        {
            name: "create",
            description: "Create a tag",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "The name for the tag to create",
                    type: ApplicationCommandOptionType.String,
                    max_length: 32,
                    min_length: 2,
                    required: true
                },
                {
                    name: "content",
                    description: "The content to show when the tag is used",
                    type: ApplicationCommandOptionType.String,
                    max_length: 1000,
                    required: true
                },
                {
                    name: "staff_only",
                    description: "If true, only staff member's can use the tag",
                    type: ApplicationCommandOptionType.Boolean
                }
            ]
        },
        {
            name: "delete",
            description: "Deletes a tag",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "The name for the tag to delete",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    max_length: 32,
                    min_length: 2,
                    required: true
                }
            ]
        },
        {
            name: "list",
            description: "List all of the server's tags",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "staff_only",
                    description: "If true, shows all tags only staff members can use",
                    type: ApplicationCommandOptionType.Boolean
                }
            ]
        },
        {
            name: "modify",
            description: "Modify a tag",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "The name for the tag to modify",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    max_length: 32,
                    min_length: 2,
                    required: true
                },
                {
                    name: "content",
                    description: "The content to show when the tag is used",
                    type: ApplicationCommandOptionType.String,
                    max_length: 1000,
                    required: true
                },
                {
                    name: "staff_only",
                    description: "If true, only staff member's can use the tag",
                    type: ApplicationCommandOptionType.Boolean
                }
            ]
        },
        {
            name: "view",
            description: "viw a tag information",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "The name for the tag to view",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    max_length: 32,
                    min_length: 2,
                    required: true
                }
            ]
        }
    ],
    dm_permission: false
}).BuildCommand();

export async function run({ client, handler, interaction }: SlashCommandProps): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    if (interaction.options.getSubcommand() === "create") {
        const tag_name = interaction.options.getString("name", true);
        const tag_system = await FindOneEntity(TagSystem, { Guild_ID: interaction.guild.id, Name: tag_name });

        if (tag_system) return void await Blossom.CreateInteractionError(interaction, `You cannot create the tag \`${tag_name}\` as it already exist in ${interaction.guild.name}.`);

        const creation_timestamp = Date.now();
        await CreateTag({
            Snowflake: interaction.guild.id,
            Content: interaction.options.getString("content", true),
            CreationTimestamp: creation_timestamp,
            CreatorID: interaction.user.id,
            Name: tag_name,
            RequireStaffRole: interaction.options.getBoolean("staff_only", false) ?? false
        });

        return void await interaction.followUp({ content: `The tag \`${tag_name}\` was created in **${interaction.guild.name}**!`, ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "delete") {
        const tag_name = interaction.options.getString("name", true);
        const tag_system = await FindOneEntity(TagSystem, { Guild_ID: interaction.guild.id, Name: tag_name });

        if (!tag_system) return void await Blossom.CreateInteractionError(interaction, `You cannot delete the tag \`${tag_name}\` as it doesn't exist in ${interaction.guild.name}.`);

        await DeleteEntity(TagSystem, { Guild_ID: interaction.guild.id, Name: tag_name });

        return void await interaction.followUp({ content: `The tag \`${tag_name}\` was deleted in **${interaction.guild.name}**!`, ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "list") {
        const tags = await FormatTag(interaction.guild.id, {
            staff_only: interaction.options.getBoolean("staff_only", false) ?? false
        });
        if (!tags) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} doesn't have any tags that exist.`);

        const embed_one = new EmbedBuilder()
        .setThumbnail(interaction.guild.iconURL({ forceStatic: false, size: 4096 }))
        .setDescription(tags)
        .setColor(Blossom.DefaultHex());

        const action_row_one = new ButtonBuilder()
        .CreateRegularButton({
            custom_id: "ExitTagsGuildList",
            style: ButtonStyle.Secondary,
            label: "Exit"
        })
        .CreateRegularButton({
            custom_id: "ExportTagsGuildData",
            style: ButtonStyle.Secondary,
            label: "Export Data"
        })
        .CreateRegularButton({
            custom_id: `ViewTagsGuildList_${interaction.options.getString("staff_only", false) ?? false}`,
            style: ButtonStyle.Secondary,
            label: `Show ${interaction.options.getBoolean("staff_only", false) ? "All" : "Staff Only"}`
        }).BuildActionRow();

        return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one], ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "modify") {
        const tag_name = interaction.options.getString("name", true);
        const tag_system = await FindOneEntity(TagSystem, { Guild_ID: interaction.guild.id, Name: tag_name });

        if (!tag_system) return void await Blossom.CreateInteractionError(interaction, `You cannot modify the tag \`${tag_name}\` as it doesn't exist in ${interaction.guild.name}.`);

        await UpdateEntity(TagSystem, { Guild_ID: interaction.guild.id, Name: tag_name }, {
            Content: interaction.options.getString("content", true),
            RequireStaffRole: interaction.options.getBoolean("staff_only", false) ?? false
        });

        return void await interaction.followUp({ content: `The tag \`${tag_name}\` was updated in **${interaction.guild.name}**!`, ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "view") {
        const tag_name = interaction.options.getString("name", true);
        const tag_system = await FindOneEntity(TagSystem, { Guild_ID: interaction.guild.id, Name: tag_name });

        if (!tag_system) return void await Blossom.CreateInteractionError(interaction, `You cannot view the tag \`${tag_name}\` as it doesn't exist in ${interaction.guild.name}.`);

        const creator = await client.users.fetch(tag_system.CreatorID).catch(() => { return undefined });

        const embed_one = new EmbedBuilder()
        .setTitle(`Tag | ${tag_system.Name}`)
        .setDescription(tag_system.Content)
        .setFields(
            { name: "Information", value: `- **Tag ID** • ${tag_system.BlossomID}\n- **Creation** • <t:${Math.trunc(Math.floor(tag_system.CreationTimestamp / 1000))}:D>\n- **Created By** • ${creator?.tag ?? "unknown"} [\`${tag_system.CreatorID}\`]\n- **Staff Only?** • ${tag_system.RequireStaffRole ? "Yes" : "No"}\n- **Usage Count** • ${tag_system.UsageCount.toLocaleString()}` }
        )
        .setColor(Blossom.DefaultHex());

        return void await interaction.followUp({ embeds: [embed_one], ephemeral: true });
    };
};

export async function autocomplete({ client, handler, interaction }: AutocompleteProps): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isAutocomplete()) return;

    if (interaction.options.getSubcommand() === "delete" || interaction.options.getSubcommand() === "modify" || interaction.options.getSubcommand() === "view") {
        const focused = interaction.options.getFocused();
        const tags = await FindTag(interaction.guild.id) as TagSystem[] | null;
        if (!tags) return;
        const filter_choices = tags.filter((tag) => tag.Name.startsWith(focused));
        const result = filter_choices.map((choice) => {
            return {
                name: `${choice.RequireStaffRole ? "[Staff Only] | " : ""}${choice.Name}`,
                value: choice.Name
            };
        });

        return void interaction.respond(result.slice(0, 25)).catch(() => {});
    };
};