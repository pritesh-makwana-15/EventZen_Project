// ================================================================
// FILE: ReminderService.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/service/
// ================================================================

package com.eventzen.service;

import java.util.List;

import com.eventzen.entity.Reminder;

public interface ReminderService {
    
    Reminder createReminder(Long userId, Long eventId) throws Exception;
    
    List<Reminder> getRemindersByUserId(Long userId) throws Exception;
    
    void deleteReminder(Long reminderId, Long userId) throws Exception;
    
    boolean hasReminder(Long userId, Long eventId);
    
    void sendScheduledReminders() throws Exception;
}