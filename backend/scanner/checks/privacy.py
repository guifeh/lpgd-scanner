"""Privacy policy and terms of use checks."""

from playwright.async_api import Page

from models.report import CheckResult


async def check_privacy_policy(page: Page) -> CheckResult:
    """Check whether the page contains a link to a privacy policy.

    Searches all anchor elements for text or href matching common
    privacy-policy keywords in both Portuguese and English.  Also
    inspects the ``<footer>`` area specifically, since many sites
    place legal links there.

    Args:
        page: A Playwright Page that has already navigated to the target URL.

    Returns:
        A ``CheckResult`` with ``id='privacy_policy'``.
    """
    keywords = [
        "política de privacidade",
        "privacy policy",
        "privacidade",
        "proteção de dados", 
        "proteção de dados pessoais", 
        "/legal/",              
        "/privacy",
        "/privacidade",
    ]

    try:
        # Search all links on the page
        links = await page.query_selector_all("a")
        for link in links:
            text = (await link.inner_text() or "").strip().lower()
            href = (await link.get_attribute("href") or "").strip().lower()
            for kw in keywords:
                if kw in text or kw in href:
                    return CheckResult(
                        id="privacy_policy",
                        label="Política de Privacidade",
                        passed=True,
                        evidence=f"Link encontrado: texto='{text}', href='{href}'",
                    )

        # Also check footer area specifically
        footers = await page.query_selector_all("footer")
        for footer in footers:
            footer_links = await footer.query_selector_all("a")
            for link in footer_links:
                text = (await link.inner_text() or "").strip().lower()
                href = (await link.get_attribute("href") or "").strip().lower()
                for kw in keywords:
                    if kw in text or kw in href:
                        return CheckResult(
                            id="privacy_policy",
                            label="Política de Privacidade",
                            passed=True,
                            evidence=f"Link encontrado no footer: texto='{text}', href='{href}'",
                        )

        return CheckResult(
            id="privacy_policy",
            label="Política de Privacidade",
            passed=False,
            evidence="Nenhum link de política de privacidade encontrado na página.",
            fix_suggestion=(
                "Crie uma página dedicada (ex: /politica-de-privacidade) e adicione o link "
                "no footer do site. A política deve descrever: quais dados pessoais você coleta, "
                "a finalidade do tratamento, por quanto tempo armazena, com quem compartilha "
                "e como o usuário pode solicitar acesso, correção ou exclusão dos dados. "
                "Isso é obrigatório pelo Art. 9º da LGPD."
            ),
        )

    except Exception as exc:
        return CheckResult(
            id="privacy_policy",
            label="Política de Privacidade",
            passed=False,
            evidence=f"Erro ao verificar política de privacidade: {exc}",
        )


async def check_terms_of_use(page: Page) -> CheckResult:
    """Check whether the page contains a link to terms of use / service.

    Searches all anchor elements for text or href matching common
    terms-of-use keywords in both Portuguese and English.  Also
    inspects the ``<footer>`` area specifically.

    Args:
        page: A Playwright Page that has already navigated to the target URL.

    Returns:
        A ``CheckResult`` with ``id='terms_of_use'``.
    """
    keywords = [
        "termos de uso",
        "terms of use",
        "termos e condições",
        "terms of service",
    ]

    try:
        # Search all links on the page
        links = await page.query_selector_all("a")
        for link in links:
            text = (await link.inner_text() or "").strip().lower()
            href = (await link.get_attribute("href") or "").strip().lower()
            for kw in keywords:
                if kw in text or kw in href:
                    return CheckResult(
                        id="terms_of_use",
                        label="Termos de Uso",
                        passed=True,
                        evidence=f"Link encontrado: texto='{text}', href='{href}'",
                    )

        # Also check footer area specifically
        footers = await page.query_selector_all("footer")
        for footer in footers:
            footer_links = await footer.query_selector_all("a")
            for link in footer_links:
                text = (await link.inner_text() or "").strip().lower()
                href = (await link.get_attribute("href") or "").strip().lower()
                for kw in keywords:
                    if kw in text or kw in href:
                        return CheckResult(
                            id="terms_of_use",
                            label="Termos de Uso",
                            passed=True,
                            evidence=f"Link encontrado no footer: texto='{text}', href='{href}'",
                        )

        return CheckResult(
            id="terms_of_use",
            label="Termos de Uso",
            passed=False,
            evidence="Nenhum link de termos de uso encontrado na página.",
            fix_suggestion=(
                "Crie uma página de Termos de Uso (ex: /termos-de-uso) e adicione o link "
                "no footer. Os termos devem cobrir: regras de uso do serviço, limitação de "
                "responsabilidade, condições de cancelamento e foro de resolução de conflitos. "
                "Sem isso, qualquer disputa com usuário fica sem base contratual."
            ),
        )

    except Exception as exc:
        return CheckResult(
            id="terms_of_use",
            label="Termos de Uso",
            passed=False,
            evidence=f"Erro ao verificar termos de uso: {exc}",
        )
