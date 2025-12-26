// ================================================================
// FILE: ReminderServiceImpl.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/service/impl/
// ================================================================

package com.eventzen.service.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventzen.entity.Event;
import com.eventzen.entity.Reminder;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.ReminderRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.service.ReminderService;

@Service
public class ReminderServiceImpl implements ReminderService {

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Override
    @Transactional
    public Reminder createReminder(Long userId, Long eventId) throws Exception {
        // Check if reminder already exists
        if (reminderRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new Exception("Reminder already set for this event");
        }

        // Fetch user and event
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        // Validate event is in future
        if (event.getStartDate().isBefore(LocalDate.now())) {
            throw new Exception("Cannot set reminder for past events");
        }

        // Create reminder
        Reminder reminder = new Reminder(user, event);
        return reminderRepository.save(reminder);
    }

    @Override
    public List<Reminder> getRemindersByUserId(Long userId) throws Exception {
        if (!userRepository.existsById(userId)) {
            throw new Exception("User not found");
        }
        return reminderRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void deleteReminder(Long reminderId, Long userId) throws Exception {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new Exception("Reminder not found"));

        // Verify ownership
        if (!reminder.getUser().getId().equals(userId)) {
            throw new Exception("You can only delete your own reminders");
        }

        reminderRepository.delete(reminder);
    }

    @Override
    public boolean hasReminder(Long userId, Long eventId) {
        return reminderRepository.existsByUserIdAndEventId(userId, eventId);
    }

    @Override
    @Transactional
    public void sendScheduledReminders() throws Exception {
        System.out.println("=== REMINDER SCHEDULER STARTED ===");
        
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Reminder> reminders = reminderRepository.findUnsentRemindersForDate(tomorrow);

        System.out.println("Found " + reminders.size() + " reminders to send for " + tomorrow);

        for (Reminder reminder : reminders) {
            try {
                sendReminderEmail(reminder);
                reminder.markAsSent();
                reminderRepository.save(reminder);
                System.out.println("Reminder sent for event: " + reminder.getEvent().getTitle());
            } catch (Exception e) {
                System.err.println("Failed to send reminder: " + e.getMessage());
            }
        }

        System.out.println("=== REMINDER SCHEDULER COMPLETED ===");
    }

    private void sendReminderEmail(Reminder reminder) throws Exception {
        User user = reminder.getUser();
        Event event = reminder.getEvent();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String subject = "Reminder: " + event.getTitle() + " is Tomorrow!";
        
        String body = String.format("""
            Dear %s,
            
            This is a friendly reminder that you have an event tomorrow:
            
            Event: %s
            Date: %s
            Time: %s - %s
            Location: %s
            
            We look forward to seeing you there!
            
            Best regards,
            EventZen Team
            """,
            user.getName(),
            event.getTitle(),
            event.getStartDate().format(dateFormatter),
            event.getStartTime().format(timeFormatter),
            event.getEndTime().format(timeFormatter),
            event.getLocation()
        );

        // TODO: Integrate with actual email service (Spring Mail, SendGrid, etc.)
        // For now, just log the email
        System.out.println("=== EMAIL SENT ===");
        System.out.println("To: " + user.getEmail());
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + body);
        System.out.println("==================");
    }
}