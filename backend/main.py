"""LGPD Scanner API — FastAPI application entry-point."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.report import ScanReport, ScanRequest
from scanner.engine import run_scan

app = FastAPI(title="LGPD Scanner API")

# ---------------------------------------------------------------------------
# CORS – allow all origins during development
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://lgpd-scanner.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
async def health() -> dict[str, str]:
    """Simple health-check endpoint."""
    return {"status": "ok"}


@app.post("/scan", response_model=ScanReport)
async def scan(request: ScanRequest) -> ScanReport:
    """Run an LGPD compliance scan on the provided URL.

    Args:
        request: A ``ScanRequest`` containing the URL to scan.

    Returns:
        A ``ScanReport`` with per-check results and an overall score.

    Raises:
        HTTPException 400: If the URL is invalid or unreachable.
        HTTPException 500: If an unexpected error occurs during the scan.
    """
    url = str(request.url)

    try:
        report = await run_scan(url)
    except Exception as exc:
        error_msg = str(exc).lower()
        if "net::err" in error_msg or "timeout" in error_msg or "name_not_resolved" in error_msg:
            raise HTTPException(
                status_code=400,
                detail=f"Não foi possível acessar a URL fornecida: {exc}",
            ) from exc
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado durante o scan: {exc}",
        ) from exc

    return report
