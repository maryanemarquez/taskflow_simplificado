package com.taskflow.auth.service;

import com.taskflow.auth.dto.SessaoResponse;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Emite e valida o JWT de acesso (HS256, 8 horas). Não há refresh token. */
@Service
public class JwtService {

    private static final Duration VALIDADE = Duration.ofHours(8);
    private static final String ALGORITMO = "HmacSHA256";
    private static final String TIPO_TOKEN = "Bearer";
    private static final Pattern SUB = Pattern.compile("\"sub\":\"(\\d+)\"");
    private static final Pattern EXP = Pattern.compile("\"exp\":(\\d+)");
    private static final String CABECALHO = codificar("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");

    private final Clock clock;
    private final String segredo;

    public JwtService(Clock clock, @Value("${taskflow.security.jwt.secret}") String segredo) {
        this.clock = clock;
        this.segredo = segredo;
    }

    public SessaoResponse emitir(long usuarioId) {
        Instant agora = clock.instant();
        Instant expiraEm = agora.plus(VALIDADE);
        String payload = codificar("{\"sub\":\"" + usuarioId + "\",\"iat\":"
                + agora.getEpochSecond() + ",\"exp\":" + expiraEm.getEpochSecond() + "}");
        String assinatura = assinar(CABECALHO + "." + payload);
        return new SessaoResponse(TIPO_TOKEN, CABECALHO + "." + payload + "." + assinatura, expiraEm);
    }

    /** Devolve o id do usuário do token ou lança {@code 401 NAO_AUTENTICADO}. */
    public long validar(String token) {
        try {
            String[] partes = token.split("\\.", -1);
            if (partes.length != 3 || !CABECALHO.equals(partes[0])) {
                throw naoAutenticado();
            }
            byte[] esperada = assinar(partes[0] + "." + partes[1]).getBytes(StandardCharsets.UTF_8);
            if (!MessageDigest.isEqual(esperada, partes[2].getBytes(StandardCharsets.UTF_8))) {
                throw naoAutenticado();
            }
            String payload = new String(Base64.getUrlDecoder().decode(partes[1]), StandardCharsets.UTF_8);
            Matcher sub = SUB.matcher(payload);
            Matcher exp = EXP.matcher(payload);
            if (!sub.find() || !exp.find() || Long.parseLong(exp.group(1)) <= clock.instant().getEpochSecond()) {
                throw naoAutenticado();
            }
            return Long.parseLong(sub.group(1));
        } catch (IllegalArgumentException erro) {
            throw naoAutenticado();
        }
    }

    private ErroDeAplicacao naoAutenticado() {
        return new ErroDeAplicacao(CodigoErroApi.NAO_AUTENTICADO);
    }

    private String assinar(String conteudo) {
        try {
            Mac mac = Mac.getInstance(ALGORITMO);
            mac.init(new SecretKeySpec(segredo.getBytes(StandardCharsets.UTF_8), ALGORITMO));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(conteudo.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException erro) {
            throw new IllegalStateException(erro);
        }
    }

    private static String codificar(String valor) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(valor.getBytes(StandardCharsets.UTF_8));
    }
}
