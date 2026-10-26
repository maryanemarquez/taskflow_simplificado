package com.taskflow.tempo;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.TimeZone;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(ConfiguracaoTempo.class)
class ClockUtcTest {

    @Autowired
    private Clock clock;

    @Test
    @DisplayName("HIST-001-fundacao/C05 - Clock padrão usa UTC")
    void clockPadraoUsaUtc() {
        assertThat(clock.getZone()).isEqualTo(ZoneOffset.UTC);
        assertThat(TimeZone.getDefault().toZoneId()).isEqualTo(ZoneId.of("UTC"));
    }
}
