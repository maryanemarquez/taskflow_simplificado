package com.taskflow.erro;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class TratadorErroApi {

    private static final String PREFIXO_TIPO = "urn:taskflow:erro:";
    /** O Jackson cita o campo que falhou assim: {@code (through reference chain: Tipo["campo"])}. */
    private static final Pattern CAMPO_COM_FALHA = Pattern.compile("\\[\"([A-Za-z0-9_]{1,50})\"]\\)?\\s*$");

    private final RegistroEventos registro;

    public TratadorErroApi(RegistroEventos registro) {
        this.registro = registro;
    }

    /** Erros previstos, inclusive validações: registra só os de segurança. */
    @ExceptionHandler(ErroDeAplicacao.class)
    public ResponseEntity<ProblemDetail> tratarErroAplicacao(
            ErroDeAplicacao erro,
            HttpServletRequest requisicao) {
        EventoLog.deSeguranca(erro.codigo()).ifPresent(evento -> registro.registrar(
                evento, requisicao.getMethod(), requisicao.getRequestURI(), erro.codigo().name()));
        return criarResposta(erro.codigo(), requisicao.getRequestURI(), erro.erros());
    }

    /** Corpo ilegível ou com valor de tipo errado (ex.: data fora do padrão): aponta o campo, quando há. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetail> tratarCorpoIlegivel(
            HttpMessageNotReadableException erro,
            HttpServletRequest requisicao) {
        String campo = campoComFalha(erro);
        List<ErroCampo> erros = campo == null
                ? List.of()
                : List.of(new ErroCampo(campo, CodigoErroCampo.INVALIDO));
        return criarResposta(CodigoErroApi.VALIDACAO, requisicao.getRequestURI(), erros);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> tratarParametroInvalido(HttpServletRequest requisicao) {
        return criarResposta(CodigoErroApi.VALIDACAO, requisicao.getRequestURI(), List.of());
    }

    /**
     * Erros do próprio Spring MVC (rota inexistente, método ou tipo de conteúdo não aceito) trazem o
     * status correto; sem este tratamento eles cairiam no 500 genérico.
     */
    @ExceptionHandler(ServletException.class)
    public ResponseEntity<ProblemDetail> tratarErroDeRequisicao(
            ServletException erro,
            HttpServletRequest requisicao) {
        int status = erro instanceof ErrorResponse resposta ? resposta.getStatusCode().value() : 0;
        return CodigoErroApi.deRequisicaoMvc(status)
                .map(codigo -> criarResposta(codigo, requisicao.getRequestURI(), List.of()))
                .orElseGet(() -> tratarErroInesperado(erro, requisicao));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> tratarErroInesperado(
            Exception erro,
            HttpServletRequest requisicao) {
        registro.registrar(EventoLog.FALHA_INTERNA, requisicao.getMethod(), requisicao.getRequestURI(), erro);
        return criarResposta(CodigoErroApi.ERRO_INTERNO, requisicao.getRequestURI(), List.of());
    }

    private static String campoComFalha(Throwable erro) {
        for (Throwable atual = erro; atual != null; atual = atual.getCause()) {
            String mensagem = atual.getMessage();
            if (mensagem == null) {
                continue;
            }
            Matcher encontrado = CAMPO_COM_FALHA.matcher(mensagem.trim());
            if (encontrado.find()) {
                return encontrado.group(1);
            }
        }
        return null;
    }

    private ResponseEntity<ProblemDetail> criarResposta(
            CodigoErroApi codigo,
            String caminho,
            List<ErroCampo> erros) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(codigo.status(), codigo.detalhe());
        problema.setType(URI.create(PREFIXO_TIPO + codigo.name().toLowerCase(Locale.ROOT)));
        problema.setTitle(codigo.titulo());
        problema.setInstance(URI.create(caminho));
        problema.setProperty("codigo", codigo.name());
        problema.setProperty("mensagem", codigo.detalhe());
        if (!erros.isEmpty()) {
            problema.setProperty("erros", erros.stream().map(ErroCampo::paraResposta).toList());
        }
        return ResponseEntity.status(codigo.status())
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problema);
    }
}
