export enum AccountType {
    /**
     * Account has either been lost, deleted, or blacklisted
     */
    Unknown = 0,
    /**
     * Account is a member
     */
    Member = 1,
    /**
     * Account is a support team member
     */
    Support = 2,
    /**
     * Account is a developer team member
     */
    Developer = 3,
    /**
     * Account is an owner
     */
    Owner = 4,
    /**
     * Account is a guild
     */
    Guild = 5,
    /**
     * Account is a partner guild
     */
    PartnerGuild = 6,
    /**
     * Account is an official guild
     */
    OfficialGuild = 7
};