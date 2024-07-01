import type { BlossomID, Snowflake } from "../Types";

export interface TagCreation {
    /**
     * The snowflake to create the tag in
     */
    Snowflake: Snowflake;
    /**
     * The tag's content to show when used
     */
    Content: string;
    /**
     * The tag's creator's ID
     */
    CreatorID: Snowflake;
    /**
     * The tag's name
     */
    Name: string;
    /**
     * The tag's Blossom ID
     */
    BlossomID?: BlossomID;
    /**
     * The tag's creation timestamp
     */
    CreationTimestamp?: number;
    /**
     * Whether the tag can only be used by staff members
     */
    RequireStaffRole?: boolean;
    /**
     * The usage count of the tag
     */
    UsageCount?: number;
};