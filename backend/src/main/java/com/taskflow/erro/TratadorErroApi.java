package com.taskflow.erro;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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

    private static final int STATUS_NAO_ENCONTRADO = 404;
    private static final int STATUS_METODO_NAO_PERMITIDO = 405;
    private static final int STATUS_TIPO_NAO_SUPORTADO = 415;
    private static final int STATUS_REQUISICAO_INVALIDA = 400;
    /** O Jackson cita o campo que falhou assim: {@code (through reference chain: Tipo["campo"])}. */
    private static final Pattern CAMPO_COM_FALHA = Pattern.compile("\\[\"([A-Za-z0-9_]{1,50})\"]\\)?\\s*$");

    private final LoggingCentralizado logging;

    public TratadorErroApi(LoggingCentralizado logging) {
        this.logging = logging;
    }

    @ExceptionHandler(ErroDeAplicacao.class)
    public ResponseEntity<ProblemDetail> tratarErroAplicacao(
            ErroDeAplicacao erro,
            HttpServletRequest requisicao) {
        return criarResposta(erro.codigo(), requisicao.getRequestURI(), null);
    }

    @ExceptionHandler(ErroValidacao.class)
    public ResponseEntity<ProblemDetail> tratarErroValidacao(
            ErroValidacao erro,
            HttpServletRequest requisicao) {
        return criarResposta(
                CodigoErroApi.VALIDACAO,
                requisicao.getRequestURI(),
                List.of(MensagensApi.campo(erro.campo(), erro.codigoCampo())));
    }

    /** Corpo ilegível ou com valor de tipo errado (ex.: data fora do padrão): aponta o campo, quando há. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetail> tratarCorpoIlegivel(
            HttpMessageNotReadableException erro,
            HttpServletRequest requisicao) {
        String campo = campoComFalha(erro);
        List<Map<String, String>> erros = campo == null
                ? null
                : List.of(MensagensApi.campo(campo, MensagensApi.CODIGO_INVALIDO));
        return criarResposta(CodigoErroApi.VALIDACAO, requisicao.getRequestURI(), erros);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> tratarParametroInvalido(HttpServletRequest requisicao) {
        return criarResposta(CodigoErroApi.VALIDACAO, requisicao.getRequestURI(), null);
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
        CodigoErroApi codigo = switch (status) {
            case STATUS_NAO_ENCONTRADO -> CodigoErroApi.ROTA_NAO_ENCONTRADA;
            case STATUS_METODO_NAO_PERMITIDO -> CodigoErroApi.METODO_NAO_PERMITIDO;
            case STATUS_TIPO_NAO_SUPORTADO -> CodigoErroApi.TIPO_CONTEUDO_NAO_SUPORTADO;
            case STATUS_REQUISICAO_INVALIDA -> CodigoErroApi.VALIDACAO;
            default -> null;
        };
        if (codigo == null) {
            return tratarErroInesperado(erro, requisicao);
        }
        return criarResposta(codigo, requisicao.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> tratarErroInesperado(
            Exception erro,
            HttpServletRequest requisicao) {
        logging.registrarFalhaInterna(erro);
        return criarResposta(CodigoErroApi.ERRO_INTERNO, requisicao.getRequestURI(), null);
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
            List<Map<String, String>> erros) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(codigo.status(), codigo.detalhe());
        problema.setType(URI.create(MensagensApi.PREFIXO_TIPO + codigo.codigo().toLowerCase(Locale.ROOT)));
        problema.setTitle(codigo.titulo());
        problema.setInstance(URI.create(caminho));
        problema.setProperty("codigo", codigo.codigo());
        problema.setProperty("mensagem", codigo.detalhe());
        if (erros != null) {
            problema.setProperty("erros", erros);
        }
        return ResponseEntity.status(codigo.status())
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problema);
    }
}
