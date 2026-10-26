package com.taskflow.auth.dto;

import java.time.Instant;

public record SessaoResponse(String tipo, String accessToken, Instant accessTokenExpiraEm) {
}
