"""Tracking and analytics consent checks.

These checks inspect the *network requests log* captured **before** any user
interaction to determine whether analytics or tracking scripts are loaded
without explicit consent — a violation of LGPD/GDPR best practices.

``passed=True``  → GOOD – no unauthorised tracking detected.
``passed=False`` → BAD  – tracking scripts loaded before consent.
"""

from models.report import CheckResult

# ---------------------------------------------------------------------------
# Domain / path patterns
# ---------------------------------------------------------------------------

_ANALYTICS_PATTERNS: list[str] = [
    "google-analytics.com",
    "googletagmanager.com",
    "/gtag/",
    "analytics.google.com",
]

_TRACKER_PATTERNS: list[str] = [
    # Sentry
    "sentry.io",
    "browser.sentry-cdn.com",
    # Hotjar
    "hotjar.com",
    "static.hotjar.com",
    # Facebook Pixel
    "facebook.net/tr",
    "connect.facebook.net",
    # Mixpanel
    "mixpanel.com",
    "cdn.mxpnl.com",
    # Amplitude
    "amplitude.com",
    "cdn.amplitude.com",
]


def _match_patterns(requests_log: list[str], patterns: list[str]) -> list[str]:
    """Return the subset of *requests_log* URLs that match any pattern."""
    matched: list[str] = []
    for url in requests_log:
        url_lower = url.lower()
        for pattern in patterns:
            if pattern in url_lower:
                matched.append(url)
                break
    return matched


async def check_analytics_consent(
    requests_log: list[str],
) -> CheckResult:
    """Check if Google Analytics / GTM scripts loaded without consent.

    Args:
        requests_log: URLs of all network requests captured during the
            initial page load (before any user interaction).

    Returns:
        A ``CheckResult`` with ``id='analytics_consent'``.
        ``passed=True`` means no GA/GTM scripts were detected (good).
        ``passed=False`` means GA/GTM loaded automatically (bad).
    """
    try:
        matched = _match_patterns(requests_log, _ANALYTICS_PATTERNS)

        if matched:
            sample = matched[:5]
            return CheckResult(
                id="analytics_consent",
                label="Analytics sem Consentimento",
                passed=False,
                evidence=(
                    f"Scripts de analytics detectados no carregamento inicial — pode indicar ausência de consentimento "
                    f"({len(matched)} requisição(ões)): {', '.join(sample)}"
                ),
                fix_suggestion=(
                    "Mova o Google Analytics/GTM para carregar somente após consentimento explícito. "
                    "Se usa GTM: ative o Consent Mode v2 e configure a trigger 'Consent Initialization' "
                    "para bloquear tags de analytics por padrão. Se carrega o GA direto no HTML, "
                    "use a propriedade 'data-consent' e dispare o script via JavaScript somente "
                    "após o usuário aceitar cookies. Carregar GA antes do consent viola o Art. 7º da LGPD."
                ),
            )

        return CheckResult(
            id="analytics_consent",
            label="Analytics sem Consentimento",
            passed=True,
            evidence="Nenhum script de analytics detectado antes do consentimento.",
        )

    except Exception as exc:
        return CheckResult(
            id="analytics_consent",
            label="Analytics sem Consentimento",
            passed=False,
            evidence=f"Erro ao verificar analytics: {exc}",
        )


async def check_tracking_consent(
    requests_log: list[str],
) -> CheckResult:
    """Check if third-party tracking tools loaded without consent.

    Covers Sentry, Hotjar, Facebook Pixel, Mixpanel, and Amplitude.

    Args:
        requests_log: URLs of all network requests captured during the
            initial page load (before any user interaction).

    Returns:
        A ``CheckResult`` with ``id='tracking_consent'``.
        ``passed=True`` means no trackers detected (good).
        ``passed=False`` means trackers loaded automatically (bad).
    """
    try:
        matched = _match_patterns(requests_log, _TRACKER_PATTERNS)

        if matched:
            sample = matched[:5]
            return CheckResult(
                id="tracking_consent",
                label="Rastreadores sem Consentimento",
                passed=False,
                evidence=(
                    f"Rastreadores detectados no carregamento inicial sem evidência de consentimento prévio "
                    f"({len(matched)} requisição(ões)): {', '.join(sample)}"
                ),
                fix_suggestion=(
                    "Ferramentas de monitoramento e rastreamento devem carregar somente após consent. "
                    "Para o Sentry: adicione 'beforeSend' para filtrar dados pessoais e mova a "
                    "inicialização para depois do consentimento. "
                    "Para Facebook Pixel e Hotjar: carregue via GTM com trigger de consentimento ou "
                    "condicionalmente via JavaScript. "
                    "Dados de comportamento do usuário são dados pessoais sob a LGPD — "
                    "coletar sem base legal configura infração."
                ),
            )

        return CheckResult(
            id="tracking_consent",
            label="Rastreadores sem Consentimento",
            passed=True,
            evidence="Nenhum rastreador detectado antes do consentimento.",
        )

    except Exception as exc:
        return CheckResult(
            id="tracking_consent",
            label="Rastreadores sem Consentimento",
            passed=False,
            evidence=f"Erro ao verificar rastreadores: {exc}",
        )
