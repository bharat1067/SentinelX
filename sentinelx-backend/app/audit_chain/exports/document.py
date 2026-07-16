import os
from typing import Dict, Any
from app.audit_chain.models import ForensicPackage, VerificationReport

class AuditDocumentExporter:
    @staticmethod
    def generate_forensic_markdown(package: ForensicPackage) -> str:
        """
        Formats a complete forensic package into a clean markdown document.
        """
        md = []
        md.append(f"# SentinelX Forensic Evidence Archive: {package.package_id}")
        md.append(f"Generated Audit Record Slice: {len(package.audit_chain_slice)} linked blocks\n")

        md.append("## 1. Incident Executive Summary")
        md.append(package.incident_summary + "\n")

        md.append("## 2. Policy Decision Point Trace")
        md.append(package.decision_trace + "\n")

        md.append("## 3. Telemetry Timelines")
        md.append("### Risk Assessment Timeline")
        for line in package.risk_timeline:
            md.append(f"- {line}")
        md.append("")

        md.append("### Trust Assessment Timeline")
        for line in package.trust_timeline:
            md.append(f"- {line}")
        md.append("")

        md.append("### Response Playbook Execution Timeline")
        for line in package.execution_timeline:
            md.append(f"- {line}")
        md.append("\n")

        md.append("## 4. Cryptographic Chained Audit Ledger Slice")
        md.append("| Index | Timestamp | Event ID | Trust | Risk | Hash Link | Quantum Signature | PQC Algorithm |")
        md.append("|---|---|---|---|---|---|---|---|")
        for rec in package.audit_chain_slice:
            hash_short = f"{rec.current_hash[:8]}...{rec.current_hash[-8:]}"
            sig_short = f"{rec.quantum_signature[:12]}..."
            md.append(f"| {rec.index} | {rec.timestamp} | {rec.event_id} | {rec.trust_score} | {rec.risk_score} | `{hash_short}` | `{sig_short}` | `{rec.algorithm_marker}` |")

        return "\n".join(md)

    @staticmethod
    def export_to_file(content: str, filename: str, directory: str = "app/decision_trace/exports") -> str:
        """
        Writes the string content out to a file, creating directory folders if needed.
        """
        os.makedirs(directory, exist_ok=True)
        file_path = os.path.join(directory, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[AUDIT-EXPORTER] Exported file out to: {file_path}")
        return file_path
