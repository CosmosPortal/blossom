export enum ActionType {
    /**
     * Adds a ban to a user
     */
    BanAdd = "Ban Add",
    /**
     * Removes a ban from a user
     */
    BanRemove = "Ban Remove",
    /**
     * Adds a soft ban to a user
     */
    BanSoft = "Ban Soft",
    /**
     * Kicks a member
     */
    Kick = "Kick",
    /**
     * Adds a timeout to a member
     */
    TimeoutAdd = "Timeout Add",
    /**
     * Removes a timeout from a member
     */
    TimeoutRemove = "Timeout Remove",
    /**
     * Adds a warning to a member
     */
    WarnAdd = "Warn Add",
    /**
     * Removes a warning from a member
     */
    WarnRemove = "Warn Remove"
};