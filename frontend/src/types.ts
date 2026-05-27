export interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  evidence: string;
  fix_suggestion?: string | null;
}

export interface ScanReport {
  url: string;
  score: number;
  checks: CheckResult[];
  scanned_at: string;
}
