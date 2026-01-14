/**
 * Determines if a new analysis should be requested based on the number of API messages.
 * 
 * @param messageCount The total number of bot messages in the current session.
 * @returns true if analysis should be triggered (every 2nd message: 2, 4, 6...)
 */
export const get_new_analysis = (messageCount: number): boolean => {
    // Trigger on every 2nd message (2, 4, 6, 8...)
    return messageCount > 0 && messageCount % 2 === 0;
};
