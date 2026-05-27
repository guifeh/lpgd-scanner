"""Cookie consent banner detection check."""

from playwright.async_api import Page

from models.report import CheckResult

# CSS selectors targeting common cookie-banner IDs and classes.
_COOKIE_SELECTORS = [
    "[id*='cookie' i]",
    "[class*='cookie' i]",
    "[id*='consent' i]",
    "[class*='consent' i]",
    "[id*='lgpd' i]",
    "[class*='lgpd' i]",
    "[id*='gdpr' i]",
    "[class*='gdpr' i]",
]

# Selectors for well-known cookie-consent platforms.
_PLATFORM_SELECTORS = [
    "#CybotCookiebotDialog",          # CookieBot
    "[class*='CookieBot' i]",
    "#onetrust-banner-sdk",            # OneTrust
    "[class*='onetrust' i]",
    "#cookieyes",                      # CookieYes
    "[class*='cookieyes' i]",
    "[class*='cc-banner' i]",          # Cookie Consent (Osano)
    "#cc-main",
    "[class*='cookie-notice' i]",      # Cookie Notice plugin
    "[id*='cookie-law-info' i]",       # Cookie Law Info (WP)
]

# Text snippets that typically appear inside a cookie banner.
_TEXT_KEYWORDS = [
    "cookies",
    "consentimento",
]


async def check_cookie_banner(page: Page) -> CheckResult:
    """Detect the presence of a cookie-consent banner or modal.

    The function uses three strategies:
    1. Common CSS selectors with ``cookie``, ``consent``, ``lgpd``, ``gdpr``
       in their id or class attributes.
    2. Platform-specific selectors for CookieBot, OneTrust, CookieYes, etc.
    3. Full-page text search for keywords like ``cookies`` or ``consentimento``
       inside elements that are visually styled as banners (``position: fixed``
       or ``position: sticky``).

    Args:
        page: A Playwright Page that has already navigated to the target URL.

    Returns:
        A ``CheckResult`` with ``id='cookie_banner'``.
    """
    try:
        # Strategy 1 – common selectors
        for selector in _COOKIE_SELECTORS:
            elements = await page.query_selector_all(selector)
            for el in elements:
                if await el.is_visible():
                    tag = await el.evaluate("e => e.tagName.toLowerCase()")
                    el_id = await el.get_attribute("id") or ""
                    el_class = await el.get_attribute("class") or ""
                    return CheckResult(
                        id="cookie_banner",
                        label="Banner de Cookies",
                        passed=True,
                        evidence=(
                            f"Banner detectado via seletor genérico: "
                            f"<{tag} id='{el_id}' class='{el_class}'>"
                        ),
                    )

        # Strategy 2 – known platforms
        for selector in _PLATFORM_SELECTORS:
            elements = await page.query_selector_all(selector)
            for el in elements:
                if await el.is_visible():
                    tag = await el.evaluate("e => e.tagName.toLowerCase()")
                    el_id = await el.get_attribute("id") or ""
                    el_class = await el.get_attribute("class") or ""
                    return CheckResult(
                        id="cookie_banner",
                        label="Banner de Cookies",
                        passed=True,
                        evidence=(
                            f"Banner de plataforma conhecida detectado: "
                            f"<{tag} id='{el_id}' class='{el_class}'>"
                        ),
                    )

        # Strategy 3 – text content in fixed/sticky positioned elements
        for kw in _TEXT_KEYWORDS:
            found = await page.evaluate(
                """(keyword) => {
                    const els = document.querySelectorAll('*');
                    for (const el of els) {
                        const style = window.getComputedStyle(el);
                        if (
                            (style.position === 'fixed' || style.position === 'sticky') &&
                            el.innerText &&
                            el.innerText.toLowerCase().includes(keyword)
                        ) {
                            return {
                                tag: el.tagName.toLowerCase(),
                                id: el.id || '',
                                className: el.className || '',
                                snippet: el.innerText.substring(0, 120),
                            };
                        }
                    }
                    return null;
                }""",
                kw,
            )
            if found:
                return CheckResult(
                    id="cookie_banner",
                    label="Banner de Cookies",
                    passed=True,
                    evidence=(
                        f"Elemento fixo com texto sobre cookies detectado: "
                        f"<{found['tag']} id='{found['id']}' "
                        f"class='{found['className']}'> — \"{found['snippet']}…\""
                    ),
                )

        return CheckResult(
            id="cookie_banner",
            label="Banner de Cookies",
            passed=False,
            evidence="Nenhum banner de cookies detectado na página.",
            fix_suggestion=(
                "Implemente um banner de consentimento que bloqueie scripts de terceiros até "
                "o usuário aceitar. Ferramentas gratuitas: CookieYes (cookieyes.com) ou Osano. "
                "O banner deve aparecer na primeira visita, listar quais cookies são usados "
                "e oferecer opção de recusar. Aceitar/recusar deve ser igualmente fácil — "
                "esconder o botão de recusa viola a LGPD."
            ),
        )

    except Exception as exc:
        return CheckResult(
            id="cookie_banner",
            label="Banner de Cookies",
            passed=False,
            evidence=f"Erro ao verificar banner de cookies: {exc}",
        )
