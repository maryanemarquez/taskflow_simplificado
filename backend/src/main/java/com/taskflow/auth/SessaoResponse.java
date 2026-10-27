package com.taskflow.auth;

import java.time.Instant;

public record SessaoResponse(String tipo, String accessToken, Instant accessTokenExpiraEm) {
}
