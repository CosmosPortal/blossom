export enum ActionName {
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
     * Reports a message
     */
    MessageReport = "Message Report",
    /**
     * Adds a timeout to a member
     */
    TimeoutAdd = "Timeout Add",
    /**
     * Removes a timeout from a member
     */
    TimeoutRemove = "Timeout Remove",
    /**
     * Reports a user
     */
    UserReport = "User Report",
    /**
     * Adds a warning to a member
     */
    WarnAdd = "Warn Add",
    /**
     * Removes a warning from a member
     */
    WarnRemove = "Warn Remove",
    /**
     * Verbal warns a member
     */
    WarnVerbal = "Verbal Warn"
};