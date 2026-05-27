"""Pydantic models for LGPD Scanner reports and requests."""

from datetime import datetime

from pydantic import BaseModel, HttpUrl


class CheckResult(BaseModel):
    """Result of a single LGPD compliance check."""

    id: str
    label: str
    passed: bool
    evidence: str
    fix_suggestion: str | None = None


class ScanReport(BaseModel):
    """Full scan report containing all check results and an overall score."""

    url: str
    score: int
    checks: list[CheckResult]
    scanned_at: datetime


class ScanRequest(BaseModel):
    """Incoming request payload for initiating a scan."""

    url: HttpUrl
