"""LGPD Scanner engine — orchestrates Playwright and all checks."""

import asyncio
from datetime import datetime, timezone

from playwright.async_api import async_playwright

from models.report import CheckResult, ScanReport
from scanner.checks.cookies import check_cookie_banner
from scanner.checks.dpo import check_dpo_contact
from scanner.checks.privacy import check_privacy_policy, check_terms_of_use
from scanner.checks.tracking import check_analytics_consent, check_tracking_consent

# Total number of checks; used for score calculation.
_TOTAL_CHECKS = 6


async def run_scan(url: str) -> ScanReport:
    
    """Run a full LGPD compliance scan against *url*.

    1. Launches a headless Chromium browser via Playwright.
    2. Sets up request interception to log every outgoing network request
       **before** any user interaction.
    3. Navigates to the URL and waits for the page to settle.
    4. Executes all six compliance checks.
    5. Calculates the overall score (each check has equal weight).
    6. Returns a ``ScanReport``.

    Args:
        url: The fully-qualified URL to scan.

    Returns:
        A ``ScanReport`` containing per-check results and an overall score.

    Raises:
        Exception: Propagated from Playwright if the browser cannot launch
            or the page fails to load entirely.
    """
    requests_log: list[str] = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            context = await browser.new_context(
                ignore_https_errors=True,
                user_agent=(
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
                ),
            )
            page = await context.new_page()

            # Intercept network requests to build the requests log.
            page.on(
                "request",
                lambda req: requests_log.append(req.url),
            )

            # Navigate to the target URL.
            await page.goto(url, wait_until="domcontentloaded", timeout=30_000)

            # Wait for the page to settle (networkidle or 10 s timeout).
            try:
                await page.wait_for_load_state("networkidle", timeout=10_000)
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(1500)  # aguarda lazy render
                await page.evaluate("window.scrollTo(0, 0)")  # volta pro topo
            except Exception:
                # Not all pages reach networkidle; that's fine.
                pass

            # --- Run all six checks ---
            results: list[CheckResult] = []

            # 1. Privacy policy
            results.append(await _safe_check(check_privacy_policy(page)))

            # 2. Terms of use
            results.append(await _safe_check(check_terms_of_use(page)))

            # 3. Cookie banner
            results.append(await _safe_check(check_cookie_banner(page)))

            # 4. Analytics consent (uses requests_log, not page)
            results.append(await _safe_check(check_analytics_consent(requests_log)))

            # 5. Tracking consent (uses requests_log, not page)
            results.append(await _safe_check(check_tracking_consent(requests_log)))

            # 6. DPO contact
            results.append(await _safe_check(check_dpo_contact(page)))

            # --- Calculate score ---
            passed_count = sum(1 for r in results if r.passed)
            score = round(passed_count * (100 / _TOTAL_CHECKS))

            return ScanReport(
                url=url,
                score=score,
                checks=results,
                scanned_at=datetime.now(timezone.utc),
            )
        finally:
            await browser.close()


async def _safe_check(coro) -> CheckResult:  # noqa: ANN001
    """Await *coro* and, if it raises, return a failed ``CheckResult``.

    This ensures that a single misbehaving check never crashes the
    entire scan.
    """
    try:
        return await coro
    except Exception as exc:
        return CheckResult(
            id="unknown",
            label="Verificação desconhecida",
            passed=False,
            evidence=f"Erro inesperado durante a verificação: {exc}",
        )
