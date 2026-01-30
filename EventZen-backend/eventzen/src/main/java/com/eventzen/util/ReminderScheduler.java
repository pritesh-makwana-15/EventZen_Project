// ================================================================
// FILE: ReminderScheduler.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/util/
// ================================================================

package com.eventzen.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.eventzen.service.ReminderService;

@Component
public class ReminderScheduler {

    @Autowired
    private ReminderService reminderService;

    /**
     * Scheduled job to send event reminders
     * Runs every day at 9:00 AM
     * Sends reminders for events happening tomorrow
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendDailyReminders() {
        try {
            System.out.println("Starting daily reminder job...");
            reminderService.sendScheduledReminders();
            System.out.println("Daily reminder job completed.");
        } catch (Exception e) {
            System.err.println("Error in reminder scheduler: " + e.getMessage());
            e.printStackTrace();
        }
    }
}