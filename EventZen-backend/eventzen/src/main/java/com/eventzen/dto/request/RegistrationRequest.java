package com.eventzen.dto.request;

import lombok.Data;

@Data
public class RegistrationRequest {
    private Long eventId;
    private Long visitorId;
    private String privateCode; // NEW FIELD for private events

    public Long getEventId() { 
        return eventId; 
    }
    
    public void setEventId(Long eventId) { 
        this.eventId = eventId; 
    }

    public Long getVisitorId() { 
        return visitorId; 
    }
    
    public void setVisitorId(Long visitorId) { 
        this.visitorId = visitorId; 
    }

    public String getPrivateCode() { 
        return privateCode; 
    }
    
    public void setPrivateCode(String privateCode) { 
        this.privateCode = privateCode; 
    }
}