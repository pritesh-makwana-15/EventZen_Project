package com.eventzen.entity;

public enum Role {
    ADMIN("ADMIN"),
    ORGANIZER("ORGANIZER"),
    VISITOR("VISITOR");

    private final String name;

    Role(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}