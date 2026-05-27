"""DPO (Data Protection Officer) contact detection check."""

from playwright.async_api import Page

from models.report import CheckResult

# Email prefixes that typically indicate a DPO / privacy contact.
_DPO_EMAIL_PREFIXES = [
    "dpo@",
    "privacidade@",
    "lgpd@",
    "protecaodedados@",
    "proteçãodedados@",
    "dataprotection@",
]

# Text snippets that indicate DPO information on the page.
_DPO_TEXT_KEYWORDS = [
    "encarregado de dados",
    "encarregado de proteção de dados",
    "data protection officer",
    "encarregado",  
    "dpo",
]


async def check_dpo_contact(page: Page) -> CheckResult:
    """Detect Data Protection Officer (DPO) contact information.

    The function uses two strategies:
    1. Scan ``mailto:`` links for email prefixes commonly used by DPOs.
    2. Search the visible page text for mentions of "DPO",
       "encarregado de dados", "data protection officer", etc.
    3. Look for dedicated links/pages about the DPO.

    Args:
        page: A Playwright Page that has already navigated to the target URL.

    Returns:
        A ``CheckResult`` with ``id='dpo_contact'``.
    """
    try:
        # Strategy 1 – mailto links with DPO-related prefixes
        mailto_links = await page.query_selector_all("a[href^='mailto:']")
        for link in mailto_links:
            href = (await link.get_attribute("href") or "").lower()
            for prefix in _DPO_EMAIL_PREFIXES:
                if prefix in href:
                    return CheckResult(
                        id="dpo_contact",
                        label="Contato do DPO",
                        passed=True,
                        evidence=f"Email de DPO encontrado: {href.replace('mailto:', '')}",
                    )

        # Strategy 2 – page text mentioning DPO
        body_text = await page.evaluate("() => document.body ? document.body.innerText.toLowerCase() : ''")
        for kw in _DPO_TEXT_KEYWORDS:
            if kw in body_text:
                # Grab a surrounding snippet for evidence
                idx = body_text.index(kw)
                start = max(0, idx - 60)
                end = min(len(body_text), idx + len(kw) + 60)
                snippet = body_text[start:end].replace("\n", " ").strip()
                return CheckResult(
                    id="dpo_contact",
                    label="Contato do DPO",
                    passed=True,
                    evidence=f"Menção ao DPO encontrada no texto: \"…{snippet}…\"",
                )

        # Strategy 3 – links pointing to DPO-related pages
        links = await page.query_selector_all("a")
        for link in links:
            href = (await link.get_attribute("href") or "").lower()
            text = (await link.inner_text() or "").strip().lower()
            combined = f"{href} {text}"
            for kw in _DPO_TEXT_KEYWORDS:
                if kw in combined:
                    return CheckResult(
                        id="dpo_contact",
                        label="Contato do DPO",
                        passed=True,
                        evidence=f"Link para DPO encontrado: texto='{text}', href='{href}'",
                    )

        return CheckResult(
            id="dpo_contact",
            label="Contato do DPO",
            passed=False,
            evidence="Nenhuma informação de contato do DPO encontrada na página.",
            fix_suggestion=(
                "Indique um Encarregado de Dados (DPO) conforme exige o Art. 41 da LGPD. "
                "Pode ser uma pessoa interna ou um serviço terceirizado. "
                "Publique o nome completo e email de contato (ex: privacidade@seudominio.com) "
                "na sua Política de Privacidade e em local de fácil acesso no site. "
                "A ausência de DPO identificado pode ser autuada diretamente pela ANPD."
            ),
        )

    except Exception as exc:
        return CheckResult(
            id="dpo_contact",
            label="Contato do DPO",
            passed=False,
            evidence=f"Erro ao verificar contato do DPO: {exc}",
        )
